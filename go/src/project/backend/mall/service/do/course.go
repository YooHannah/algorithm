package do

import "time"

type CreateCourse struct {
	Name           string
	CoverKey       string
	DetailCoverKey string
	Detail         string
	CoursePrice    float64
	ServiceTime    int32
	Status         int32
	Features       []string
	CreateBy       int64
	UpdateBy       int64
	CreateAt       time.Time
	UpdateAt       time.Time
}

type UpdateCourse struct {
	ID             int64
	Name           string
	CoverKey       string
	DetailCoverKey string
	Detail         string
	CoursePrice    float64
	ServiceTime    int32
	Status         int32
	Features       []string
	UpdateBy       int64
	UpdateAt       time.Time
}

type UpdateCourseStatus struct {
	ID       int64
	Status   int32 // 1:正常 -1:禁用
	UpdateBy int64
	UpdateAt time.Time
}

type DeleteCourse struct {
	ID int64
}

type ListCourse struct {
	ID     int64
	Name   string
	Status int32
	Page   int32
	PageSize int32
}

type CourseDto struct {
	ID             int64
	Name           string
	CoverKey       string
	CoverURL       string
	DetailCoverKey string
	Detail         string
	CoursePrice    float64
	ServiceTime    int32
	Status         int32
	Features       []string
	CreateBy       int64
	CreateByName   string
	CreateAt       time.Time
	UpdateBy       int64
	UpdateByName   string
	UpdateAt       time.Time
}

type ListCourseResp struct {
	Total int64
	List  []*CourseDto
}
