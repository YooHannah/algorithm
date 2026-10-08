package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetRoleList 角色列表（GET，query 绑定）
func (c *Ctrl) GetRoleList(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.GetRoleListReq{}
	if err := ctx.BindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	// 默认分页
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}
	list, total, err := c.role.GetRoleList(ctx.Request.Context(), user, req)
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr)
		return
	}
	api.WriteResp(ctx, map[string]interface{}{
		"list":  list,
		"total": total,
	}, common.OK)
}

// CreateRole 新增角色
func (c *Ctrl) CreateRole(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.CreateRoleReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	roleID, errno := c.role.CreateRole(ctx.Request.Context(), user, req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, map[string]int64{
		"id": roleID,
	}, common.OK)
}

// UpdateRole 编辑角色
func (c *Ctrl) UpdateRole(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateRoleReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if err := c.role.UpdateRole(ctx.Request.Context(), user, req); err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr.WithErr(err))
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

func (c *Ctrl) SetRolePerms(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.SetRolePermsReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if err := c.role.SetRolePerms(ctx.Request.Context(), user.UserID, req); err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr.WithErr(err))
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// GetRolePermSets 获取角色已分配的权限 ID 列表（GET ?role_id=）
func (c *Ctrl) GetRolePermSets(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	roleID, err := strconv.ParseInt(ctx.Query("role_id"), 10, 64)
	if err != nil || roleID <= 0 {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg("invalid role_id"))
		return
	}
	permIDs, err := c.role.GetRolePermSets(ctx.Request.Context(), roleID)
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr.WithErr(err))
		return
	}
	api.WriteResp(ctx, map[string]interface{}{
		"role_id":  roleID,
		"perm_ids": permIDs,
	}, common.OK)
}

func (c *Ctrl) GetMyRoles(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	roleList, err := c.role.GetMyRoles(ctx.Request.Context(), &dto.GetMyRolesReq{
		UserID: user.UserID,
	})
	if err != nil {
		api.WriteResp(ctx, nil, common.DatabaseErr.WithErr(err))
		return
	}
	api.WriteResp(ctx, roleList, common.OK)
}
