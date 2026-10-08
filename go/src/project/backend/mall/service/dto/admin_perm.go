package dto

import "mall/common"

type PermissionDto struct {
	ID       int64  `json:"id"`
	Code     string `json:"code"`
	Type     int32  `json:"type"`
	Name     string `json:"name"`
	PagePath string `json:"page_path"`
	ParentID int64  `json:"parent_id"`
	Status   int32  `json:"status"`
	Sort     int32  `json:"sort"`
	Desc     string `json:"desc"` // 权限描述
}

type PermissionListResp struct {
	common.Pager
	Total int64            `json:"total"`
	List  []*PermissionDto `json:"list"`
}

type CreatePermissionReq struct {
	Code     string `json:"code"`
	Type     int32  `json:"type"`
	Name     string `json:"name"`
	PagePath string `json:"page_path"`
	ParentID int64  `json:"parent_id"`
	Sort     int32  `json:"sort"`
	Desc     string `json:"desc"` // 权限描述
}

type UpdatePermissionDto struct {
	ID int64 `json:"id"`
	CreatePermissionReq
}

type UpdatePermissionReq struct {
	List []UpdatePermissionDto `json:"list"`
}

type DeletePermissionReq struct {
	ID int64 `json:"id"`
}
