package goods

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/service/do"

	"gorm.io/gorm"
)

// 课程业务校验错误
var (
	ErrCourseNameEmpty  = errors.New("课程名称不能为空")
	ErrCourseCoverEmpty = errors.New("请上传课程封面")
	ErrCourseNotFound   = errors.New("课程不存在")
	ErrCourseStatusInv  = errors.New("课程状态值非法")
)

type ICourse interface {
	CreateCourse(ctx context.Context, req *do.CreateCourse) (int64, error)
	UpdateCourse(ctx context.Context, req *do.UpdateCourse) error
	UpdateCourseStatus(ctx context.Context, req *do.UpdateCourseStatus) error
	DeleteCourse(ctx context.Context, req *do.DeleteCourse) error
	ListCourse(ctx context.Context, req *do.ListCourse) (*do.ListCourseResp, error)
	GetCourseByID(ctx context.Context, id int64) (*model.Course, error)
}

type Course struct {
	db *gorm.DB
}

func NewCourse(adaptor adaptor.IAdaptor) *Course {
	return &Course{db: adaptor.GetDB()}
}

// courseRow 列表查询联表结果：course 全字段 + 创建人名 + 更新人名
type courseRow struct {
	model.Course
	CreateByName string `gorm:"column:create_by_name"`
	UpdateByName string `gorm:"column:update_by_name"`
}

func (c *Course) ListCourse(ctx context.Context, req *do.ListCourse) (*do.ListCourseResp, error) {
	q := c.db.WithContext(ctx).
		Table("course AS co").
		Joins("LEFT JOIN admin_user AS acu ON acu.id = co.create_by").
		Joins("LEFT JOIN admin_user AS auu ON auu.id = co.update_by")
	if req.ID > 0 {
		q = q.Where("co.id = ?", req.ID)
	}
	if name := strings.TrimSpace(req.Name); name != "" {
		q = q.Where("co.name LIKE ?", "%"+name+"%")
	}
	if req.Status != 0 {
		q = q.Where("co.status = ?", req.Status)
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	if req.Page > 0 && req.PageSize > 0 {
		q = q.Offset(int((req.Page - 1) * req.PageSize)).Limit(int(req.PageSize))
	}
	var rows []*courseRow
	if err := q.
		Select("co.*, acu.name AS create_by_name, auu.name AS update_by_name").
		Order("co.id DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	dtoList := make([]*do.CourseDto, 0, len(rows))
	for _, row := range rows {
		item := row.Course
		features := make([]string, 0)
		if item.Features != "" {
			_ = json.Unmarshal([]byte(item.Features), &features)
		}
		dtoList = append(dtoList, &do.CourseDto{
			ID:             item.ID,
			Name:           item.Name,
			CoverKey:       item.CoverKey,
			DetailCoverKey: item.DetailCoverKey,
			Detail:         item.Detail,
			CoursePrice:    item.CoursePrice,
			ServiceTime:    item.ServiceTime,
			Status:         item.Status,
			Features:       features,
			CreateBy:       item.CreateBy,
			CreateByName:   row.CreateByName,
			CreateAt:       item.CreateAt,
			UpdateBy:       item.UpdateBy,
			UpdateByName:   row.UpdateByName,
			UpdateAt:       item.UpdateAt,
		})
	}
	return &do.ListCourseResp{Total: total, List: dtoList}, nil
}

func (c *Course) GetCourseByID(ctx context.Context, id int64) (*model.Course, error) {
	course := &model.Course{}
	err := c.db.WithContext(ctx).Where("id = ?", id).First(course).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}
	return course, nil
}

func defaultFeatures(in []string) []string {
	if in == nil {
		return []string{}
	}
	return in
}

func (c *Course) CreateCourse(ctx context.Context, req *do.CreateCourse) (int64, error) {
	// 允许先配置课程目录、后补基本信息：名称缺省给占位名，封面可空（草稿）
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = "未命名课程"
	}
	jsonFeatures, _ := json.Marshal(defaultFeatures(req.Features))
	data := &model.Course{
		Name:           name,
		CoverKey:       req.CoverKey,
		DetailCoverKey: req.DetailCoverKey,
		Detail:         req.Detail,
		CoursePrice:    req.CoursePrice,
		ServiceTime:    req.ServiceTime,
		Status:         req.Status,
		Features:       string(jsonFeatures),
		CreateBy:       req.CreateBy,
		UpdateBy:       req.UpdateBy,
		CreateAt:       req.CreateAt,
		UpdateAt:       req.UpdateAt,
	}
	if err := c.db.WithContext(ctx).Create(data).Error; err != nil {
		return 0, err
	}
	return data.ID, nil
}

func (c *Course) UpdateCourse(ctx context.Context, req *do.UpdateCourse) error {
	if strings.TrimSpace(req.Name) == "" {
		return ErrCourseNameEmpty
	}
	if strings.TrimSpace(req.CoverKey) == "" {
		return ErrCourseCoverEmpty
	}
	jsonFeatures, _ := json.Marshal(defaultFeatures(req.Features))
	updates := map[string]interface{}{
		"name":             req.Name,
		"cover_key":        req.CoverKey,
		"detail_cover_key": req.DetailCoverKey,
		"detail":           req.Detail,
		"course_price":     req.CoursePrice,
		"service_time":     req.ServiceTime,
		"features":         string(jsonFeatures),
		"update_by":        req.UpdateBy,
		"update_at":        req.UpdateAt,
	}
	if req.Status != 0 {
		updates["status"] = req.Status
	}
	res := c.db.WithContext(ctx).Model(&model.Course{}).
		Where("id = ?", req.ID).Updates(updates)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}

func (c *Course) UpdateCourseStatus(ctx context.Context, req *do.UpdateCourseStatus) error {
	if req.Status != 1 && req.Status != -1 {
		return ErrCourseStatusInv
	}
	res := c.db.WithContext(ctx).Model(&model.Course{}).
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
		return ErrCourseNotFound
	}
	return nil
}

func (c *Course) DeleteCourse(ctx context.Context, req *do.DeleteCourse) error {
	res := c.db.WithContext(ctx).Where("id = ?", req.ID).Delete(&model.Course{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}
