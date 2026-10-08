package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

// ListCourse 课程列表
func (c *Ctrl) ListCourse(ctx *gin.Context) {
	req := &dto.ListCourseReq{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.lesson.ListCourse(ctx.Request.Context(), req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}

// CreateCourse 新增课程
func (c *Ctrl) CreateCourse(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.CreateCourseReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	id, errno := c.lesson.CreateCourse(ctx.Request.Context(), user, req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, map[string]int64{"id": id}, common.OK)
}

// UpdateCourse 编辑课程
func (c *Ctrl) UpdateCourse(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateCourseReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateCourse(ctx.Request.Context(), user, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// UpdateCourseStatus 课程上架/下架
func (c *Ctrl) UpdateCourseStatus(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	req := &dto.UpdateCourseStatusReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateCourseStatus(ctx.Request.Context(), user, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// DeleteCourse 删除课程
func (c *Ctrl) DeleteCourse(ctx *gin.Context) {
	req := &dto.DeleteCourseReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.DeleteCourse(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}
