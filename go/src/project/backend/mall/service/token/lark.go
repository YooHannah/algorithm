package token

import (
	"context"

	"go.uber.org/zap"

	"mall/common"
	"mall/service/do"
	"mall/utils/logger"
)

func (s *Service) GetLarkUserAccessToken(ctx context.Context, appCode int32, code string, redirectUrl string, scope string, force bool) (*AccessToken, error) {
	token, err := s.getLarkUserAccessToken(ctx, appCode, code, redirectUrl, scope, force)
	if err != nil {
		logger.Error("GetJianyuAccessToken get access token failed", zap.Error(err), zap.Any("appCode", appCode))
		return nil, common.NotOk
	}
	return token, common.OK
}

func (s *Service) getLarkUserAccessToken(ctx context.Context, appCode int32, code string, redirectUrl string, scope string, force bool) (*AccessToken, error) {
	getTokenFunc := func() (*AccessToken, error) {
		token, err := s.lark.GetLarkUserAccessToken(ctx, appCode, code, redirectUrl, scope)
		if err != nil {
			logger.Error("getLarkUserAccessToken GetLarkUserAccessToken get access token failed", zap.Error(err))
			return nil, common.ServerErr.WithErr(err)
		}
		return &AccessToken{
			Token:     token.AccessToken,
			ExpiresIn: token.ExpiresIn,
		}, nil
	}
	rpcToken, err := getTokenFunc()
	if err != nil {
		logger.Error("getLarkUserAccessToken getTokenFunc failed", zap.Error(err), zap.Any("appCode", appCode))
		return nil, common.ServerErr.WithErr(err)
	}
	return rpcToken, nil
}

func (s *Service) GetLarkTenantAccessToken(ctx context.Context, appCode int32, force bool) (*do.LarkTenantAccessToken, error) {
	token, err := s.lark.GetLarkTenantAccessToken(ctx, appCode)
	if err != nil {
		logger.Error("GetLarkTenantAccessToken get access token failed", zap.Error(err), zap.Any("appCode", appCode))
		return nil, common.NotOk
	}
	return token, common.OK
}
