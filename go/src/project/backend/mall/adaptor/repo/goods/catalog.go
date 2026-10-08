package goods

import (
	"context"
	"errors"
	"strings"
	"time"

	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/service/do"

	"gorm.io/gorm"
)

// 课程目录业务校验错误
var (
	ErrCatalogNameEmpty      = errors.New("目录名称不能为空")
	ErrCatalogNotFound       = errors.New("课程目录不存在")
	ErrCatalogParentInvalid  = errors.New("上级目录不存在")
	ErrCatalogLessonNotFound = errors.New("课程课时不存在")
)

type ICourseCatalog interface {
	AddCatalog(ctx context.Context, req *do.AddCatalog) (int64, error)
	UpdateCatalog(ctx context.Context, req *do.UpdateCatalog) error
	DeleteCatalog(ctx context.Context, req *do.DeleteCatalog) error
	SortCatalog(ctx context.Context, req *do.SortCatalog) error

	ListCatalogByGoods(ctx context.Context, goodsID int64) ([]*model.CourseCatalog, error)
	ListRelationsByGoods(ctx context.Context, goodsID int64) ([]*CatalogLessonRow, error)

	AddLessons(ctx context.Context, list []*do.AddCatalogLesson) error
	RemoveLesson(ctx context.Context, req *do.RemoveCatalogLesson) error
	UpdateLesson(ctx context.Context, req *do.UpdateCatalogLesson) error
	SortLessons(ctx context.Context, req *do.SortCatalogLesson) error
}

// CatalogLessonRow 课程-录播关联联表查询结果
type CatalogLessonRow struct {
	model.CourseLesson
	LessonName   string `gorm:"column:lesson_name"`
	Duration     int32  `gorm:"column:duration"`
	VideoKey     string `gorm:"column:video_key"`
	CategoryName string `gorm:"column:category_name"`
}

type CourseCatalogRepo struct {
	db *gorm.DB
}

func NewCourseCatalog(adaptor adaptor.IAdaptor) *CourseCatalogRepo {
	return &CourseCatalogRepo{db: adaptor.GetDB()}
}

/* ------------------------------ 目录 ------------------------------ */

func (r *CourseCatalogRepo) AddCatalog(ctx context.Context, req *do.AddCatalog) (int64, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return 0, ErrCatalogNameEmpty
	}
	level := int32(1)
	parentID := int64(-1)
	if req.ParentID > 0 {
		parent := &model.CourseCatalog{}
		err := r.db.WithContext(ctx).
			Where("id = ? AND goods_id = ?", req.ParentID, req.GoodsID).
			First(parent).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return 0, ErrCatalogParentInvalid
			}
			return 0, err
		}
		level = parent.Level + 1
		parentID = parent.ID
	}

	var maxSort int64
	if err := r.db.WithContext(ctx).Model(&model.CourseCatalog{}).
		Where("goods_id = ? AND parent_id = ?", req.GoodsID, parentID).
		Select("COALESCE(MAX(sort), 0)").Scan(&maxSort).Error; err != nil {
		return 0, err
	}

	now := time.Now()
	data := &model.CourseCatalog{
		ParentID: parentID,
		Level:    level,
		Name:     name,
		GoodsID:  req.GoodsID,
		Sort:     maxSort + 1,
		UpdateAt: now,
		UpdateBy: req.UpdateBy,
	}
	if err := r.db.WithContext(ctx).Create(data).Error; err != nil {
		return 0, err
	}
	return data.ID, nil
}

func (r *CourseCatalogRepo) UpdateCatalog(ctx context.Context, req *do.UpdateCatalog) error {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return ErrCatalogNameEmpty
	}
	res := r.db.WithContext(ctx).Model(&model.CourseCatalog{}).
		Where("id = ? AND goods_id = ?", req.ID, req.GoodsID).
		Updates(map[string]interface{}{
			"name":      name,
			"update_at": time.Now(),
			"update_by": req.UpdateBy,
		})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrCatalogNotFound
	}
	return nil
}

func (r *CourseCatalogRepo) DeleteCatalog(ctx context.Context, req *do.DeleteCatalog) error {
	node := &model.CourseCatalog{}
	if err := r.db.WithContext(ctx).
		Where("id = ? AND goods_id = ?", req.ID, req.GoodsID).
		First(node).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCatalogNotFound
		}
		return err
	}

	ids := []int64{node.ID}
	if node.Level == 1 {
		if err := r.db.WithContext(ctx).Model(&model.CourseCatalog{}).
			Where("parent_id = ? AND goods_id = ?", node.ID, req.GoodsID).
			Pluck("id", &ids).Error; err != nil {
			return err
		}
		ids = append(ids, node.ID)
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("catalog_id IN ?", ids).
			Delete(&model.CourseLesson{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id IN ?", ids).
			Delete(&model.CourseCatalog{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *CourseCatalogRepo) SortCatalog(ctx context.Context, req *do.SortCatalog) error {
	if len(req.List) == 0 {
		return nil
	}
	ids := make([]int64, 0, len(req.List))
	for _, item := range req.List {
		ids = append(ids, item.ID)
	}
	var cnt int64
	if err := r.db.WithContext(ctx).Model(&model.CourseCatalog{}).
		Where("id IN ? AND goods_id = ?", ids, req.GoodsID).
		Count(&cnt).Error; err != nil {
		return err
	}
	if cnt != int64(len(ids)) {
		return ErrCatalogNotFound
	}
	now := time.Now()
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range req.List {
			if err := tx.Model(&model.CourseCatalog{}).
				Where("id = ?", item.ID).
				Updates(map[string]interface{}{
					"sort":      item.Sort,
					"update_at": now,
					"update_by": req.UpdateBy,
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *CourseCatalogRepo) ListCatalogByGoods(ctx context.Context, goodsID int64) ([]*model.CourseCatalog, error) {
	var list []*model.CourseCatalog
	err := r.db.WithContext(ctx).
		Where("goods_id = ?", goodsID).
		Order("sort ASC, id ASC").
		Find(&list).Error
	return list, err
}

/* ------------------------------ 课程-录播关联 ------------------------------ */

func (r *CourseCatalogRepo) ListRelationsByGoods(ctx context.Context, goodsID int64) ([]*CatalogLessonRow, error) {
	var rows []*CatalogLessonRow
	err := r.db.WithContext(ctx).
		Table("course_lessons AS cl").
		Joins("LEFT JOIN lessons AS l ON l.id = cl.lesson_id").
		Joins("LEFT JOIN lesson_category AS c ON c.id = l.category_id").
		Where("cl.course_goods_id = ?", goodsID).
		Select("cl.*, l.name AS lesson_name, l.duration AS duration, l.video_key AS video_key, c.name AS category_name").
		Order("cl.sort ASC, cl.id ASC").
		Scan(&rows).Error
	return rows, err
}

func (r *CourseCatalogRepo) AddLessons(ctx context.Context, list []*do.AddCatalogLesson) error {
	if len(list) == 0 {
		return nil
	}
	goodsID := list[0].CourseGoodsID
	catalogID := list[0].CatalogID
	lessonIDs := make([]int64, 0, len(list))
	for _, item := range list {
		lessonIDs = append(lessonIDs, item.LessonID)
	}

	// 同一课程下录播不可重复关联
	var existIDs []int64
	if err := r.db.WithContext(ctx).Model(&model.CourseLesson{}).
		Where("course_goods_id = ? AND lesson_id IN ?", goodsID, lessonIDs).
		Pluck("lesson_id", &existIDs).Error; err != nil {
		return err
	}
	existSet := make(map[int64]struct{}, len(existIDs))
	for _, id := range existIDs {
		existSet[id] = struct{}{}
	}

	var maxSort int32
	if err := r.db.WithContext(ctx).Model(&model.CourseLesson{}).
		Where("catalog_id = ?", catalogID).
		Select("COALESCE(MAX(sort), 0)").Scan(&maxSort).Error; err != nil {
		return err
	}

	now := time.Now()
	rows := make([]*model.CourseLesson, 0, len(list))
	for _, item := range list {
		if _, ok := existSet[item.LessonID]; ok {
			continue
		}
		maxSort++
		showTime := item.ShowTime
		if showTime.IsZero() {
			showTime = now
		}
		rows = append(rows, &model.CourseLesson{
			CourseGoodsID: goodsID,
			CatalogID:     catalogID,
			LessonID:      item.LessonID,
			EnableTrial:   0,
			Sort:          maxSort,
			ShowTime:      showTime,
			UpdateAt:      now,
			UpdateBy:      item.UpdateBy,
		})
	}
	if len(rows) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).CreateInBatches(rows, 100).Error
}

func (r *CourseCatalogRepo) RemoveLesson(ctx context.Context, req *do.RemoveCatalogLesson) error {
	res := r.db.WithContext(ctx).
		Where("id = ? AND course_goods_id = ?", req.ID, req.GoodsID).
		Delete(&model.CourseLesson{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrCatalogLessonNotFound
	}
	return nil
}

func (r *CourseCatalogRepo) UpdateLesson(ctx context.Context, req *do.UpdateCatalogLesson) error {
	updates := map[string]interface{}{
		"update_at": time.Now(),
		"update_by": req.UpdateBy,
	}
	if req.EnableTrial != nil {
		updates["enable_trial"] = *req.EnableTrial
	}
	if !req.ShowTime.IsZero() {
		updates["show_time"] = req.ShowTime
	}
	if req.Sort > 0 {
		updates["sort"] = req.Sort
	}
	res := r.db.WithContext(ctx).Model(&model.CourseLesson{}).
		Where("id = ?", req.ID).
		Updates(updates)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrCatalogLessonNotFound
	}
	return nil
}

func (r *CourseCatalogRepo) SortLessons(ctx context.Context, req *do.SortCatalogLesson) error {
	if len(req.List) == 0 {
		return nil
	}
	ids := make([]int64, 0, len(req.List))
	for _, item := range req.List {
		ids = append(ids, item.ID)
	}
	var cnt int64
	if err := r.db.WithContext(ctx).Model(&model.CourseLesson{}).
		Where("id IN ? AND course_goods_id = ?", ids, req.GoodsID).
		Count(&cnt).Error; err != nil {
		return err
	}
	if cnt != int64(len(ids)) {
		return ErrCatalogLessonNotFound
	}
	now := time.Now()
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range req.List {
			if err := tx.Model(&model.CourseLesson{}).
				Where("id = ?", item.ID).
				Updates(map[string]interface{}{
					"sort":      item.Sort,
					"update_at": now,
					"update_by": req.UpdateBy,
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
