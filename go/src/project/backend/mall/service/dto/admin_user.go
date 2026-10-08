package dto

// 接口层 请求-响应层

type UserInfoResp struct {
	UserID     int64  `json:"user_id"`
	Name       string `json:"name"`
	NickName   string `json:"nick_name"`
	Mobile     string `json:"mobile"`
	Sex        int32  `json:"sex"`
	LarkOpenID string `json:"lark_open_id"`
	Status     int32  `json:"status"`
	CreateAt   int64  `json:"create_at"`
	UpdateAt   int64  `json:"update_at"`
}

type CreateUserReq struct {
	Name     string  `json:"name"`
	NickName string  `json:"nick_name"`
	Mobile   string  `json:"mobile"`
	Sex      int32   `json:"sex"`
	RoleIDs  []int64 `json:"role_ids"`
}

type UpdateUserReq struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	NickName string  `json:"nick_name"`
	Sex      int32   `json:"sex"`
	RoleIDs  []int64 `json:"role_ids"`
}

type UpdateUserStatusReq struct {
	ID     int64 `json:"id"`
	Status int32 `json:"status"`
}

// ListUserReq 管理员列表查询入参（GET，用 form tag 绑定 query）
type ListUserReq struct {
	Name     string `form:"name"`
	NickName string `form:"nick_name"`
	Mobile   string `form:"mobile"`
	Status   int32  `form:"status"`
	Page     int32  `form:"page"`
	PageSize int32  `form:"page_size"`
}

// ListUserItem 列表单行数据
type RoleItem struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
type ListUserItem struct {
	UserID   int64      `json:"user_id"`
	Name     string     `json:"name"`
	NickName string     `json:"nick_name"`
	Mobile   string     `json:"mobile"`
	Sex      int32      `json:"sex"`
	Status   int32      `json:"status"`
	RoleIDs  []RoleItem `json:"role_ids"`
	CreateAt int64      `json:"create_at"`
}

// ListUserResp 列表响应
type ListUserResp struct {
	List  []*ListUserItem `json:"list"`
	Total int64           `json:"total"`
}

// BindLarkReq 已登录用户扫码绑定飞书入参
type BindLarkReq struct {
	AppCode     int32  `json:"app_code"`
	Code        string `json:"code"`
	RedirectUrl string `json:"redirect_url"`
}

// BindLarkResp 绑定成功返回飞书 open_id
type BindLarkResp struct {
	LarkOpenID string `json:"lark_open_id"`
}

// UpdatePasswordReq 重置密码入参（通过短信验证码校验身份）
type UpdatePasswordReq struct {
	Mobile          string `json:"mobile"`
	Code            string `json:"code"`
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}
