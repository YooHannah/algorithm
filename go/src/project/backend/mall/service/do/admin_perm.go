package do

type CreatePermission struct {
	AdminUserID int64
	Name        string
	Code        string
	Desc        string
	PagePath    string
	ParentID    int64
	Sort        int32
	Type        int32
}

type UpdatePermissionItem struct {
	ID int64
	CreatePermission
}

type UpdatePermission struct {
	List []UpdatePermissionItem
}

type DeletePermission struct {
	ID int64
}
