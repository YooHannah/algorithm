package do

// 接口层数据类型

type CreateUser struct {
	AdminUserID int64   `json:"admin_user_id"`
	Name        string  `json:"name"`
	NickName    string  `json:"nick_name"`
	Mobile      string  `json:"mobile"`
	Sex         int32   `json:"sex"`
	RoleIDs     []int64 `json:"role_ids"`
}

type UpdateUser struct {
	AdminUserID int64   `json:"admin_user_id"`
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	NickName    string  `json:"nick_name"`
	Mobile      string  `json:"mobile"`
	LarkOpenID  string  `json:"lark_open_id"`
	Password    string  `json:"password"`
	Status      int32   `json:"status"`
	Sex         int32   `json:"sex"`
	RoleIDs     []int64 `json:"role_ids"`
}

type UpdateUserStatus struct {
	AdminUserID int64 `json:"admin_user_id"`
	ID          int64 `json:"id"`
	Status      int32 `json:"status"`
}

type UpdateUserPassword struct {
	ID       int64  `json:"id"`
	Password string `json:"password"`
}
