package goods

import (
	"context"
	"errors"
	"fmt"
	"time"

	"mall/adaptor/repo/goods"
	"mall/common"
	"mall/consts"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"

	"go.uber.org/zap"
)

// toErrno 区分业务校验错误（400 + 明确文案）与基础设施错误（DB 错误码）
func toErrno(err error) common.Errno {
	if err == nil {
		return common.OK
	}
	if errors.Is(err, goods.ErrCategoryNameEmpty) ||
		errors.Is(err, goods.ErrCategoryNotFound) ||
		errors.Is(err, goods.ErrCategoryParentInvalid) ||
		errors.Is(err, goods.ErrCategoryCycle) ||
		errors.Is(err, goods.ErrCategoryHasChildren) ||
		errors.Is(err, goods.ErrCategoryHasLessons) ||
		errors.Is(err, goods.ErrLessonNameEmpty) ||
		errors.Is(err, goods.ErrLessonVideoEmpty) ||
		errors.Is(err, goods.ErrLessonNotFound) ||
		errors.Is(err, goods.ErrLessonStatusInvalid) ||
		errors.Is(err, goods.ErrCourseNameEmpty) ||
		errors.Is(err, goods.ErrCourseCoverEmpty) ||
		errors.Is(err, goods.ErrCourseNotFound) ||
		errors.Is(err, goods.ErrCourseStatusInv) ||
		errors.Is(err, goods.ErrCatalogNameEmpty) ||
		errors.Is(err, goods.ErrCatalogNotFound) ||
		errors.Is(err, goods.ErrCatalogParentInvalid) ||
		errors.Is(err, goods.ErrCatalogLessonNotFound) {
		return common.NotOk.WithErr(err)
	}
	logger.Error("lesson db error", zap.Error(err))
	return common.DatabaseErr.WithErr(err)
}

func (s *Service) CreateLessonCategory(ctx context.Context, req *dto.CreateLessonCategoryReq) (int64, common.Errno) {
	id, err := s.lesson.CreateLessonCategory(ctx, &do.CreateLessonCategory{
		Name:     req.Name,
		ParentID: req.ParentID,
	})
	if err != nil {
		return 0, toErrno(err)
	}
	return id, common.OK
}

func (s *Service) UpdateLessonCategory(ctx context.Context, req *dto.UpdateLessonCategoryReq) common.Errno {
	err := s.lesson.UpdateLessonCategory(ctx, &do.UpdateLessonCategory{
		ID:       req.ID,
		Name:     req.Name,
		ParentID: req.ParentID,
	})
	return toErrno(err)
}

func (s *Service) DeleteLessonCategory(ctx context.Context, req *dto.DeleteLessonCategoryReq) common.Errno {
	err := s.lesson.DeleteLessonCategory(ctx, &do.DeleteLessonCategory{
		ID: req.ID,
	})
	return toErrno(err)
}

func (s *Service) ListLessonCategory(ctx context.Context, req *dto.ListLessonCategoryReq) (*dto.ListLessonCategoryResp, common.Errno) {
	resp, err := s.lesson.ListLessonCategory(ctx, &do.ListLessonCategory{
		Name:     req.Name,
		Page:     req.Page,
		PageSize: req.PageSize,
	})
	if err != nil {
		return nil, toErrno(err)
	}

	result := &dto.ListLessonCategoryResp{
		Total: resp.Total,
		List:  make([]*dto.LessonCategoryDto, 0, len(resp.List)),
	}
	for _, item := range resp.List {
		result.List = append(result.List, &dto.LessonCategoryDto{
			ID:       item.ID,
			Name:     item.Name,
			ParentID: item.ParentID,
			Sort:     item.Sort,
			Level:    item.Level,
		})
	}
	return result, common.OK
}

func (s *Service) UpdateLessonCategorySort(ctx context.Context, req *dto.UpdateLessonCategorySortReq) common.Errno {
	updateReq := make([]*do.UpdateLessonCategorySort, 0, len(req.List))
	for _, item := range req.List {
		updateReq = append(updateReq, &do.UpdateLessonCategorySort{
			ID:       item.ID,
			ParentID: item.ParentID,
			Sort:     item.Sort,
		})
	}
	if err := s.lesson.UpdateLessonCategorySort(ctx, updateReq); err != nil {
		return toErrno(err)
	}
	return common.OK
}

func (s *Service) ListLesson(ctx context.Context, req *dto.ListLessonReq) (*dto.ListLessonResp, common.Errno) {
	resp, err := s.lesson.ListLesson(ctx, &do.ListLesson{
		ID:          req.ID,
		Name:        req.Name,
		CategoryID:  req.CategoryID,
		UpdateStart: req.UpdateStart,
		UpdateEnd:   req.UpdateEnd,
		CreateStart: req.CreateStart,
		CreateEnd:   req.CreateEnd,
		Page:        req.Page,
		PageSize:    req.PageSize,
	})
	if err != nil {
		return nil, toErrno(err)
	}

	// 批量换取视频可播放地址
	keys := make([]string, 0, len(resp.List))
	for _, item := range resp.List {
		if item.VideoKey != "" {
			keys = append(keys, item.VideoKey)
		}
	}
	urlMap := map[string]string{}
	if len(keys) > 0 {
		urlMap, err = s.cos.GetPreviewUrl(ctx, &do.GetPreviewUrl{Keys: keys})
		if err != nil {
			logger.Error("ListLesson GetPreviewUrl error", zap.Error(err))
			urlMap = map[string]string{}
		}
	}

	list := make([]*dto.LessonDto, 0, len(resp.List))
	for _, item := range resp.List {
		chapters := make([]*dto.LessonChapter, 0, len(item.Chapters))
		for _, ch := range item.Chapters {
			chapters = append(chapters, &dto.LessonChapter{
				Name:  ch.Name,
				Begin: ch.Begin,
				End:   ch.End,
			})
		}
		attachments := make([]*dto.Attachment, 0, len(item.Attachments))
		for _, att := range item.Attachments {
			attachments = append(attachments, &dto.Attachment{
				OriginName: att.OriginName,
				FileKey:    att.FileKey,
			})
		}
		list = append(list, &dto.LessonDto{
			ID:            item.ID,
			Name:          item.Name,
			Intro:         item.Intro,
			CategoryID:    item.CategoryID,
			CategoryName:  item.CategoryName,
			VideoKey:      item.VideoKey,
			VideoURL:      urlMap[item.VideoKey],
			VideoFileName: item.VideoFileName,
			Duration:      item.Duration,
			Status:        item.Status,
			Attachments:   attachments,
			Chapters:      chapters,
			CreateBy:      item.CreateBy,
			CreateByName:  item.CreateByName,
			UpdateByName:  item.UpdateByName,
			CreateAt:      item.CreateAt.UnixMilli(),
			UpdateAt:      item.UpdateAt.UnixMilli(),
		})
	}
	return &dto.ListLessonResp{
		Total: resp.Total,
		List:  list,
	}, common.OK
}

func (s *Service) CreateLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.CreateLessonReq) (int64, common.Errno) {
	timeNow := time.Now()
	chapters := make([]*do.LessonChapter, 0, len(req.Chapters))
	for _, item := range req.Chapters {
		chapters = append(chapters, &do.LessonChapter{
			Name:  item.Name,
			Begin: item.Begin,
			End:   item.End,
		})
	}

	attachments := make([]*do.Attachment, 0, len(req.Attachments))
	for _, item := range req.Attachments {
		attachments = append(attachments, &do.Attachment{
			OriginName: item.OriginName,
			FileKey:    item.FileKey,
		})
	}
	fmt.Println("attachments-----", timeNow)
	id, err := s.lesson.CreateLesson(ctx, &do.CreateLesson{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Intro:         req.Intro,
		Attachments:   attachments,
		VideoKey:      req.VideoKey,
		VideoFileName: req.VideoFileName,
		Duration:      req.Duration,
		CreateBy:      adminUser.UserID,
		UpdateBy:      adminUser.UserID,
		Status:        consts.IsEnable,
		Chapters:      chapters,
		CreateAt:      timeNow,
		UpdateAt:      timeNow,
	})
	if err != nil {
		return 0, toErrno(err)
	}
	return id, common.OK
}

func (s *Service) UpdateLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateLessonReq) common.Errno {
	// 查出旧视频 key，用于更新成功后清理 COS 上被替换的旧视频
	var oldVideoKey string
	oldResp, err := s.lesson.ListLesson(ctx, &do.ListLesson{ID: req.ID, Page: 1, PageSize: 1})
	if err == nil && len(oldResp.List) > 0 {
		oldVideoKey = oldResp.List[0].VideoKey
	}

	chapters := make([]*do.LessonChapter, 0, len(req.Chapters))
	for _, item := range req.Chapters {
		chapters = append(chapters, &do.LessonChapter{
			Name:  item.Name,
			Begin: item.Begin,
			End:   item.End,
		})
	}
	attachments := make([]*do.Attachment, 0, len(req.Attachments))
	for _, item := range req.Attachments {
		attachments = append(attachments, &do.Attachment{
			OriginName: item.OriginName,
			FileKey:    item.FileKey,
		})
	}
	err = s.lesson.UpdateLesson(ctx, &do.UpdateLesson{
		ID:            req.ID,
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Intro:         req.Intro,
		Attachments:   attachments,
		VideoKey:      req.VideoKey,
		VideoFileName: req.VideoFileName,
		Duration:      req.Duration,
		Status:        req.Status,
		Chapters:      chapters,
		UpdateBy:      adminUser.UserID,
		UpdateAt:      time.Now(),
	})
	if err != nil {
		return toErrno(err)
	}

	// 视频被替换时，异步删除 COS 上的旧视频文件（删除失败不影响更新结果，仅记日志）
	if oldVideoKey != "" && oldVideoKey != req.VideoKey {
		if delErr := s.cos.DeleteFile(ctx, &do.DeleteFile{Keys: []string{oldVideoKey}}); delErr != nil {
			logger.Error("UpdateLesson delete old video error",
				zap.Error(delErr), zap.String("old_video_key", oldVideoKey))
		}
	}
	return common.OK
}

func (s *Service) UpdateLessonStatus(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateLessonStatusReq) common.Errno {
	err := s.lesson.UpdateLessonStatus(ctx, &do.UpdateLessonStatus{
		ID:       req.ID,
		Status:   req.Status,
		UpdateBy: adminUser.UserID,
		UpdateAt: time.Now(),
	})
	return toErrno(err)
}

func (s *Service) MoveLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.MoveLessonReq) common.Errno {
	err := s.lesson.MoveLesson(ctx, &do.MoveLesson{
		ID:         req.ID,
		CategoryID: req.CategoryID,
		UpdateBy:   adminUser.UserID,
		UpdateAt:   time.Now(),
	})
	return toErrno(err)
}

func (s *Service) DeleteLesson(ctx context.Context, req *dto.DeleteLessonReq) common.Errno {
	err := s.lesson.DeleteLesson(ctx, &do.DeleteLesson{
		ID: req.ID,
	})
	return toErrno(err)
}
