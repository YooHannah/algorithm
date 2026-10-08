package dto

type CreateLessonCategoryReq struct {
	Name string `json:"name"`
	// ParentID 父目录 ID，0 表示根节点
	ParentID int64 `json:"parent_id"`
}

type UpdateLessonCategoryReq struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	ParentID int64  `json:"parent_id"`
}

type DeleteLessonCategoryReq struct {
	ID int64 `json:"id"`
}

// ListLessonCategoryReq GET 查询，使用 form tag 绑定 query 参数
type ListLessonCategoryReq struct {
	Name     string `json:"name" form:"name"`
	Page     int32  `json:"page" form:"page"`
	PageSize int32  `json:"page_size" form:"page_size"`
}

type LessonCategoryDto struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	ParentID int64  `json:"parent_id"`
	Sort     int32  `json:"sort"`
	Level    int32  `json:"level"`
}

type ListLessonCategoryResp struct {
	Total int64                `json:"total"`
	List  []*LessonCategoryDto `json:"list"`
}

// SortItem 排序/移动的单个节点：sort 为在同级中的序号（从 0 开始），
// parent_id 为调整后的父节点（0 表示根）。level 由后端统一重算。
type SortItem struct {
	ID       int64 `json:"id"`
	ParentID int64 `json:"parent_id"`
	Sort     int32 `json:"sort"`
}

type UpdateLessonCategorySortReq struct {
	List []*SortItem `json:"list"`
}

type LessonChapter struct {
	Name  string `json:"name"`
	Begin int64  `json:"begin"`
	End   int64  `json:"end"`
}
type CreateLessonReq struct {
	Name          string           `json:"name"`            // 课时名
	Intro         string           `json:"intro"`           // 课时介绍
	CategoryID    int64            `json:"category_id"`     // 目录ID
	VideoKey      string           `json:"video_key"`       // 视频文件key
	VideoFileName string           `json:"video_file_name"` // 视频文件名
	Duration      int32            `json:"duration"`        // 视频时长
	Attachments   []*Attachment    `json:"attachments"`     // 附件
	Chapters      []*LessonChapter `json:"chapters"`        // 课时章节
}

type UpdateLessonReq struct {
	ID            int64            `json:"id"`
	Name          string           `json:"name"`
	Intro         string           `json:"intro"`
	CategoryID    int64            `json:"category_id"` // 目录ID
	VideoKey      string           `json:"video_key"`   // 视频文件key
	VideoFileName string           `json:"video_file_name"`
	Duration      int32            `json:"duration"` // 视频时长
	Status        int32            `json:"status"`   // 状态
	Attachments   []*Attachment    `json:"attachments"`
	Chapters      []*LessonChapter `json:"chapters"` // 课时章节
}

type UpdateLessonStatusReq struct {
	ID     int64 `json:"id"`
	Status int32 `json:"status"` // 1:上架 -1:下架
}

type MoveLessonReq struct {
	ID         int64 `json:"id"`
	CategoryID int64 `json:"category_id"`
}

type DeleteLessonReq struct {
	ID int64 `json:"id"`
}

type ListLessonReq struct {
	ID          int64  `json:"id" form:"id"`
	Name        string `json:"name" form:"name"`
	CategoryID  int64  `json:"category_id" form:"category_id"`
	UpdateStart int64  `json:"update_start" form:"update_start"` // 毫秒时间戳
	UpdateEnd   int64  `json:"update_end" form:"update_end"`
	CreateStart int64  `json:"create_start" form:"create_start"`
	CreateEnd   int64  `json:"create_end" form:"create_end"`
	Page        int32  `json:"page" form:"page"`
	PageSize    int32  `json:"page_size" form:"page_size"`
}

type Attachment struct {
	OriginName string `json:"origin_name"`
	FileKey    string `json:"file_key"`
}
type LessonDto struct {
	ID            int64            `json:"id"`
	Name          string           `json:"name"`
	Intro         string           `json:"intro"`
	CategoryID    int64            `json:"category_id"`
	CategoryName  string           `json:"category_name"`
	VideoKey      string           `json:"video_key"`
	VideoURL      string           `json:"video_url"`
	VideoFileName string           `json:"video_file_name"`
	Duration      int32            `json:"duration"`
	Attachments   []*Attachment    `json:"attachments"`
	Chapters      []*LessonChapter `json:"chapters"` // 课时章节
	Status        int32            `json:"status"`   // 状态
	CreateBy      int64            `json:"create_by"`
	CreateByName  string           `json:"create_by_name"`
	UpdateByName  string           `json:"update_by_name"`
	CreateAt      int64            `json:"create_at"`
	UpdateAt      int64            `json:"update_at"`
}

type ListLessonResp struct {
	Total int64        `json:"total"`
	List  []*LessonDto `json:"list"`
}
