package role

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
	role admin.IAdminRole
	perm admin.IAdminPerm
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		role: admin.NewAdminRole(adaptor),
		perm: admin.NewAdminPerm(adaptor),
	}
}

func (s *Service) GetRoleList(ctx context.Context, adminUser *common.AdminUser, req *dto.GetRoleListReq) ([]*dto.RoleDto, int64, error) {
	list, total, err := s.role.GetRoleList(ctx, req.Name, req.Status, req.Page, req.PageSize)
	if err != nil {
		logger.Error("get role list error", zap.Error(err))
		return nil, 0, err
	}

	ids := make([]int64, 0, len(list))
	for _, role := range list {
		ids = append(ids, role.ID)
	}
	rolePermMap, err := s.role.GetRolePerms(ctx, ids)
	if err != nil {
		logger.Error("get role perms error", zap.Error(err))
		return nil, 0, err
	}

	// 对rolePermMap 的值进行摊平去重
	purePermIds := make([]int64, 0)
	for _, permIds := range rolePermMap {
		purePermIds = append(purePermIds, permIds...)
	}
	// 对purePermIds 进行去重
	purePermIds = FlattenAndUnique(purePermIds)
	permList, err := s.perm.GetPermissionByIDs(ctx, purePermIds)
	if err != nil {
		return nil, 0, err
	}
	// 转换为 map[int64][]dto.RolePermsItem
	permMap := make(map[int64][]dto.RolePermsItem)
	for _, perm := range permList {
		permMap[perm.ID] = append(permMap[perm.ID], dto.RolePermsItem{
			ID:   perm.ID,
			Name: perm.Name,
		})
	}

	// model -> dto
	roleList := make([]*dto.RoleDto, 0, len(list))
	for _, role := range list {
		permsList := make([]dto.RolePermsItem, 0, len(rolePermMap[role.ID]))
		for _, perm := range rolePermMap[role.ID] {
			permsList = append(permsList, permMap[perm]...)
		}
		roleList = append(roleList, &dto.RoleDto{
			ID:       role.ID,
			Name:     role.Name,
			Desc:     role.Desc,
			Status:   role.Status,
			CreateAt: role.CreateAt.UnixMilli(),
			UpdateAt: role.UpdateAt.UnixMilli(),
			Perms:    permsList,
		})
	}

	return roleList, total, nil
}

func (s *Service) CreateRole(ctx context.Context, adminUser *common.AdminUser, req *dto.CreateRoleReq) (int64, common.Errno) {
	roleID, err := s.role.CreateRole(ctx, &do.CreateRole{
		AdminUserID: adminUser.UserID,
		Name:        req.Name,
		Desc:        req.Desc,
		Status:      req.Status,
	})
	if err != nil {
		logger.Error("create role error", zap.Error(err))
		return 0, common.DatabaseErr.WithErr(err)
	}
	return roleID, common.OK
}

func (s *Service) UpdateRole(ctx context.Context, adminUser *common.AdminUser, req *dto.UpdateRoleReq) error {
	return s.role.UpdateRole(ctx, &do.UpdateRole{
		ID:          req.ID,
		AdminUserID: adminUser.UserID,
		Name:        req.Name,
		Desc:        req.Desc,
		Status:      req.Status,
	})
}

func (s *Service) DeleteRole(ctx context.Context, req *dto.DeleteRoleReq) error {
	return s.role.DeleteRole(ctx, &do.DeleteRole{
		ID: req.ID,
	})
}

func (s *Service) SetRolePerms(ctx context.Context, userID int64, req *dto.SetRolePermsReq) error {
	return s.role.SetRolePerms(ctx, userID, req)
}

// GetRolePermSets 获取单个角色已分配的权限 ID 列表
func (s *Service) GetRolePermSets(ctx context.Context, roleID int64) ([]int64, error) {
	permMap, err := s.role.GetRolePerms(ctx, []int64{roleID})
	if err != nil {
		return nil, err
	}
	if ids, ok := permMap[roleID]; ok {
		return ids, nil
	}
	return []int64{}, nil
}
func (s *Service) GetMyRoles(ctx context.Context, req *dto.GetMyRolesReq) ([]*dto.RoleDto, error) {
	roleList, err := s.role.GetMyRoles(ctx, req.UserID)
	if err != nil {
		return nil, err
	}
	pureRoleIds := make([]int64, 0, len(roleList))
	for _, role := range roleList {
		pureRoleIds = append(pureRoleIds, role.ID)
	}
	rolePermMap, err := s.role.GetRolePerms(ctx, pureRoleIds)
	if err != nil {
		return nil, err
	}
	// 对rolePermMap 的值进行摊平去重
	purePermIds := make([]int64, 0)
	for _, permIds := range rolePermMap {
		purePermIds = append(purePermIds, permIds...)
	}
	// 对purePermIds 进行去重
	purePermIds = FlattenAndUnique(purePermIds)
	permList, err := s.perm.GetPermissionByIDs(ctx, purePermIds)
	if err != nil {
		return nil, err
	}

	permTemplist := make([]dto.RolePermsItem, 0, len(permList))
	for _, perm := range permList {
		permTemplist = append(permTemplist, dto.RolePermsItem{
			ID:   perm.ID,
			Name: perm.Name,
		})
	}
	roleDtoList := make([]*dto.RoleDto, 0, len(roleList))
	for _, role := range roleList {
		roleDtoList = append(roleDtoList, &dto.RoleDto{
			ID:       role.ID,
			Name:     role.Name,
			Desc:     role.Desc,
			Status:   role.Status,
			Perms:    permTemplist,
			CreateAt: role.CreateAt.Unix(),
			UpdateAt: role.UpdateAt.Unix(),
		})
	}
	return roleDtoList, nil
}

// FlattenAndUnique 对 int64 切片去重（保持首次出现顺序）
func FlattenAndUnique(ids []int64) []int64 {
	if len(ids) == 0 {
		return nil
	}
	seen := make(map[int64]struct{}, len(ids))
	result := make([]int64, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		result = append(result, id)
	}
	return result
}
