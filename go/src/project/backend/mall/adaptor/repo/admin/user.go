package admin

import (
	"context"
	"fmt"
	"mall/adaptor"
	"mall/adaptor/repo/model"
	"mall/adaptor/repo/query"
	"mall/consts"
	"mall/service/do"
	"time"

	"github.com/go-redis/redis"
	"gorm.io/gorm"
)

type IAdminUser interface {
	CreateUser(ctx context.Context, req *do.CreateUser) (int64, error)
	UpdateUser(ctx context.Context, req *do.UpdateUser) error
	UpdateUserStatus(ctx context.Context, req *do.UpdateUserStatus) error
	UpdateUserPassword(ctx context.Context, req *do.UpdateUserPassword) error

	GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error)
	GetUserByMobile(ctx context.Context, mobile string) (*model.AdminUser, error)
	GetUserByLarkOpenID(ctx context.Context, openID string) (*model.AdminUser, error)
	UpdateUserLarkOpenID(ctx context.Context, userId int64, openID string) error
	// ListUser 按条件分页查询管理员列表，返回列表与总数
	ListUser(ctx context.Context, name, nickName, mobile string, status int32, page, pageSize int32) ([]*model.AdminUser, int64, error)
}

type AdminUser struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewAdminUser(adaptor adaptor.IAdaptor) *AdminUser {
	return &AdminUser{
		db:    adaptor.GetDB(),
		redis: adaptor.GetRedis(),
	}
}

func (a *AdminUser) CreateUser(ctx context.Context, req *do.CreateUser) (int64, error) {
	timeNow := time.Now()
	fmt.Println("CreateUser req: req.NickName", req.NickName)
	addObj := &model.AdminUser{
		Name:     req.Name,
		NickName: req.NickName,
		Mobile:   req.Mobile,
		Sex:      req.Sex,
		CreateAt: timeNow,
		UpdateAt: timeNow,
		UpdateBy: req.AdminUserID,
		Status:   consts.IsEnable,
		CreateBy: req.AdminUserID,
	}
	err := a.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		error := tx.Create(addObj).Error
		if error != nil {
			return error
		}
		userRoles := make([]*model.AdminUserRole, len(req.RoleIDs))
		fmt.Println("CreateUser req: req.RoleIDs----", req.RoleIDs)
		for i, roleID := range req.RoleIDs {
			userRoles[i] = &model.AdminUserRole{
				AdminUserID: addObj.ID,
				RoleID:      roleID,
				CreateAt:    timeNow,
				UpdateAt:    timeNow,
				UpdateBy:    req.AdminUserID,
				CreateBy:    req.AdminUserID,
			}
		}
		return tx.CreateInBatches(userRoles, 1000).Error
	})
	if err != nil {
		return 0, err
	}
	fmt.Println(addObj)
	return addObj.ID, nil
}
func (a *AdminUser) UpdateUser(ctx context.Context, req *do.UpdateUser) error {
	qs := query.Use(a.db).AdminUser
	rqs := query.Use(a.db).AdminUserRole
	timeNow := time.Now()
	newUser := &model.AdminUser{
		ID:         req.ID,
		Name:       req.Name,
		NickName:   req.NickName,
		Mobile:     req.Mobile,
		LarkOpenID: req.LarkOpenID,
		Status:     req.Status,
		Password:   req.Password,
		Sex:        req.Sex,
		UpdateAt:   timeNow,
		UpdateBy:   req.AdminUserID,
	}

	err := a.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		err := tx.Where(qs.ID.Eq(req.ID)).Updates(newUser).Error
		if err != nil {
			return err
		}

		// 删除该用户所有角色关联（按被编辑用户 ID 删，而非操作人 ID）
		err = tx.Where(rqs.AdminUserID.Eq(req.ID)).Delete(&model.AdminUserRole{}).Error
		if err != nil {
			return err
		}

		userRoles := make([]*model.AdminUserRole, len(req.RoleIDs))
		for i, roleID := range req.RoleIDs {
			userRoles[i] = &model.AdminUserRole{
				AdminUserID: req.ID,
				RoleID:      roleID,
				CreateAt:    timeNow,
				UpdateAt:    timeNow,
				UpdateBy:    req.AdminUserID,
				CreateBy:    req.AdminUserID,
			}
		}
		return tx.CreateInBatches(userRoles, 1000).Error
	})
	if err != nil {
		return err
	}
	return nil
}

func (a *AdminUser) UpdateUserStatus(ctx context.Context, req *do.UpdateUserStatus) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Updates(model.AdminUser{
		Status:   req.Status,
		UpdateAt: time.Now(),
		UpdateBy: req.AdminUserID,
	})
	if err != nil {
		return err
	}
	return nil
}

func (a *AdminUser) UpdateUserPassword(ctx context.Context, req *do.UpdateUserPassword) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(req.ID)).Updates(model.AdminUser{
		Password: req.Password,
	})
	if err != nil {
		return err
	}
	return nil
}

func (a *AdminUser) GetUserInfo(ctx context.Context, userId int64) (*model.AdminUser, error) {
	qs := query.Use(a.db).AdminUser
	return qs.WithContext(ctx).Where(qs.ID.Eq(userId)).First()
}

func (a *AdminUser) GetUserByMobile(ctx context.Context, mobile string) (*model.AdminUser, error) {
	qs := query.Use(a.db).AdminUser
	return qs.WithContext(ctx).Where(qs.Mobile.Eq(mobile)).First()
}

func (a *AdminUser) GetUserByLarkOpenID(ctx context.Context, openID string) (*model.AdminUser, error) {
	qs := query.Use(a.db).AdminUser
	return qs.WithContext(ctx).Where(qs.LarkOpenID.Eq(openID)).First()
}

// UpdateUserLarkOpenID 更新管理员绑定的飞书 open_id（map 形式可写入空串用于解绑）
func (a *AdminUser) UpdateUserLarkOpenID(ctx context.Context, userId int64, openID string) error {
	qs := query.Use(a.db).AdminUser
	_, err := qs.WithContext(ctx).Where(qs.ID.Eq(userId)).Updates(map[string]interface{}{
		"lark_open_id": openID,
	})
	if err != nil {
		return err
	}
	return nil
}

// ListUser 按条件分页查询管理员列表（排除已删除）
func (a *AdminUser) ListUser(ctx context.Context, name, nickName, mobile string, status int32, page, pageSize int32) ([]*model.AdminUser, int64, error) {
	qs := query.Use(a.db).AdminUser
	q := qs.WithContext(ctx).Where(qs.IsDelete.Eq(0))
	if name != "" {
		q = q.Where(qs.Name.Like("%" + name + "%"))
	}
	if nickName != "" {
		q = q.Where(qs.NickName.Like("%" + nickName + "%"))
	}
	if mobile != "" {
		q = q.Where(qs.Mobile.Like("%" + mobile + "%"))
	}
	if status != 0 {
		q = q.Where(qs.Status.Eq(status))
	}

	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}

	// 分页参数兜底
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	list, err := q.Order(qs.CreateAt.Desc()).Offset(int(offset)).Limit(int(pageSize)).Find()
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}
