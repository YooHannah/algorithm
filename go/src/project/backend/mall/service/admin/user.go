package admin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"mall/adaptor/repo/model"
	"mall/common"
	"mall/consts"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"

	"github.com/go-redis/redis"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func (s *Service) CreateUser(ctx context.Context, adminUser *common.AdminUser, req *dto.CreateUserReq) (int64, common.Errno) {
	userID, err := s.adminUser.CreateUser(ctx, &do.CreateUser{
		AdminUserID: adminUser.UserID,
		Name:        req.Name,
		NickName:    req.NickName,
		Mobile:      req.Mobile,
		Sex:         req.Sex,
		RoleIDs:     req.RoleIDs,
	})
	if err != nil {
		logger.Error("CreateUser error", zap.Error(err), zap.Any("req", req))
		return 0, common.DatabaseErr.WithErr(err)
	}
	return userID, common.OK
}

func (s *Service) UpdateUser(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateUserReq) common.Errno {
	err := s.adminUser.UpdateUser(ctx, &do.UpdateUser{
		ID:          req.ID,
		Name:        req.Name,
		NickName:    req.NickName,
		Sex:         req.Sex,
		AdminUserID: adminUser.UserID,
		RoleIDs:     req.RoleIDs,
	})
	if err != nil {
		logger.Error("UpdateUser error", zap.Error(err), zap.Any("req", req))
		return common.DatabaseErr.WithErr(err)
	}
	return common.OK
}

func (s *Service) UpdateUserStatus(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateUserStatusReq) common.Errno {
	err := s.adminUser.UpdateUserStatus(ctx, &do.UpdateUserStatus{
		ID:          req.ID,
		Status:      req.Status,
		AdminUserID: adminUser.UserID,
	})
	if err != nil {
		logger.Error("UpdateUserStatus error", zap.Error(err), zap.Any("req", req))
		return common.DatabaseErr.WithErr(err)
	}
	return common.OK
}

func (s *Service) GetUserInfo(ctx context.Context, adminUser *common.AdminUser) (*dto.UserInfoResp, common.Errno) {
	user, err := s.adminUser.GetUserInfo(ctx, adminUser.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.UserNotFoundErr
		}
		logger.Error("GetUserInfo GetUserInfo error", zap.Error(err), zap.Any("user_id", adminUser.UserID))
		return nil, common.DatabaseErr.WithErr(err)
	}
	return &dto.UserInfoResp{
		UserID:     user.ID,
		Name:       user.Name,
		NickName:   user.NickName,
		Mobile:     user.Mobile,
		Sex:        user.Sex,
		Status:     user.Status,
		CreateAt:   user.CreateAt.UnixMilli(),
		UpdateAt:   user.UpdateAt.UnixMilli(),
		LarkOpenID: user.LarkOpenID,
	}, common.OK
}

// ListUser 管理员列表（分页 + 条件筛选）
func (s *Service) ListUser(ctx context.Context, req *dto.ListUserReq) (*dto.ListUserResp, common.Errno) {
	list, total, err := s.adminUser.ListUser(ctx, req.Name, req.NickName, req.Mobile, req.Status, req.Page, req.PageSize)
	if err != nil {
		logger.Error("ListUser error", zap.Error(err), zap.Any("req", req))
		return nil, common.DatabaseErr.WithErr(err)
	}
	items := make([]*dto.ListUserItem, 0, len(list))
	for _, u := range list {
		roleIDs, err := s.adminRole.GetRoleByUserID(ctx, u.ID)

		fmt.Print("ssss", roleIDs)
		if err != nil {
			logger.Error("ListUser GetRoleByUserID error", zap.Error(err), zap.Any("user_id", u.ID))
			continue
		}
		roles := make([]int64, 0, len(roleIDs))
		for _, roleID := range roleIDs {
			roles = append(roles, roleID.RoleID)
		}

		pureRoles, err := s.adminRole.GetRoleByRoleIDs(ctx, roles)
		if err != nil {
			logger.Error("ListUser GetRoleByRoleIDs error", zap.Error(err), zap.Any("user_id", u.ID))
			continue
		}

		roleIDlist := make([]dto.RoleItem, 0, len(pureRoles))
		for _, r := range pureRoles {
			roleIDlist = append(roleIDlist, dto.RoleItem{
				ID:   r.ID,
				Name: r.Name,
			})
		}
		items = append(items, &dto.ListUserItem{
			UserID:   u.ID,
			Name:     u.Name,
			NickName: u.NickName,
			Mobile:   u.Mobile,
			Sex:      u.Sex,
			Status:   u.Status,
			RoleIDs:  roleIDlist,
			CreateAt: u.CreateAt.UnixMilli(),
		})
	}
	return &dto.ListUserResp{List: items, Total: total}, common.OK
}

func (s *Service) GetUserByToken(ctx context.Context, token string) (*common.AdminUser, error) {
	userString, err := s.verify.GetAdminUserToken(ctx, token)
	if err != nil {
		logger.Error("GetUserByToken error", zap.Error(err))
		return nil, err
	}
	user := &common.AdminUser{}
	err = json.Unmarshal([]byte(userString), user)
	if err != nil {
		logger.Error("GetUserByToken json.Unmarshal error", zap.Error(err))
		return nil, err
	}
	return user, nil
}

// BindLark 已登录管理员用飞书 OAuth code 绑定飞书账号
func (s *Service) BindLark(ctx context.Context, adminUser *common.AdminUser, req *dto.BindLarkReq) (*dto.BindLarkResp, common.Errno) {
	// 1. code 换用户 access_token
	accessToken, errno := s.token.GetLarkUserAccessToken(ctx, req.AppCode, req.Code, req.RedirectUrl, "", false)
	if errno != common.OK {
		logger.Error("BindLark GetLarkUserAccessToken failed", zap.Error(errno))
		return nil, common.ServerErr.WithErr(errno)
	}

	// 2. access_token 换飞书用户信息（open_id）
	larkUser, err := s.lark.GetLarkUserInfo(ctx, accessToken.Token)
	if err != nil {
		logger.Error("BindLark GetLarkUserInfo failed", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}

	// 3. 校验该飞书是否已被其他管理员绑定（not found 表示尚未占用）
	exist, err := s.adminUser.GetUserByLarkOpenID(ctx, larkUser.OpenID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.Error("BindLark GetUserByLarkOpenID failed", zap.Error(err))
		return nil, common.DatabaseErr.WithErr(err)
	}
	if exist != nil && exist.ID != adminUser.UserID {
		return nil, common.ParamErr.WithMsg("该飞书账号已被其他管理员绑定")
	}

	// 4. 绑定到当前管理员
	if err := s.adminUser.UpdateUserLarkOpenID(ctx, adminUser.UserID, larkUser.OpenID); err != nil {
		logger.Error("BindLark UpdateUserLarkOpenID failed", zap.Error(err))
		return nil, common.DatabaseErr.WithErr(err)
	}

	return &dto.BindLarkResp{LarkOpenID: larkUser.OpenID}, common.OK
}

// UnBindLark 已登录管理员解除飞书账号绑定
func (s *Service) UnBindLark(ctx context.Context, adminUser *common.AdminUser) common.Errno {
	// 未绑定直接返回，避免无意义写库
	if adminUser.LarkOpenID == "" {
		return common.ParamErr.WithMsg("当前账号尚未绑定飞书")
	}
	// 清空当前管理员的 lark_open_id
	if err := s.adminUser.UpdateUserLarkOpenID(ctx, adminUser.UserID, ""); err != nil {
		logger.Error("UnBindLark UpdateUserLarkOpenID failed", zap.Error(err))
		return common.DatabaseErr.WithErr(err)
	}
	return common.OK
}

// Logout 管理员登出：删除 Redis 中当前 token
func (s *Service) Logout(ctx context.Context, token string) common.Errno {
	if err := s.verify.DelAdminUserToken(ctx, token); err != nil {
		logger.Error("Logout DelAdminUserToken failed", zap.Error(err))
		return common.RedisErr.WithErr(err)
	}
	return common.OK
}

// UpdatePassword 重置密码：已登录用户校验手机号与本人一致；未登录（忘记密码）按手机号查找用户。
func (s *Service) UpdatePassword(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdatePasswordReq) common.Errno {
	// 1. 参数校验
	if req.Mobile == "" || req.Code == "" || req.NewPassword == "" {
		return common.ParamErr.WithMsg("手机号、验证码和新密码不能为空")
	}
	if req.NewPassword != req.ConfirmPassword {
		return common.ParamErr.WithMsg("两次输入的新密码不一致")
	}

	// 2. 定位用户
	var user *model.AdminUser
	var err error
	if adminUser != nil {
		// 已登录：按当前用户 ID 查，再校验手机号一致，防止越权
		user, err = s.adminUser.GetUserInfo(ctx, adminUser.UserID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return common.UserNotFoundErr
			}
			logger.Error("UpdatePassword GetUserInfo failed", zap.Error(err))
			return common.DatabaseErr.WithErr(err)
		}
		if user.Mobile != req.Mobile {
			return common.ParamErr.WithMsg("手机号与当前账号不匹配")
		}
	} else {
		// 未登录（忘记密码）：直接按手机号查找
		user, err = s.adminUser.GetUserByMobile(ctx, req.Mobile)
		if err != nil {
			logger.Error("UpdatePassword GetUserByMobile failed", zap.Error(err))
			return common.DatabaseErr.WithErr(err)
		}
		if user == nil {
			return common.UserNotFoundErr
		}
		if user.Status != consts.IsEnable {
			return common.UserStatusErr
		}
	}

	// 3. 校验短信验证码（scene 与发送时一致：修改密码）
	cacheCode, err := s.verify.GetVerifyCode(ctx, req.Mobile, consts.SmsSceneChangePwd)
	if err != nil {
		if err == redis.Nil {
			return common.InvalidVerifyCodeErr
		}
		logger.Error("UpdatePassword GetVerifyCode failed", zap.Error(err))
		return common.RedisErr.WithErr(err)
	}
	if cacheCode != req.Code {
		return common.InvalidVerifyCodeErr
	}

	// 4. 更新密码并清除已使用的验证码
	if err := s.adminUser.UpdateUserPassword(ctx, &do.UpdateUserPassword{
		ID:       user.ID,
		Password: req.NewPassword,
	}); err != nil {
		logger.Error("UpdatePassword UpdateUserPassword failed", zap.Error(err))
		return common.DatabaseErr.WithErr(err)
	}
	_ = s.verify.DelVerifyCode(ctx, req.Mobile, consts.SmsSceneChangePwd)
	return common.OK
}
