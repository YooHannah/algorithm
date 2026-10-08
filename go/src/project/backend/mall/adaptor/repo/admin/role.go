package admin

import (
	"context"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
	"mall/service/do"
	"mall/service/dto"
	"time"

	"gorm.io/gorm"
)

type IAdminRole interface {
	CreateRole(ctx context.Context, req *do.CreateRole) (int64, error)
	UpdateRole(ctx context.Context, req *do.UpdateRole) error
	DeleteRole(ctx context.Context, req *do.DeleteRole) error
	GetRoleList(ctx context.Context, name string, status int32, page, pageSize int32) ([]*model.Role, int64, error)

	GetRoleByUserID(ctx context.Context, userID int64) ([]*model.AdminUserRole, error)
	GetRoleByRoleIDs(ctx context.Context, roleIDs []int64) ([]*model.Role, error)
	SetRolePerms(ctx context.Context, userID int64, req *dto.SetRolePermsReq) error
	GetMyRoles(ctx context.Context, userID int64) ([]*model.Role, error)
	GetRolePerms(ctx context.Context, roleIds []int64) (map[int64][]int64, error)
}

type AdminRole struct {
	db *gorm.DB
}

func NewAdminRole(adaptor adaptor.IAdaptor) *AdminRole {
	return &AdminRole{
		db: adaptor.GetDB(),
	}
}

func (a *AdminRole) CreateRole(ctx context.Context, req *do.CreateRole) (int64, error) {
	timeNow := time.Now()
	qs := query.Use(a.db).Role
	addObj := &model.Role{
		Name:     req.Name,
		Desc:     req.Desc,
		Status:   req.Status,
		CreateAt: timeNow,
		UpdateAt: timeNow,
		UpdateBy: req.AdminUserID,
		CreateBy: req.AdminUserID,
	}
	err := qs.WithContext(ctx).Create(addObj)
	if err != nil {
		return 0, err
	}
	return addObj.ID, nil
}

func (a *AdminRole) UpdateRole(ctx context.Context, req *do.UpdateRole) error {
	qs := query.Use(a.db).Role
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).UpdateSimple(
		qs.Name.Value(req.Name),
		qs.Desc.Value(req.Desc),
		qs.Status.Value(req.Status),
		qs.UpdateBy.Value(req.AdminUserID),
		qs.UpdateAt.Value(time.Now()),
	)
	return err
}

func (a *AdminRole) DeleteRole(ctx context.Context, req *do.DeleteRole) error {
	qs := query.Use(a.db).Role
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Delete()
	return err
}

// GetRoleList 分页查询角色列表，返回列表数据与总数
func (a *AdminRole) GetRoleList(ctx context.Context, name string, status int32, page, pageSize int32) ([]*model.Role, int64, error) {
	qs := query.Use(a.db).Role

	q := qs.WithContext(ctx)
	if name != "" {
		q = q.Where(qs.Name.Like("%" + name + "%"))
	}
	if status != 0 {
		q = q.Where(qs.Status.Eq(status))
	}

	// gen 的 Find() 不接收参数，直接返回 ([]*model.Role, error)
	list, err := q.Offset(int((page - 1) * pageSize)).Limit(int(pageSize)).Find()
	if err != nil {
		return nil, 0, err
	}

	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (a *AdminRole) GetRolePerms(ctx context.Context, roleIds []int64) (map[int64][]int64, error) {
	qs := query.Use(a.db).RolePermission
	if len(roleIds) == 0 {
		return nil, nil
	}
	// gen 的 Find() 不接收参数，直接返回 ([][]model.RolePermission, error)
	rolePerms, err := qs.WithContext(ctx).Where(qs.RoleID.In(roleIds...)).Find()
	if err != nil {
		return nil, err
	}

	// 转换为 map[int64][]int64
	rolePermMap := make(map[int64][]int64)
	for _, perm := range rolePerms {
		rolePermMap[perm.RoleID] = append(rolePermMap[perm.RoleID], perm.PermissionID)
	}

	return rolePermMap, nil
}

func (a *AdminRole) ListRoles(ctx context.Context, req *dto.ListRoleReq) ([]*model.Role, int64, error) {
	qs := query.Use(a.db).Role
	q := qs.WithContext(ctx)
	if req.Name != "" {
		q = q.Where(qs.Name.Like("%" + req.Name + "%"))
	}
	if req.Status != 0 {
		q = q.Where(qs.Status.Eq(req.Status))
	}
	// gen 的 Find() 不接收参数，直接返回 ([]*model.Role, error)
	list, err := q.Order(qs.CreateAt.Desc()).Offset(int((req.Page - 1) * req.PageSize)).Limit(int(req.PageSize)).Find()
	if err != nil {
		return nil, 0, err
	}
	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (a *AdminRole) GetRoleByUserID(ctx context.Context, userID int64) ([]*model.AdminUserRole, error) {
	qs := query.Use(a.db).AdminUserRole
	return qs.WithContext(ctx).Where(qs.AdminUserID.Eq(userID)).Find()
}
func (a *AdminRole) GetRoleByRoleID(ctx context.Context, roleID int64) ([]*model.AdminUserRole, error) {
	qs := query.Use(a.db).AdminUserRole
	return qs.WithContext(ctx).Where(qs.RoleID.Eq(roleID)).Find()
}

// GetRoleByRoleIDs 按角色 ID 列表批量查询角色
func (a *AdminRole) GetRoleByRoleIDs(ctx context.Context, roleIDs []int64) ([]*model.Role, error) {
	qs := query.Use(a.db).Role
	if len(roleIDs) == 0 {
		return nil, nil
	}
	// gen 的 Find() 不接收参数，直接返回 ([]*model.Role, error)
	return qs.WithContext(ctx).Where(qs.ID.In(roleIDs...)).Find()
}

// SetRolePerms 设置角色权限：先删后插
func (a *AdminRole) SetRolePerms(ctx context.Context, userID int64, req *dto.SetRolePermsReq) error {
	qs := query.Use(a.db).RolePermission
	timeNow := time.Now()
	return a.db.Transaction(func(tx *gorm.DB) error {
		// 删除该角色原有权限
		if err := tx.Where(qs.RoleID.Eq(req.RoleID)).Delete(&model.RolePermission{}).Error; err != nil {
			return err
		}
		// 批量插入新权限
		perms := make([]*model.RolePermission, 0, len(req.PermIDs))
		for _, permID := range req.PermIDs {
			perms = append(perms, &model.RolePermission{
				RoleID:       req.RoleID,
				PermissionID: permID,
				CreateBy:     userID,
				UpdateBy:     userID,
				CreateAt:     timeNow,
				UpdateAt:     timeNow,
			})
		}
		if len(perms) == 0 {
			return nil
		}
		return tx.CreateInBatches(perms, 1000).Error
	})
}

func (a *AdminRole) GetMyRoles(ctx context.Context, userID int64) ([]*model.Role, error) {
	qs := query.Use(a.db).AdminUserRole
	// 批量获取用户关联的角色 ID 列表
	roleUserList, err := qs.WithContext(ctx).Where(qs.AdminUserID.Eq(userID)).Find()
	if err != nil {
		return nil, err
	}
	pureRoleIDs := make([]int64, 0, len(roleUserList))
	for _, roleUser := range roleUserList {
		pureRoleIDs = append(pureRoleIDs, roleUser.RoleID)
	}
	roles, err := a.GetRoleByRoleIDs(ctx, pureRoleIDs)

	if err != nil {
		return nil, err
	}
	return roles, nil
}
