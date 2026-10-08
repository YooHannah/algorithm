package do

type CreateRole struct { // 主键ID
	Name        string `json:"name"`          // 角色名称
	Desc        string `json:"desc"`          // 角色描述
	Status      int32  `json:"status"`        // 状态 1:正常 -1:禁用
	AdminUserID int64  `json:"admin_user_id"` // 管理员用户ID
}

type UpdateRole struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Desc        string `json:"desc"`
	Status      int32  `json:"status"`
	AdminUserID int64  `json:"admin_user_id"`
}

type DeleteRole struct {
	ID int64 `json:"id"`
}
