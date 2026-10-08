package goods

import (
	"context"
	"time"

	"mall/common"
	"mall/consts"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"

	"go.uber.org/zap"
)

func (s *Service) ListCourse(ctx context.Context, req *dto.ListCourseReq) (*dto.ListCourseResp, common.Errno) {
	resp, err := s.course.ListCourse(ctx, &do.ListCourse{
		ID:       req.ID,
		Name:     req.Name,
		Status:   req.Status,
		Page:     req.Page,
		PageSize: req.PageSize,
	})
	if err != nil {
		return nil, toErrno(err)
	}

	// 批量换取课程封面可访问地址
	keys := make([]string, 0, len(resp.List)*2)
	for _, item := range resp.List {
		if item.CoverKey != "" {
			keys = append(keys, item.CoverKey)
		}
	}
	urlMap := map[string]string{}
	if len(keys) > 0 {
		urlMap, err = s.cos.GetPreviewUrl(ctx, &do.GetPreviewUrl{Keys: keys})
		if err != nil {
			logger.Error("ListCourse GetPreviewUrl error", zap.Error(err))
			urlMap = map[string]string{}
		}
	}

	list := make([]*dto.CourseDto, 0, len(resp.List))
	for _, item := range resp.List {
		list = append(list, &dto.CourseDto{
			ID:             item.ID,
			Name:           item.Name,
			CoverKey:       item.CoverKey,
			CoverURL:       urlMap[item.CoverKey],
			DetailCoverKey: item.DetailCoverKey,
			Detail:         item.Detail,
			CoursePrice:    item.CoursePrice,
			ServiceTime:    item.ServiceTime,
			Status:         item.Status,
			Features:       item.Features,
			CreateBy:       item.CreateBy,
			CreateByName:   item.CreateByName,
			CreateAt:       item.CreateAt.UnixMilli(),
			UpdateBy:       item.UpdateBy,
			UpdateByName:   item.UpdateByName,
			UpdateAt:       item.UpdateAt.UnixMilli(),
		})
	}
	return &dto.ListCourseResp{Total: resp.Total, List: list}, common.OK
}

func (s *Service) CreateCourse(ctx context.Context, adminUser *common.AdminUser, req *dto.CreateCourseReq) (int64, common.Errno) {
	now := time.Now()
	// 默认上架；显式传 -1 时创建为草稿（课程目录先于基本信息保存）
	status := int32(consts.IsEnable)
	if req.Status == consts.IsDisable {
		status = int32(consts.IsDisable)
	}
	id, err := s.course.CreateCourse(ctx, &do.CreateCourse{
		Name:           req.Name,
		CoverKey:       req.CoverKey,
		DetailCoverKey: req.DetailCoverKey,
		Detail:         req.Detail,
		CoursePrice:    req.CoursePrice,
		ServiceTime:    req.ServiceTime,
		Status:         status,
		Features:       req.Features,
		CreateBy:       adminUser.UserID,
		UpdateBy:       adminUser.UserID,
		CreateAt:       now,
		UpdateAt:       now,
	})
	if err != nil {
		return 0, toErrno(err)
	}
	return id, common.OK
}

func (s *Service) UpdateCourse(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateCourseReq) common.Errno {
	// 查出旧封面 key，更新成功后清理被替换的旧封面图
	old, err := s.course.GetCourseByID(ctx, req.ID)
	if err != nil {
		return toErrno(err)
	}

	err = s.course.UpdateCourse(ctx, &do.UpdateCourse{
		ID:             req.ID,
		Name:           req.Name,
		CoverKey:       req.CoverKey,
		DetailCoverKey: req.DetailCoverKey,
		Detail:         req.Detail,
		CoursePrice:    req.CoursePrice,
		ServiceTime:    req.ServiceTime,
		Status:         req.Status,
		Features:       req.Features,
		UpdateBy:       adminUser.UserID,
		UpdateAt:       time.Now(),
	})
	if err != nil {
		return toErrno(err)
	}

	// 清理被替换的旧封面（列表封面 + 详情封面）
	delKeys := make([]string, 0, 2)
	if old.CoverKey != "" && old.CoverKey != req.CoverKey {
		delKeys = append(delKeys, old.CoverKey)
	}
	if old.DetailCoverKey != "" && old.DetailCoverKey != req.DetailCoverKey {
		delKeys = append(delKeys, old.DetailCoverKey)
	}
	if len(delKeys) > 0 {
		if delErr := s.cos.DeleteFile(ctx, &do.DeleteFile{Keys: delKeys}); delErr != nil {
			logger.Error("UpdateCourse delete old cover error",
				zap.Error(delErr), zap.Strings("keys", delKeys))
		}
	}
	return common.OK
}

func (s *Service) UpdateCourseStatus(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateCourseStatusReq) common.Errno {
	err := s.course.UpdateCourseStatus(ctx, &do.UpdateCourseStatus{
		ID:       req.ID,
		Status:   req.Status,
		UpdateBy: adminUser.UserID,
		UpdateAt: time.Now(),
	})
	return toErrno(err)
}

func (s *Service) DeleteCourse(ctx context.Context, req *dto.DeleteCourseReq) common.Errno {
	// 删除前查出封面 key，同步删除 COS 文件
	old, err := s.course.GetCourseByID(ctx, req.ID)
	if err != nil {
		return toErrno(err)
	}
	err = s.course.DeleteCourse(ctx, &do.DeleteCourse{ID: req.ID})
	if err != nil {
		return toErrno(err)
	}
	delKeys := make([]string, 0, 2)
	if old.CoverKey != "" {
		delKeys = append(delKeys, old.CoverKey)
	}
	if old.DetailCoverKey != "" {
		delKeys = append(delKeys, old.DetailCoverKey)
	}
	if len(delKeys) > 0 {
		if delErr := s.cos.DeleteFile(ctx, &do.DeleteFile{Keys: delKeys}); delErr != nil {
			logger.Error("DeleteCourse delete cover error",
				zap.Error(delErr), zap.Strings("keys", delKeys))
		}
	}
	return common.OK
}
