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

/* ------------------------------ 目录 ------------------------------ */

func (s *Service) AddCatalog(ctx context.Context, adminUser *common.AdminUser, req *dto.AddCatalogReq) (*dto.AddCatalogResp, common.Errno) {
	goodsID := req.GoodsID
	// 课程尚未创建（新增页先配置目录）：后端自动建一条下架草稿课程，前端无需先调 create
	if goodsID <= 0 {
		now := time.Now()
		id, err := s.course.CreateCourse(ctx, &do.CreateCourse{
			Name:     "未命名课程",
			Status:   int32(consts.IsDisable),
			CreateBy: adminUser.UserID,
			UpdateBy: adminUser.UserID,
			CreateAt: now,
			UpdateAt: now,
		})
		if err != nil {
			return nil, toErrno(err)
		}
		goodsID = id
	}
	id, err := s.catalog.AddCatalog(ctx, &do.AddCatalog{
		GoodsID:  goodsID,
		ParentID: req.ParentID,
		Name:     req.Name,
		UpdateBy: adminUser.UserID,
	})
	if err != nil {
		return nil, toErrno(err)
	}
	return &dto.AddCatalogResp{ID: id, GoodsID: goodsID}, common.OK
}

func (s *Service) UpdateCatalog(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateCatalogReq) common.Errno {
	err := s.catalog.UpdateCatalog(ctx, &do.UpdateCatalog{
		ID:       req.ID,
		GoodsID:  req.GoodsID,
		Name:     req.Name,
		UpdateBy: adminUser.UserID,
	})
	return toErrno(err)
}

func (s *Service) DeleteCatalog(ctx context.Context, req *dto.DeleteCatalogReq) common.Errno {
	err := s.catalog.DeleteCatalog(ctx, &do.DeleteCatalog{ID: req.ID, GoodsID: req.GoodsID})
	return toErrno(err)
}

func (s *Service) SortCatalog(ctx context.Context, adminUser *common.AdminUser, req *dto.SortCatalogReq) common.Errno {
	list := make([]do.CatalogSortItem, 0, len(req.List))
	for _, item := range req.List {
		list = append(list, do.CatalogSortItem{ID: item.ID, Sort: item.Sort})
	}
	err := s.catalog.SortCatalog(ctx, &do.SortCatalog{
		GoodsID:  req.GoodsID,
		List:     list,
		UpdateBy: adminUser.UserID,
	})
	return toErrno(err)
}

/* ------------------------------ 目录-课时 ------------------------------ */

func (s *Service) AddCatalogLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.AddCatalogLessonReq) common.Errno {
	list := make([]*do.AddCatalogLesson, 0, len(req.LessonIDs))
	now := time.Now()
	for _, lessonID := range req.LessonIDs {
		list = append(list, &do.AddCatalogLesson{
			CourseGoodsID: req.GoodsID,
			CatalogID:     req.CatalogID,
			LessonID:      lessonID,
			ShowTime:      now,
			UpdateBy:      adminUser.UserID,
		})
	}
	err := s.catalog.AddLessons(ctx, list)
	return toErrno(err)
}

func (s *Service) RemoveCatalogLesson(ctx context.Context, req *dto.RemoveCatalogLessonReq) common.Errno {
	err := s.catalog.RemoveLesson(ctx, &do.RemoveCatalogLesson{ID: req.ID, GoodsID: req.GoodsID})
	return toErrno(err)
}

func (s *Service) UpdateCatalogLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateCatalogLessonReq) common.Errno {
	update := &do.UpdateCatalogLesson{
		ID:          req.ID,
		EnableTrial: req.EnableTrial,
		Sort:        req.Sort,
		UpdateBy:    adminUser.UserID,
	}
	if req.ShowTime > 0 {
		update.ShowTime = time.UnixMilli(req.ShowTime)
	}
	err := s.catalog.UpdateLesson(ctx, update)
	return toErrno(err)
}

func (s *Service) SortCatalogLesson(ctx context.Context, adminUser *common.AdminUser, req *dto.SortCatalogLessonReq) common.Errno {
	list := make([]do.CatalogLessonSortItem, 0, len(req.List))
	for _, item := range req.List {
		list = append(list, do.CatalogLessonSortItem{ID: item.ID, Sort: item.Sort})
	}
	err := s.catalog.SortLessons(ctx, &do.SortCatalogLesson{
		GoodsID:  req.GoodsID,
		List:     list,
		UpdateBy: adminUser.UserID,
	})
	return toErrno(err)
}

/* ------------------------------ 目录树 info ------------------------------ */

func (s *Service) CatalogInfo(ctx context.Context, req *dto.CatalogInfoReq) (*dto.CatalogInfoResp, common.Errno) {
	catalogs, err := s.catalog.ListCatalogByGoods(ctx, req.GoodsID)
	if err != nil {
		return nil, toErrno(err)
	}
	relations, err := s.catalog.ListRelationsByGoods(ctx, req.GoodsID)
	if err != nil {
		return nil, toErrno(err)
	}

	// 批量换取录播播放地址
	keys := make([]string, 0, len(relations))
	for _, rel := range relations {
		if rel.VideoKey != "" {
			keys = append(keys, rel.VideoKey)
		}
	}
	urlMap := map[string]string{}
	if len(keys) > 0 {
		urlMap, err = s.cos.GetPreviewUrl(ctx, &do.GetPreviewUrl{Keys: keys})
		if err != nil {
			logger.Error("CatalogInfo GetPreviewUrl error", zap.Error(err))
			urlMap = map[string]string{}
		}
	}

	// 节点索引：id -> dto
	nodeMap := make(map[int64]*dto.CatalogDto, len(catalogs))
	topics := make([]*dto.CatalogDto, 0)
	for _, c := range catalogs {
		node := &dto.CatalogDto{
			ID:       c.ID,
			ParentID: c.ParentID,
			Level:    c.Level,
			Name:     c.Name,
			Sort:     c.Sort,
			Children: make([]*dto.CatalogDto, 0),
			Lessons:  make([]*dto.CatalogLessonDto, 0),
		}
		nodeMap[c.ID] = node
	}

	// 组装两级树
	for _, c := range catalogs {
		node := nodeMap[c.ID]
		if c.Level == 1 || c.ParentID <= 0 {
			topics = append(topics, node)
		} else if parent, ok := nodeMap[c.ParentID]; ok {
			parent.Children = append(parent.Children, node)
		} else {
			// 父节点缺失时兜底挂到顶层
			topics = append(topics, node)
		}
	}

	// 课时挂到对应章节
	var totalDuration int64
	for _, rel := range relations {
		totalDuration += int64(rel.Duration)
		node, ok := nodeMap[rel.CatalogID]
		if !ok {
			continue
		}
		node.Lessons = append(node.Lessons, &dto.CatalogLessonDto{
			ID:           rel.ID,
			LessonID:     rel.LessonID,
			Name:         rel.LessonName,
			Duration:     rel.Duration,
			CategoryName: rel.CategoryName,
			VideoURL:     urlMap[rel.VideoKey],
			EnableTrial:  rel.EnableTrial,
			Sort:         rel.Sort,
			ShowTime:     rel.ShowTime.UnixMilli(),
		})
	}

	return &dto.CatalogInfoResp{
		GoodsID:       req.GoodsID,
		TotalDuration: totalDuration,
		List:          topics,
	}, common.OK
}
