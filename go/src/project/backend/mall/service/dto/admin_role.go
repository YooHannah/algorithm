package dto

// RoleDto 角色列表单行数据

type RolePermsItem struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
type RoleDto struct {
	ID       int64           `json:"id"`
	Name     string          `json:"name"`
	Desc     string          `json:"desc"`
	Status   int32           `json:"status"`
	CreateAt int64           `json:"create_at"`
	UpdateAt int64           `json:"update_at"`
	Perms    []RolePermsItem `json:"perms"`
}

// GetRoleListReq 角色列表查询入参（GET，用 form tag 绑定 query）
type GetRoleListReq struct {
	Name     string `form:"name"`
	Status   int32  `form:"status"`
	Page     int32  `form:"page"`
	PageSize int32  `form:"page_size"`
}

// RoleListResp 角色列表响应
type RoleListResp struct {
	List  []*RoleDto `json:"list"`
	Total int64      `json:"total"`
}

// CreateRoleReq 新增角色入参
type CreateRoleReq struct {
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	Status int32  `json:"status"`
}

// UpdateRoleReq 编辑角色入参
type UpdateRoleReq struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	Status int32  `json:"status"`
}

// DeleteRoleReq 删除角色入参
type DeleteRoleReq struct {
	ID int64 `json:"id"`
}

// SetRolePermsReq 设置角色权限入参（与前端 { role_id, perm_ids } 对齐）
type SetRolePermsReq struct {
	RoleID  int64   `json:"role_id"`
	PermIDs []int64 `json:"perm_ids"`
}

type ListRoleReq struct {
	Name     string `json:"name"`
	Status   int32  `json:"status"`
	Page     int32  `json:"page"`
	PageSize int32  `json:"page_size"`
}

// GetMyRolesReq 获取用户关联的角色入参
type GetMyRolesReq struct {
	UserID int64 `json:"user_id"`
}
