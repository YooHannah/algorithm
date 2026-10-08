package storage

import (
	"context"

	"mall/common"
	"mall/service/do"
	"mall/service/dto"
	"mall/utils/logger"

	"go.uber.org/zap"
)

func (s *Service) GetTempSecret(ctx context.Context, req *dto.GetTempSecretReq) (*dto.TempSecretResp, error) {
	secret, err := s.cos.GetTempSecret(ctx, &do.GetTempSecret{
		Scene:       req.Scene,
		FileName:    req.FileName,
		FileSize:    req.FileSize,
		FileType:    req.FileType,
		ClientIP:    req.ClientIP,
		ExpireHours: req.ExpireHours,
	})
	if err != nil {
		logger.Error("GetTempSecret GetTempSecret error", zap.Any("req", req))
		return nil, common.ServerErr.WithErr(err)
	}
	return &dto.TempSecretResp{
		Bucket:        secret.Bucket,
		ExpiredTime:   secret.ExpiredTime,
		StartTime:     secret.StartTime,
		Key:           secret.Key,
		Region:        secret.Region,
		SecretId:      secret.SecretId,
		SecretKey:     secret.SecretKey,
		SecurityToken: secret.SecurityToken,
		FileUrl:       secret.FileUrl,
		AccessUrl:     secret.AccessUrl,
	}, nil
}
