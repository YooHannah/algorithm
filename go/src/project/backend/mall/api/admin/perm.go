package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

func (c *Ctrl) GetPermAll(ctx *gin.Context) {
	list, err := c.perm.GetPermAll(ctx.Request.Context())
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, map[string]interface{}{
		"list": list,
	}, common.OK)
}

func (c *Ctrl) GetPermList(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	list, err := c.perm.GetPermList(ctx.Request.Context(), user.UserID)
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, map[string]interface{}{
		"list": list,
	}, common.OK)
}

func (c *Ctrl) CreatePerm(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.CreatePermissionReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	permID, err := c.perm.CreatePerm(ctx.Request.Context(), user, req)
	if err != common.OK {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, map[string]int64{
		"id": permID,
	}, common.OK)
}

func (c *Ctrl) UpdatePerm(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdatePermissionReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
	}
	err := c.perm.UpdatePerm(ctx.Request.Context(), user, req)
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

func (c *Ctrl) DeletePerm(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.DeletePermissionReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
	}
	err := c.perm.DeletePerm(ctx.Request.Context(), req.ID)
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}
