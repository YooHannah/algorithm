package goods

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/service/do"

	"gorm.io/gorm"
)

// 目录业务校验错误，service 层据此映射为 4xx 业务错误而非数据库错误
var (
	ErrCategoryNameEmpty     = errors.New("目录名称不能为空")
	ErrCategoryNotFound      = errors.New("目录不存在")
	ErrCategoryParentInvalid = errors.New("上级目录不存在")
	ErrCategoryCycle         = errors.New("不能移动到自身或其子级目录下")
	ErrCategoryHasChildren   = errors.New("该目录下存在子目录，请先删除子目录")
	ErrCategoryHasLessons    = errors.New("该目录下存在录播内容，请先移除后再删除")
)

// 录播课时业务校验错误
var (
	ErrLessonNameEmpty     = errors.New("录播名称不能为空")
	ErrLessonVideoEmpty    = errors.New("请上传录播视频")
	ErrLessonNotFound      = errors.New("录播不存在")
	ErrLessonStatusInvalid = errors.New("录播状态值非法")
)

type ILesson interface {
	CreateLessonCategory(ctx context.Context, req *do.CreateLessonCategory) (int64, error)
	UpdateLessonCategory(ctx context.Context, req *do.UpdateLessonCategory) error
	DeleteLessonCategory(ctx context.Context, req *do.DeleteLessonCategory) error
	ListLessonCategory(ctx context.Context, req *do.ListLessonCategory) (*do.ListLessonCategoryResp, error)
	UpdateLessonCategorySort(ctx context.Context, req []*do.UpdateLessonCategorySort) error

	CreateLesson(ctx context.Context, req *do.CreateLesson) (int64, error)
	UpdateLesson(ctx context.Context, req *do.UpdateLesson) error
	UpdateLessonStatus(ctx context.Context, req *do.UpdateLessonStatus) error
	MoveLesson(ctx context.Context, req *do.MoveLesson) error
	DeleteLesson(ctx context.Context, req *do.DeleteLesson) error
	ListLesson(ctx context.Context, req *do.ListLesson) (*do.ListLessonResp, error)
}

type Lesson struct {
	db *gorm.DB
}

func NewLesson(adaptor adaptor.IAdaptor) *Lesson {
	return &Lesson{
		db: adaptor.GetDB(),
	}
}

// rootParent 统一根节点的 parent_id 语义：非正数一律按根节点处理（兼容历史 -1）
func rootParent(id int64) int64 {
	if id > 0 {
		return id
	}
	return 0
}

func (l *Lesson) getByID(ctx context.Context, id int64) (*model.LessonCategory, error) {
	node := &model.LessonCategory{}
	err := l.db.WithContext(ctx).Where("id = ?", id).First(node).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}
	return node, nil
}

// collectDescendantIDs 收集 rootID 的全部子孙节点 ID（不含自身）
func collectDescendantIDs(all []*model.LessonCategory, rootID int64) map[int64]struct{} {
	children := make(map[int64][]int64)
	for _, c := range all {
		pid := rootParent(c.ParentID)
		children[pid] = append(children[pid], c.ID)
	}
	set := make(map[int64]struct{})
	queue := append([]int64(nil), children[rootID]...)
	for len(queue) > 0 {
		id := queue[0]
		queue = queue[1:]
		if _, ok := set[id]; ok {
			continue
		}
		set[id] = struct{}{}
		queue = append(queue, children[id]...)
	}
	return set
}

func (l *Lesson) CreateLessonCategory(ctx context.Context, req *do.CreateLessonCategory) (int64, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return 0, ErrCategoryNameEmpty
	}
	parentID := rootParent(req.ParentID)
	level := int32(1)
	if parentID > 0 {
		parent, err := l.getByID(ctx, parentID)
		if err != nil {
			if errors.Is(err, ErrCategoryNotFound) {
				return 0, ErrCategoryParentInvalid
			}
			return 0, err
		}
		level = parent.Level + 1
	}

	addObj := &model.LessonCategory{
		Name:     name,
		ParentID: parentID,
		Level:    level,
	}
	err := l.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 新节点追加到同级末尾：MAX(sort)+1，同级为空时从 1 开始
		var maxSort int32
		if err := tx.Model(&model.LessonCategory{}).
			Where("parent_id = ?", parentID).
			Select("COALESCE(MAX(sort), 0)").
			Scan(&maxSort).Error; err != nil {
			return err
		}
		addObj.Sort = maxSort + 1
		return tx.Create(addObj).Error
	})
	if err != nil {
		return 0, err
	}
	return addObj.ID, nil
}

func (l *Lesson) UpdateLessonCategory(ctx context.Context, req *do.UpdateLessonCategory) error {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return ErrCategoryNameEmpty
	}

	node, err := l.getByID(ctx, req.ID)
	if err != nil {
		return err
	}

	newParentID := rootParent(req.ParentID)
	moved := newParentID != rootParent(node.ParentID)

	var levelDelta int32
	var descendantIDs []int64
	if moved {
		// 不能挂到自身下
		if newParentID == req.ID {
			return ErrCategoryCycle
		}
		newLevel := int32(1)
		if newParentID > 0 {
			newParent, err := l.getByID(ctx, newParentID)
			if err != nil {
				if errors.Is(err, ErrCategoryNotFound) {
					return ErrCategoryParentInvalid
				}
				return err
			}
			newLevel = newParent.Level + 1
		}

		// 加载全量，校验目标父级不能是当前节点的子孙（防环），并取子孙集合
		var all []*model.LessonCategory
		if err := l.db.WithContext(ctx).Find(&all).Error; err != nil {
			return err
		}
		descSet := collectDescendantIDs(all, req.ID)
		if newParentID > 0 {
			if _, isDescendant := descSet[newParentID]; isDescendant {
				return ErrCategoryCycle
			}
		}
		levelDelta = newLevel - node.Level
		for id := range descSet {
			descendantIDs = append(descendantIDs, id)
		}
	}

	return l.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{"name": name}
		if moved {
			updates["parent_id"] = newParentID
			updates["level"] = node.Level + levelDelta
		}
		if err := tx.Model(&model.LessonCategory{}).
			Where("id = ?", req.ID).
			Updates(updates).Error; err != nil {
			return err
		}
		// 整棵子树的层级同步平移
		if moved && levelDelta != 0 && len(descendantIDs) > 0 {
			if err := tx.Model(&model.LessonCategory{}).
				Where("id IN ?", descendantIDs).
				Update("level", gorm.Expr("level + ?", levelDelta)).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (l *Lesson) DeleteLessonCategory(ctx context.Context, req *do.DeleteLessonCategory) error {
	if _, err := l.getByID(ctx, req.ID); err != nil {
		return err
	}

	return l.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var childCount int64
		if err := tx.Model(&model.LessonCategory{}).
			Where("parent_id = ?", req.ID).
			Count(&childCount).Error; err != nil {
			return err
		}
		if childCount > 0 {
			return ErrCategoryHasChildren
		}

		// 目录下仍有录播内容时禁止删除，避免产生孤儿数据
		var lessonCount int64
		if err := tx.Table(model.TableNameLesson).
			Where("category_id = ?", req.ID).
			Count(&lessonCount).Error; err != nil {
			return err
		}
		if lessonCount > 0 {
			return ErrCategoryHasLessons
		}

		return tx.Where("id = ?", req.ID).Delete(&model.LessonCategory{}).Error
	})
}

func (l *Lesson) ListLessonCategory(ctx context.Context, req *do.ListLessonCategory) (*do.ListLessonCategoryResp, error) {
	q := l.db.WithContext(ctx).Model(&model.LessonCategory{})
	if name := strings.TrimSpace(req.Name); name != "" {
		q = q.Where("name LIKE ?", "%"+name+"%")
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	// 目录树需要全量数据组装层级；仅在显式传入分页参数时才分页
	if req.Page > 0 && req.PageSize > 0 {
		q = q.Offset(int((req.Page - 1) * req.PageSize)).Limit(int(req.PageSize))
	}

	var list []*model.LessonCategory
	if err := q.Order("sort ASC, id ASC").Find(&list).Error; err != nil {
		return nil, err
	}

	dtoList := make([]*do.LessonCategoryDto, 0, len(list))
	for _, item := range list {
		dtoList = append(dtoList, &do.LessonCategoryDto{
			ID:       item.ID,
			Name:     item.Name,
			ParentID: rootParent(item.ParentID),
			Sort:     item.Sort,
			Level:    item.Level,
		})
	}
	return &do.ListLessonCategoryResp{
		Total: total,
		List:  dtoList,
	}, nil
}

// UpdateLessonCategorySort 批量保存排序/层级调整：
// 入参为调整后每个节点的 {id, parent_id, sort(同级序号)}，level 由后端按最终父子图统一重算，
// 并做父级存在性与成环校验；整批在单个事务内落库。
func (l *Lesson) UpdateLessonCategorySort(ctx context.Context, items []*do.UpdateLessonCategorySort) error {
	if len(items) == 0 {
		return nil
	}

	var all []*model.LessonCategory
	if err := l.db.WithContext(ctx).Find(&all).Error; err != nil {
		return err
	}
	parentOf := make(map[int64]int64, len(all))
	sortOf := make(map[int64]int32, len(items))
	for _, c := range all {
		parentOf[c.ID] = rootParent(c.ParentID)
	}
	for _, item := range items {
		if _, ok := parentOf[item.ID]; !ok {
			return ErrCategoryNotFound
		}
		pid := rootParent(item.ParentID)
		if pid == item.ID {
			return ErrCategoryCycle
		}
		parentOf[item.ID] = pid
		sortOf[item.ID] = item.Sort
	}
	// 父级必须是已存在的节点（或根 0）
	for _, pid := range parentOf {
		if pid > 0 {
			if _, ok := parentOf[pid]; !ok {
				return ErrCategoryParentInvalid
			}
		}
	}

	// DFS 解析每个节点层级（根=1），同时检测环路
	levelOf := make(map[int64]int32, len(parentOf))
	visiting := make(map[int64]bool)
	var resolve func(id int64) (int32, error)
	resolve = func(id int64) (int32, error) {
		if lv, ok := levelOf[id]; ok {
			return lv, nil
		}
		pid := parentOf[id]
		if pid == 0 {
			levelOf[id] = 1
			return 1, nil
		}
		if visiting[id] {
			return 0, ErrCategoryCycle
		}
		visiting[id] = true
		parentLevel, err := resolve(pid)
		visiting[id] = false
		if err != nil {
			return 0, err
		}
		levelOf[id] = parentLevel + 1
		return levelOf[id], nil
	}
	for id := range parentOf {
		if _, err := resolve(id); err != nil {
			return err
		}
	}

	return l.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			pid := rootParent(item.ParentID)
			// map 更新保证 sort=0 / parent_id=0 等零值也能写入
			err := tx.Model(&model.LessonCategory{}).
				Where("id = ?", item.ID).
				Updates(map[string]interface{}{
					"parent_id": pid,
					"sort":      sortOf[item.ID],
					"level":     levelOf[item.ID],
				}).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
}

// lessonRow 列表查询联表结果：lessons 全字段 + 目录名 + 创建人名
type lessonRow struct {
	model.Lesson
	CategoryName string `gorm:"column:category_name"`
	CreateByName string `gorm:"column:create_by_name"`
	UpdateByName string `gorm:"column:update_by_name"`
}

func (l *Lesson) ListLesson(ctx context.Context, req *do.ListLesson) (*do.ListLessonResp, error) {
	q := l.db.WithContext(ctx).
		Table("lessons AS l").
		Joins("LEFT JOIN lesson_category AS c ON c.id = l.category_id").
		Joins("LEFT JOIN admin_user AS au ON au.id = l.create_by").
		Joins("LEFT JOIN admin_user AS uu ON uu.id = l.update_by")
	if req.ID > 0 {
		q = q.Where("l.id = ?", req.ID)
	}
	if name := strings.TrimSpace(req.Name); name != "" {
		q = q.Where("l.name LIKE ?", "%"+name+"%")
	}
	if req.CategoryID > 0 {
		q = q.Where("l.category_id = ?", req.CategoryID)
	}
	if req.UpdateStart > 0 {
		q = q.Where("l.update_at >= ?", time.UnixMilli(req.UpdateStart))
	}
	if req.UpdateEnd > 0 {
		q = q.Where("l.update_at <= ?", time.UnixMilli(req.UpdateEnd))
	}
	if req.CreateStart > 0 {
		q = q.Where("l.create_at >= ?", time.UnixMilli(req.CreateStart))
	}
	if req.CreateEnd > 0 {
		q = q.Where("l.create_at <= ?", time.UnixMilli(req.CreateEnd))
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	if req.Page > 0 && req.PageSize > 0 {
		q = q.Offset(int((req.Page - 1) * req.PageSize)).Limit(int(req.PageSize))
	}
	var rows []*lessonRow
	if err := q.
		Select("l.*, c.name AS category_name, au.name AS create_by_name, uu.name AS update_by_name").
		Order("l.id DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	dtoList := make([]*do.LessonDto, 0, len(rows))
	for _, row := range rows {
		item := row.Lesson
		attachments := make([]*do.Attachment, 0)
		if item.Attachments != "" {
			_ = json.Unmarshal([]byte(item.Attachments), &attachments)
		}
		chapters := make([]*do.LessonChapter, 0)
		if item.Chapters != "" {
			_ = json.Unmarshal([]byte(item.Chapters), &chapters)
		}
		dtoList = append(dtoList, &do.LessonDto{
			ID:            item.ID,
			Name:          item.Name,
			Intro:         item.Intro,
			CategoryID:    item.CategoryID,
			CategoryName:  row.CategoryName,
			VideoKey:      item.VideoKey,
			VideoFileName: item.VideoFileName,
			Duration:      item.Duration,
			Status:        item.Status,
			Attachments:   attachments,
			Chapters:      chapters,
			CreateBy:      item.CreateBy,
			CreateByName:  row.CreateByName,
			UpdateByName:  row.UpdateByName,
			CreateAt:      item.CreateAt,
			UpdateAt:      item.UpdateAt,
		})
	}
	return &do.ListLessonResp{
		Total: total,
		List:  dtoList,
	}, nil
}

// validateLessonCategory 校验目录归属：category_id>0 时目录必须存在
func (l *Lesson) validateLessonCategory(ctx context.Context, categoryID int64) error {
	if categoryID <= 0 {
		return nil
	}
	cnt := int64(0)
	if err := l.db.WithContext(ctx).Model(&model.LessonCategory{}).
		Where("id = ?", categoryID).Count(&cnt).Error; err != nil {
		return err
	}
	if cnt == 0 {
		return ErrCategoryNotFound
	}
	return nil
}

func (l *Lesson) CreateLesson(ctx context.Context, req *do.CreateLesson) (int64, error) {
	if strings.TrimSpace(req.Name) == "" {
		return 0, ErrLessonNameEmpty
	}
	if strings.TrimSpace(req.VideoKey) == "" {
		return 0, ErrLessonVideoEmpty
	}
	if err := l.validateLessonCategory(ctx, req.CategoryID); err != nil {
		return 0, err
	}
	// JSON 列必须写合法 JSON，空集合写 [] 而非 "null"
	jsonChapters, _ := json.Marshal(defaultChapters(req.Chapters))
	jsonAttachments, _ := json.Marshal(defaultAttachments(req.Attachments))
	data := &model.Lesson{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Intro:         req.Intro,
		Attachments:   string(jsonAttachments), // 转成json字符串
		VideoKey:      req.VideoKey,
		VideoFileName: req.VideoFileName,
		Status:        req.Status,
		Chapters:      string(jsonChapters), // 转成json字符串
		Duration:      req.Duration,
		CreateBy:      req.CreateBy,
		UpdateBy:      req.UpdateBy,
		CreateAt:      req.CreateAt,
		UpdateAt:      req.UpdateAt,
	}
	err := l.db.WithContext(ctx).Create(data).Error
	if err != nil {
		return 0, err
	}
	return data.ID, nil
}

func defaultChapters(in []*do.LessonChapter) []*do.LessonChapter {
	if in == nil {
		return []*do.LessonChapter{}
	}
	return in
}

func defaultAttachments(in []*do.Attachment) []*do.Attachment {
	if in == nil {
		return []*do.Attachment{}
	}
	return in
}

func (l *Lesson) UpdateLesson(ctx context.Context, req *do.UpdateLesson) error {
	if strings.TrimSpace(req.Name) == "" {
		return ErrLessonNameEmpty
	}
	if strings.TrimSpace(req.VideoKey) == "" {
		return ErrLessonVideoEmpty
	}
	if err := l.validateLessonCategory(ctx, req.CategoryID); err != nil {
		return err
	}

	jsonChapters, _ := json.Marshal(defaultChapters(req.Chapters))
	jsonAttachments, _ := json.Marshal(defaultAttachments(req.Attachments))
	// map 更新：保证 intro="" 等零值也能写入，struct Updates 会跳过零值
	updates := map[string]interface{}{
		"name":            req.Name,
		"category_id":     req.CategoryID,
		"intro":           req.Intro,
		"attachments":     string(jsonAttachments),
		"video_key":       req.VideoKey,
		"video_file_name": req.VideoFileName,
		"chapters":        string(jsonChapters),
		"duration":        req.Duration,
		"update_by":       req.UpdateBy,
		"update_at":       req.UpdateAt,
	}
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	res := l.db.WithContext(ctx).Model(&model.Lesson{}).
		Where("id = ?", req.ID).Updates(updates)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}

func (l *Lesson) UpdateLessonStatus(ctx context.Context, req *do.UpdateLessonStatus) error {
	if req.Status != 1 && req.Status != -1 {
		return ErrLessonStatusInvalid
	}
	res := l.db.WithContext(ctx).Model(&model.Lesson{}).
		Where("id = ?", req.ID).
		Updates(map[string]interface{}{
			"status":    req.Status,
			"update_by": req.UpdateBy,
			"update_at": req.UpdateAt,
		})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}

func (l *Lesson) MoveLesson(ctx context.Context, req *do.MoveLesson) error {
	if err := l.validateLessonCategory(ctx, req.CategoryID); err != nil {
		return err
	}
	res := l.db.WithContext(ctx).Model(&model.Lesson{}).
		Where("id = ?", req.ID).
		Updates(map[string]interface{}{
			"category_id": req.CategoryID,
			"update_by":   req.UpdateBy,
			"update_at":   req.UpdateAt,
		})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}

func (l *Lesson) DeleteLesson(ctx context.Context, req *do.DeleteLesson) error {
	res := l.db.WithContext(ctx).Where("id = ?", req.ID).Delete(&model.Lesson{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrLessonNotFound
	}
	return nil
}
