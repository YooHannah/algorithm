package admin

import (
	"fmt"
	"mall/api"
	"mall/common"
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
	fmt.Println("api CreateUser req", req)
	// userId, errno := c.user.CreateUser(ctx.Request.Context(), user, req)
	// api.WriteResp(ctx, map[string]int64{
	// 	"id": userId,
	// }, errno)
}

func (c *Ctrl) UpdateUser(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	fmt.Println("api UpdateUser user---", user)
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
