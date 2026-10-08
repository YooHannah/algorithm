package admin

import (
	"context"
	"mall/api"
	"mall/common"
	"mall/consts"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

func (c *Ctrl) GetUserInfo(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	resp, errno := c.user.GetUserInfo(ctx.Request.Context(), user)
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) GetUserByToken(ctx context.Context, token string) (*common.AdminUser, error) {
	user, err := c.user.GetUserByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (c *Ctrl) CreateUser(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.CreateUserReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	userID, errno := c.user.CreateUser(ctx.Request.Context(), user, req)
	api.WriteResp(ctx, map[string]int64{
		"id": userID,
	}, errno)
}

// GetUserList 管理员列表（分页 + 条件筛选）
func (c *Ctrl) GetUserList(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.ListUserReq{}
	if err := ctx.BindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.user.ListUser(ctx.Request.Context(), req)
	api.WriteResp(ctx, resp, errno)
}

func (c *Ctrl) UpdateUser(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateUserReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	errno := c.user.UpdateUser(ctx.Request.Context(), user, req)
	api.WriteResp(ctx, nil, errno)
}

func (c *Ctrl) UpdateUserStatus(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateUserStatusReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	errno := c.user.UpdateUserStatus(ctx.Request.Context(), user, req)
	api.WriteResp(ctx, nil, errno)
}

// BindLark 已登录用户扫码后绑定飞书账号
func (c *Ctrl) BindLark(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.BindLarkReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.user.BindLark(ctx.Request.Context(), user, req)
	api.WriteResp(ctx, resp, errno)
}

// UnBindLark 已登录用户解除飞书账号绑定
func (c *Ctrl) UnBindLark(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	errno := c.user.UnBindLark(ctx.Request.Context(), user)
	api.WriteResp(ctx, nil, errno)
}

// Logout 管理员登出：使当前 token 失效
func (c *Ctrl) Logout(ctx *gin.Context) {
	token := ctx.GetHeader(consts.AdminTokenKey)
	if token == "" {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	errno := c.user.Logout(ctx.Request.Context(), token)
	api.WriteResp(ctx, nil, errno)
}

// UpdatePassword 重置密码：支持已登录（个人中心改密）与未登录（登录页忘记密码）两种场景。
func (c *Ctrl) UpdatePassword(ctx *gin.Context) {
	// 未登录时 user 为 nil，service 层按 req.Mobile 查找用户
	user := api.GetAdminUserFromCtx(ctx)
	req := &dto.UpdatePasswordReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	errno := c.user.UpdatePassword(ctx.Request.Context(), user, req)
	api.WriteResp(ctx, nil, errno)
}
