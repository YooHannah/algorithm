package do

import "time"

/* ------------------------------ 课程目录 ------------------------------ */

type AddCatalog struct {
	GoodsID  int64
	ParentID int64 // -1 表示一级专题；>0 为该专题下新增章节
	Name     string
	UpdateBy int64
}

type UpdateCatalog struct {
	ID       int64
	GoodsID int64
	Name     string
	UpdateBy int64
}

type DeleteCatalog struct {
	ID      int64
	GoodsID int64
}

type CatalogSortItem struct {
	ID   int64 `json:"id"`
	Sort int64 `json:"sort"`
}

type SortCatalog struct {
	GoodsID  int64
	List     []CatalogSortItem
	UpdateBy int64
}

/* ------------------------------ 课程-录播关联 ------------------------------ */

type AddCatalogLesson struct {
	CourseGoodsID int64
	CatalogID     int64
	LessonID      int64
	Sort          int32
	ShowTime      time.Time
	UpdateBy      int64
}

type RemoveCatalogLesson struct {
	ID      int64 // course_lessons.id
	GoodsID int64
}

type UpdateCatalogLesson struct {
	ID          int64
	EnableTrial *int32 // nil 表示不更新；0 完整播放；1 试听
	ShowTime    time.Time
	Sort        int32
	UpdateBy    int64
}

type CatalogLessonSortItem struct {
	ID   int64 `json:"id"`
	Sort int32 `json:"sort"`
}

type SortCatalogLesson struct {
	GoodsID  int64
	List     []CatalogLessonSortItem
	UpdateBy int64
}

/* ------------------------------ info 组装 ------------------------------ */

type CatalogLessonDto struct {
	ID           int64     // course_lessons.id
	LessonID     int64     // lessons.id
	Name         string    // 录播名称
	Duration     int32     // 时长（秒）
	CategoryName string    // 录播所属目录名
	VideoURL     string    // 播放地址
	EnableTrial  int32     // 1:试听
	Sort         int32
	ShowTime     time.Time // 可见时间
}

type CatalogDto struct {
	ID       int64
	ParentID int64
	Level    int32
	Name     string
	Sort     int64
	Children []*CatalogDto
	Lessons  []*CatalogLessonDto
}

type CatalogInfo struct {
	GoodsID       int64
	TotalDuration int64 // 课程总时长（秒）
	List          []*CatalogDto
}
