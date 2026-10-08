package do

import "time"

type CreateLessonCategory struct {
	Name     string
	ParentID int64
}

type UpdateLessonCategory struct {
	ID       int64
	Name     string
	ParentID int64
}

type DeleteLessonCategory struct {
	ID int64
}

type ListLessonCategory struct {
	Name     string
	Page     int32
	PageSize int32
}

type LessonCategoryDto struct {
	ID       int64
	Name     string
	ParentID int64
	Sort     int32
	Level    int32
}

type ListLessonCategoryResp struct {
	Total int64
	List  []*LessonCategoryDto
}

// UpdateLessonCategorySort 排序/移动入参，ParentID=0 表示根节点
type UpdateLessonCategorySort struct {
	ID       int64
	ParentID int64
	Sort     int32
}

type CreateLesson struct {
	Name          string           // 课时名
	Intro         string           // 课时介绍
	CategoryID    int64            // 目录ID
	VideoKey      string           // 视频文件key
	VideoFileName string           // 视频文件名
	Duration      int32            // 视频时长
	Attachments   []*Attachment    // 附件
	Chapters      []*LessonChapter // 课时章节
	CreateBy      int64            // 创建人ID
	UpdateBy      int64            // 更新人ID
	Status        int32            // 状态
	CreateAt      time.Time        // 创建时间
	UpdateAt      time.Time        // 更新时间
}

type UpdateLesson struct {
	ID            int64
	Name          string           // 课时名
	Intro         string           // 课时介绍
	CategoryID    int64            // 目录ID
	VideoKey      string           // 视频文件key
	VideoFileName string           // 视频文件名
	Duration      int32            // 视频时长
	Status        int32            // 状态
	Attachments   []*Attachment    // 附件
	Chapters      []*LessonChapter // 课时章节
	UpdateBy      int64            // 更新人ID
	UpdateAt      time.Time        // 更新时间
}

// UpdateLessonStatus 仅更新上架/下架状态
type UpdateLessonStatus struct {
	ID       int64
	Status   int32 // 1:上架 -1:下架
	UpdateBy int64
	UpdateAt time.Time
}

// MoveLesson 仅移动录播所属目录
type MoveLesson struct {
	ID         int64
	CategoryID int64
	UpdateBy   int64
	UpdateAt   time.Time
}

type DeleteLesson struct {
	ID int64
}

type ListLesson struct {
	ID          int64
	Name        string
	CategoryID  int64
	UpdateStart int64 // 毫秒时间戳
	UpdateEnd   int64
	CreateStart int64
	CreateEnd   int64
	Page        int32
	PageSize    int32
}

type LessonChapter struct {
	Name  string
	Begin int64
	End   int64
}
type LessonDto struct {
	ID            int64
	Name          string           // 课时名
	Intro         string           // 课时介绍
	CategoryID    int64            // 目录ID
	CategoryName  string           // 目录名
	VideoKey      string           // 视频文件key
	VideoURL      string           // 视频可播放地址
	VideoFileName string           // 视频文件名
	Duration      int32            // 视频时长
	Status        int32            // 状态
	Attachments   []*Attachment    // 附件
	Chapters      []*LessonChapter // 课时章节
	CreateBy      int64
	CreateByName  string    // 创建人名字
	UpdateByName  string    // 更新人名字
	CreateAt      time.Time // 创建时间
	UpdateAt      time.Time // 更新时间
}

type ListLessonResp struct {
	Total int64
	List  []*LessonDto
}

type Attachment struct {
	OriginName string
	FileKey    string
}
