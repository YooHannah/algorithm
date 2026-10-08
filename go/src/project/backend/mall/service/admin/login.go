package admin

import (
	"context"
	"fmt"
	"time"

	"mall/adaptor/rpc"
	"mall/common"
	"mall/consts"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"
	"mall/utils/tools"

	"github.com/go-redis/redis"
	"github.com/gogf/gf/util/gconv"
	"go.uber.org/zap"
)

func (s *Service) processToken(ctx context.Context, token string, userInfo *dto.UserInfoResp) common.Errno {
	err := s.verify.SetAdminUserToken(ctx, token, gconv.String(userInfo), consts.AdminUserTokenExpire)
	if err != nil {
		return common.RedisErr.WithErr(err)
	}
	return common.OK
}
func (s *Service) MobilePasswordLogin(ctx context.Context, req *dto.MobilePasswordLoginReq) (*dto.MobilePasswordLoginDtoResp, common.Errno) {
	if req.Ticket == "" {
		return nil, common.ParamErr.WithMsg("ticket is empty")
	}
	if req.Phone == "" {
		return nil, common.ParamErr.WithMsg("phone is empty")
	}
	if req.Password == "" {
		return nil, common.ParamErr.WithMsg("password is empty")
	}
	// 校验验证码
	ticket, err := s.verify.GetCaptchaTicket(ctx, req.Ticket)
	if err != nil {
		if err == redis.Nil {
			return nil, common.InvalidCaptchaErr
		}
		return nil, common.RedisErr.WithErr(err)
	}
	if ticket != req.Ticket {
		logger.Error("MobilePasswordLogin GetCaptchaTicket error", zap.Error(err))
		return nil, common.ParamErr.WithMsg("ticket is invalid")
	}

	// 校验手机号是否存在
	user, err := s.adminUser.GetUserByMobile(ctx, req.Phone)
	if err != nil {
		logger.Error("MobilePasswordLogin GetUserByMobile error", zap.Error(err))
		return nil, common.DatabaseErr.WithErr(err)
	}
	if user == nil {
		return nil, common.UserNotFoundErr
	}
	if user.Status != consts.IsEnable {
		return nil, common.UserStatusErr
	}
	// 密码错误，10分钟内不能重复登录超过3次
	incr, err := s.verify.IncPasswordErr(ctx, req.Phone, consts.AdminUserPassWrongErrExpire)

	if err != nil {

		logger.Error("MobilePasswordLogin IncPasswordErr error", zap.Error(err))
		return nil, common.RedisErr.WithErr(err)
	}
	if incr >= consts.AdminUserPassWrongErrCount {
		return nil, common.AdminUserPassWrongErr
	}
	if user.Password != req.Password {
		return nil, common.InvalidPasswordErr
	}

	s.verify.DelPasswordErr(ctx, req.Phone)
	token := tools.UUIDHex()

	userInfo := dto.UserInfoResp{
		UserID:     user.ID,
		Name:       user.Name,
		NickName:   user.NickName,
		Mobile:     user.Mobile,
		Sex:        user.Sex,
		Status:     user.Status,
		CreateAt:   user.CreateAt.UnixMilli(),
		UpdateAt:   user.UpdateAt.UnixMilli(),
		LarkOpenID: user.LarkOpenID,
	}

	// 登录成功，设置token到redis
	err = s.processToken(ctx, token, &userInfo)
	if err != common.OK {
		return nil, common.RedisErr.WithErr(err)
	}

	return &dto.MobilePasswordLoginDtoResp{
		Token: token,
		User:  userInfo,
	}, common.OK
}

func (s *Service) GetSmsVerifyCode(ctx context.Context, req *dto.GetSmsVerifyCodeReq) common.Errno {
	// 校验验证码
	ticket, err := s.verify.GetCaptchaTicket(ctx, req.Ticket)
	if err != nil {
		if err == redis.Nil {
			return common.InvalidCaptchaErr
		}
		return common.RedisErr.WithErr(err)
	}
	if ticket != req.Ticket {
		logger.Error("MobilePasswordLogin GetCaptchaTicket error", zap.Error(err))
		return common.ParamErr.WithMsg("ticket is invalid")
	}

	verifyCode := tools.GenValidateCode(6)
	tokenFun := func(ctx context.Context, force bool) (string, error) {
		token, errno := s.token.GetLarkTenantAccessToken(ctx, consts.LarkAppCode, force)
		if errno != common.OK {
			return "", common.ServerErr.WithErr(errno)
		}
		return token.TenantAccessToken, nil
	}
	err = s.lark.SendLarkMsg(ctx, tokenFun, &do.SendLarkMsg{
		AppCode: consts.LarkAppCode,
		OpenID:  s.conf.BizConf.LarkGroupID,
		IDType:  rpc.LarkChatGroupType,
		Content: fmt.Sprintf("%s 验证码：%s", req.Phone, verifyCode),
	})
	if err != nil {
		logger.Error("SendLarkMsg failed", zap.Error(err))
		return common.RedisErr.WithErr(err)
	}

	// 存储验证码到redis
	err = s.verify.SetVerifyCode(ctx, req.Phone, req.Scene, verifyCode, time.Minute*5)
	if err != nil {
		logger.Error("SetVerifyCode failed", zap.Error(err))
		return common.RedisErr.WithErr(err)
	}

	return common.OK
}

func (s *Service) MobilePhoneLogin(ctx context.Context, req *dto.MobilePhoneLoginReq) (*dto.MobilePhoneLoginDtoResp, common.Errno) {
	cacheVerifyCode, err := s.verify.GetVerifyCode(ctx, req.Phone, req.Scene)
	if err != nil {
		if err == redis.Nil {
			return nil, common.InvalidVerifyCodeErr
		}
		return nil, common.RedisErr.WithErr(err)
	}
	if cacheVerifyCode != req.VerifyCode {
		logger.Error("MobilePhoneLogin GetVerifyCode error", zap.Error(err))
		return nil, common.ParamErr.WithMsg("verify_code is invalid")
	}

	token := tools.UUIDHex()

	adminUser, err := s.adminUser.GetUserByMobile(ctx, req.Phone)
	if err != nil {
		logger.Error("MobilePhoneLogin GetUserByMobile error", zap.Error(err))
		return nil, common.DatabaseErr.WithErr(err)
	}
	if adminUser == nil {
		return nil, common.UserNotFoundErr
	}
	if adminUser.Status != consts.IsEnable {
		return nil, common.UserStatusErr
	}

	userInfo := dto.UserInfoResp{
		UserID:     adminUser.ID,
		Name:       adminUser.Name,
		NickName:   adminUser.NickName,
		Mobile:     adminUser.Mobile,
		Sex:        adminUser.Sex,
		Status:     adminUser.Status,
		CreateAt:   adminUser.CreateAt.UnixMilli(),
		UpdateAt:   adminUser.UpdateAt.UnixMilli(),
		LarkOpenID: adminUser.LarkOpenID,
	}

	// 登录成功，设置token到redis
	err = s.processToken(ctx, token, &userInfo)
	if err != common.OK {
		return nil, common.RedisErr.WithErr(err)
	}

	return &dto.MobilePhoneLoginDtoResp{
		Token: token,
		User:  userInfo,
	}, common.OK
}

func (s *Service) LarkQrLogin(ctx context.Context, req *dto.LarkQrLoginReq) (*dto.LarkQrLoginDtoResp, common.Errno) {
	AccessToken, err := s.token.GetLarkUserAccessToken(ctx, req.AppCode, req.Code, req.RedirectUrl, "", false)
	if err != common.OK {
		logger.Error("GetLarkUserAccessToken failed", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}

	LarkUserInfo, err := s.lark.GetLarkUserInfo(ctx, AccessToken.Token)
	if err != nil {
		logger.Error("GetLarkUserInfo failed", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}

	adminUser, err := s.adminUser.GetUserByLarkOpenID(ctx, LarkUserInfo.OpenID)
	if err != nil {
		logger.Error("GetUserByLarkOpenID failed", zap.Error(err))
		return nil, common.ServerErr.WithErr(err)
	}
	if adminUser == nil {
		return nil, common.UserNotFoundErr
	}
	if adminUser.Status != consts.IsEnable {
		return nil, common.UserStatusErr
	}
	token := tools.UUIDHex()

	userInfo := dto.UserInfoResp{
		UserID:     adminUser.ID,
		Name:       adminUser.Name,
		NickName:   adminUser.NickName,
		Mobile:     adminUser.Mobile,
		Sex:        adminUser.Sex,
		Status:     adminUser.Status,
		CreateAt:   adminUser.CreateAt.UnixMilli(),
		UpdateAt:   adminUser.UpdateAt.UnixMilli(),
		LarkOpenID: adminUser.LarkOpenID,
	}

	// 登录成功，设置token到redis
	err = s.processToken(ctx, token, &userInfo)

	if err != common.OK {
		return nil, common.RedisErr.WithErr(err)
	}

	return &dto.LarkQrLoginDtoResp{
		Token: token,
		User:  userInfo,
	}, common.OK
}
