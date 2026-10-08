package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

// CreateLessonCategory 新增课程目录
func (c *Ctrl) CreateLessonCategory(ctx *gin.Context) {
	req := &dto.CreateLessonCategoryReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	id, errno := c.lesson.CreateLessonCategory(ctx.Request.Context(), req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, map[string]int64{
		"id": id,
	}, common.OK)
}

// UpdateLessonCategory 编辑课程目录（重命名 / 移动层级）
func (c *Ctrl) UpdateLessonCategory(ctx *gin.Context) {
	req := &dto.UpdateLessonCategoryReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateLessonCategory(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// DeleteLessonCategory 删除课程目录（存在子目录或录播内容时拒绝）
func (c *Ctrl) DeleteLessonCategory(ctx *gin.Context) {
	req := &dto.DeleteLessonCategoryReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.DeleteLessonCategory(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// ListLessonCategory 课程目录列表（GET，返回扁平列表，前端按 parent_id 组树）
func (c *Ctrl) ListLessonCategory(ctx *gin.Context) {
	req := &dto.ListLessonCategoryReq{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.lesson.ListLessonCategory(ctx.Request.Context(), req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}

// UpdateLessonCategorySort 批量保存目录排序 / 层级（POST）
func (c *Ctrl) UpdateLessonCategorySort(ctx *gin.Context) {
	req := &dto.UpdateLessonCategorySortReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateLessonCategorySort(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

func (c *Ctrl) ListLesson(ctx *gin.Context) {
	req := &dto.ListLessonReq{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.lesson.ListLesson(ctx.Request.Context(), req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}

func (c *Ctrl) CreateLesson(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.CreateLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	id, errno := c.lesson.CreateLesson(ctx.Request.Context(), user, req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, map[string]int64{
		"id": id,
	}, common.OK)
}

func (c *Ctrl) UpdateLesson(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateLesson(ctx.Request.Context(), user, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

func (c *Ctrl) UpdateLessonStatus(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateLessonStatusReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateLessonStatus(ctx.Request.Context(), user, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// MoveLesson 移动录播到指定目录
func (c *Ctrl) MoveLesson(ctx *gin.Context) {
	user := api.GetAdminUserFromCtx(ctx)
	if user == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.MoveLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.MoveLesson(ctx.Request.Context(), user, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

func (c *Ctrl) DeleteLesson(ctx *gin.Context) {
	req := &dto.DeleteLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.DeleteLesson(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}
