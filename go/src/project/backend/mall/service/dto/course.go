package dto

type CreateCourseReq struct {
	Name           string   `json:"name"`
	CoverKey       string   `json:"cover_key"`
	DetailCoverKey string   `json:"detail_cover_key"`
	Detail         string   `json:"detail"`
	CoursePrice    float64  `json:"course_price"`
	ServiceTime    int32    `json:"service_time"`
	Status         int32    `json:"status"` // 可选，0 默认上架，-1 草稿（课程目录先于基本信息保存时）
	Features       []string `json:"features"`
}

type UpdateCourseReq struct {
	ID             int64    `json:"id"`
	Name           string   `json:"name"`
	CoverKey       string   `json:"cover_key"`
	DetailCoverKey string   `json:"detail_cover_key"`
	Detail         string   `json:"detail"`
	CoursePrice    float64  `json:"course_price"`
	ServiceTime    int32    `json:"service_time"`
	Status         int32    `json:"status"`
	Features       []string `json:"features"`
}

type UpdateCourseStatusReq struct {
	ID     int64 `json:"id"`
	Status int32 `json:"status"` // 1:正常 -1:禁用
}

type DeleteCourseReq struct {
	ID int64 `json:"id"`
}

type ListCourseReq struct {
	ID       int64  `json:"id" form:"id"`
	Name     string `json:"name" form:"name"`
	Status   int32  `json:"status" form:"status"`
	Page     int32  `json:"page" form:"page"`
	PageSize int32  `json:"page_size" form:"page_size"`
}

type CourseDto struct {
	ID             int64    `json:"id"`
	Name           string   `json:"name"`
	CoverKey       string   `json:"cover_key"`
	CoverURL       string   `json:"cover_url"`
	DetailCoverKey string   `json:"detail_cover_key"`
	Detail         string   `json:"detail"`
	CoursePrice    float64  `json:"course_price"`
	ServiceTime    int32    `json:"service_time"`
	Status         int32    `json:"status"`
	Features       []string `json:"features"`
	CreateBy       int64    `json:"create_by"`
	CreateByName   string   `json:"create_by_name"`
	CreateAt       int64    `json:"create_at"`
	UpdateBy       int64    `json:"update_by"`
	UpdateByName   string   `json:"update_by_name"`
	UpdateAt       int64    `json:"update_at"`
}

type ListCourseResp struct {
	Total int64        `json:"total"`
	List  []*CourseDto `json:"list"`
}
