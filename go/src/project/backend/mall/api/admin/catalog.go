package admin

import (
	"mall/api"
	"mall/common"
	"mall/service/dto"

	"github.com/gin-gonic/gin"
)

// AddCatalog 新增课程目录（专题 / 章节）
func (c *Ctrl) AddCatalog(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.AddCatalogReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.lesson.AddCatalog(ctx.Request.Context(), adminUser, req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}

// UpdateCatalog 重命名课程目录
func (c *Ctrl) UpdateCatalog(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateCatalogReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateCatalog(ctx.Request.Context(), adminUser, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// DeleteCatalog 删除课程目录（专题会级联删除其章节及课时关联）
func (c *Ctrl) DeleteCatalog(ctx *gin.Context) {
	req := &dto.DeleteCatalogReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.DeleteCatalog(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// UpdateCatalogSort 课程目录排序
func (c *Ctrl) UpdateCatalogSort(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.SortCatalogReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.SortCatalog(ctx.Request.Context(), adminUser, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// CatalogInfo 课程目录树（含章节下的录播课时信息）
func (c *Ctrl) CatalogInfo(ctx *gin.Context) {
	req := &dto.CatalogInfoReq{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	resp, errno := c.lesson.CatalogInfo(ctx.Request.Context(), req)
	if errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, resp, common.OK)
}

// AddCatalogLesson 向章节批量添加录播
func (c *Ctrl) AddCatalogLesson(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.AddCatalogLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.AddCatalogLesson(ctx.Request.Context(), adminUser, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// RemoveCatalogLesson 移除章节下的录播
func (c *Ctrl) RemoveCatalogLesson(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.RemoveCatalogLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.RemoveCatalogLesson(ctx.Request.Context(), req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// UpdateCatalogLesson 更新课时设置（试听开关 / 显示时间 / 排序）
func (c *Ctrl) UpdateCatalogLesson(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.UpdateCatalogLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.UpdateCatalogLesson(ctx.Request.Context(), adminUser, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}

// SortCatalogLesson 章节内录播排序
func (c *Ctrl) SortCatalogLesson(ctx *gin.Context) {
	adminUser := api.GetAdminUserFromCtx(ctx)
	if adminUser == nil {
		api.WriteResp(ctx, nil, common.AuthErr)
		return
	}
	req := &dto.SortCatalogLessonReq{}
	if err := ctx.BindJSON(req); err != nil {
		api.WriteResp(ctx, nil, common.ParamErr.WithMsg(err.Error()))
		return
	}
	if errno := c.lesson.SortCatalogLesson(ctx.Request.Context(), adminUser, req); errno != common.OK {
		api.WriteResp(ctx, nil, errno)
		return
	}
	api.WriteResp(ctx, nil, common.OK)
}
