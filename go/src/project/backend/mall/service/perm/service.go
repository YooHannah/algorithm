package perm

import (
	"context"
	"mall/adaptor"
	"mall/adaptor/repo/admin"
	"mall/common"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"

	"go.uber.org/zap"
)

type Service struct {
	perm admin.IAdminPerm
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		perm: admin.NewAdminPerm(adaptor),
	}
}

func (s *Service) GetPermAll(ctx context.Context) ([]*dto.PermissionDto, error) {
	perms, err := s.perm.GetPermAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtoPerms []*dto.PermissionDto
	for _, perm := range perms {
		dtoPerms = append(dtoPerms, &dto.PermissionDto{
			ID:       perm.ID,
			Code:     perm.Code,
			Type:     perm.Type,
			Name:     perm.Name,
			PagePath: perm.PagePath,
			ParentID: perm.ParentID,
			Status:   perm.Status,
			Sort:     perm.Sort,
			Desc:     perm.Desc,
		})
	}
	return dtoPerms, nil
}

func (s *Service) GetPermList(ctx context.Context, userId int64) ([]*dto.PermissionDto, error) {
	perms, err := s.perm.GetPermList(ctx, userId)
	if err != nil {
		return nil, err
	}
	var dtoPerms []*dto.PermissionDto
	for _, perm := range perms {
		dtoPerms = append(dtoPerms, &dto.PermissionDto{
			ID:       perm.ID,
			Code:     perm.Code,
			Type:     perm.Type,
			Name:     perm.Name,
			PagePath: perm.PagePath,
			ParentID: perm.ParentID,
			Status:   perm.Status,
			Sort:     perm.Sort,
			Desc:     perm.Desc,
		})
	}
	return dtoPerms, nil
}
func (s *Service) CreatePerm(ctx context.Context, adminUser *common.AdminUser, req *dto.CreatePermissionReq) (int64, common.Errno) {
	permID, err := s.perm.CreatePerm(ctx, &do.CreatePermission{
		AdminUserID: adminUser.UserID,
		Code:        req.Code,
		Type:        req.Type,
		Name:        req.Name,
		PagePath:    req.PagePath,
		ParentID:    req.ParentID,
		Sort:        req.Sort,
		Desc:        req.Desc,
	})
	if err != nil {
		logger.Error("CreatePerm error", zap.Error(err), zap.Any("req", req))
		return 0, common.DatabaseErr.WithErr(err)
	}
	return permID, common.OK
}

func (s *Service) UpdatePerm(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdatePermissionReq) error {

	list := make([]do.UpdatePermissionItem, 0, len(req.List))
	for _, perm := range req.List {
		list = append(list, do.UpdatePermissionItem{
			ID: perm.ID,
			CreatePermission: do.CreatePermission{
				AdminUserID: adminUser.UserID,
				Code:        perm.Code,
				Type:        perm.Type,
				Name:        perm.Name,
				PagePath:    perm.PagePath,
				ParentID:    perm.ParentID,
				Sort:        perm.Sort,
				Desc:        perm.Desc,
			},
		})
	}
	err := s.perm.UpdatePerm(ctx, &do.UpdatePermission{
		List: list,
	})
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) DeletePerm(ctx context.Context, permID int64) error {
	err := s.perm.DeletePerm(ctx, &do.DeletePermission{
		ID: permID,
	})
	if err != nil {
		return err
	}
	return nil
}
