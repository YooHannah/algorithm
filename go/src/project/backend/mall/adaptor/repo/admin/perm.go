package admin

import (
	"context"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
	"mall/consts"
	"mall/service/do"
	"time"

	"gorm.io/gorm"
)

type IAdminPerm interface {
	GetPermAll(ctx context.Context) ([]*model.Permission, error)
	GetPermList(ctx context.Context, userId int64) ([]*model.Permission, error)
	CreatePerm(ctx context.Context, req *do.CreatePermission) (int64, error)
	UpdatePerm(ctx context.Context, req *do.UpdatePermission) error
	DeletePerm(ctx context.Context, req *do.DeletePermission) error
	GetPermissionByIDs(ctx context.Context, permIds []int64) ([]*model.Permission, error)
}

type AdminPerm struct {
	db *gorm.DB
}

func NewAdminPerm(adaptor adaptor.IAdaptor) *AdminPerm {
	return &AdminPerm{
		db: adaptor.GetDB(),
	}
}

// GetPermAll 获取所有权限
func (a *AdminPerm) GetPermAll(ctx context.Context) ([]*model.Permission, error) {
	qs := query.Use(a.db).Permission
	list, err := qs.WithContext(ctx).Where(qs.Status.Eq(consts.IsEnable)).Find()
	return list, err
}

// GetPermList 获取用户权限列表
func (a *AdminPerm) GetPermList(ctx context.Context, userId int64) ([]*model.Permission, error) {
	return a.GetPermAll(ctx)
}

func (a *AdminPerm) CreatePerm(ctx context.Context, req *do.CreatePermission) (int64, error) {
	qs := query.Use(a.db).Permission
	timeNow := time.Now()

	perm := &model.Permission{
		Name:     req.Name,
		Code:     req.Code,
		Type:     req.Type,
		Desc:     req.Desc,
		PagePath: req.PagePath,
		ParentID: req.ParentID,
		Sort:     req.Sort,
		Status:   consts.IsEnable,
		CreateAt: timeNow,
		UpdateAt: timeNow,
		UpdateBy: req.AdminUserID,
	}
	err := qs.WithContext(ctx).Create(perm)
	if err != nil {
		return 0, err
	}

	return perm.ID, nil
}

func (a *AdminPerm) DeletePerm(ctx context.Context, req *do.DeletePermission) error {
	qs := query.Use(a.db).Permission
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Delete()
	if err != nil {
		return err
	}
	return nil
}

// UpdatePerm 批量更新权限
func (a *AdminPerm) UpdatePerm(ctx context.Context, req *do.UpdatePermission) error {
	qs := query.Use(a.db).Permission
	a.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range req.List {
			updatePerm := map[string]interface{}{
				"name":      item.Name,
				"code":      item.Code,
				"type":      item.Type,
				"desc":      item.Desc,
				"page_path": item.PagePath,
				"parent_id": item.ParentID,
				"sort":      item.Sort,
				"update_by": item.AdminUserID,
				"update_at": time.Now(),
			}
			err := tx.Model(&model.Permission{}).Where(qs.ID.Eq(item.ID)).Updates(updatePerm).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
	return nil
}

// 根据Id批量查询权限信息
func (a *AdminPerm) GetPermissionByIDs(ctx context.Context, permIDs []int64) ([]*model.Permission, error) {
	qs := query.Use(a.db).Permission
	return qs.WithContext(ctx).Where(qs.ID.In(permIDs...)).Find()
}
