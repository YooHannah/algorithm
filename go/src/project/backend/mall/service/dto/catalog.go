package dto

/* ------------------------------ 课程目录 ------------------------------ */

type AddCatalogReq struct {
	GoodsID  int64  `json:"goods_id"`
	ParentID int64  `json:"parent_id"` // -1 或 0：一级专题；>0：该专题下章节
	Name     string `json:"name"`
}

// AddCatalogResp 新增目录返回；当请求未带 goods_id（课程尚未创建）时，
// 后端会自动创建一条下架草稿课程，并通过 goods_id 回传给前端
type AddCatalogResp struct {
	ID      int64 `json:"id"`       // 新建的目录（专题/章节）ID
	GoodsID int64 `json:"goods_id"` // 课程商品 ID
}

type UpdateCatalogReq struct {
	ID      int64  `json:"id"`
	GoodsID int64  `json:"goods_id"`
	Name    string `json:"name"`
}

type DeleteCatalogReq struct {
	ID      int64 `json:"id"`
	GoodsID int64 `json:"goods_id"`
}

type CatalogSortItem struct {
	ID   int64 `json:"id"`
	Sort int64 `json:"sort"`
}

type SortCatalogReq struct {
	GoodsID int64             `json:"goods_id"`
	List    []CatalogSortItem `json:"list"`
}

type CatalogInfoReq struct {
	GoodsID int64 `json:"goods_id" form:"goods_id"`
}

/* ------------------------------ 课程-录播关联 ------------------------------ */

type AddCatalogLessonReq struct {
	GoodsID   int64   `json:"goods_id"`
	CatalogID int64   `json:"catalog_id"`
	LessonIDs []int64 `json:"lesson_ids"`
}

type RemoveCatalogLessonReq struct {
	ID      int64 `json:"id"`
	GoodsID int64 `json:"goods_id"`
}

type UpdateCatalogLessonReq struct {
	ID          int64  `json:"id"`
	EnableTrial *int32 `json:"enable_trial"` // 不传不更新；0 完整播放；1 试听
	ShowTime    int64  `json:"show_time"`    // 毫秒时间戳
	Sort        int32  `json:"sort"`
}

type CatalogLessonSortItem struct {
	ID   int64 `json:"id"`
	Sort int32 `json:"sort"`
}

type SortCatalogLessonReq struct {
	GoodsID int64                    `json:"goods_id"`
	List    []CatalogLessonSortItem  `json:"list"`
}

/* ------------------------------ info 响应 ------------------------------ */

type CatalogLessonDto struct {
	ID            int64  `json:"id"`
	LessonID      int64  `json:"lesson_id"`
	Name          string `json:"name"`
	Duration      int32  `json:"duration"`
	CategoryName  string `json:"category_name"`
	VideoURL      string `json:"video_url"`
	EnableTrial   int32  `json:"enable_trial"`
	Sort          int32  `json:"sort"`
	ShowTime      int64  `json:"show_time"`
}

type CatalogDto struct {
	ID       int64               `json:"id"`
	ParentID int64               `json:"parent_id"`
	Level    int32               `json:"level"`
	Name     string              `json:"name"`
	Sort     int64               `json:"sort"`
	Children []*CatalogDto       `json:"children"`
	Lessons  []*CatalogLessonDto `json:"lessons"`
}

type CatalogInfoResp struct {
	GoodsID       int64         `json:"goods_id"`
	TotalDuration int64         `json:"total_duration"`
	List          []*CatalogDto `json:"list"`
}
