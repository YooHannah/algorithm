package common

type AdminUser struct {
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

type User struct {
	UserID   int64  `json:"user_id"`
	NickName string `json:"nick_name"`
}
