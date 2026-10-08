package token

import (
	"context"
	"encoding/json"
	"fmt"
	"time" // 建议移到这里

	"github.com/gogf/gf/util/gconv"
	"go.uber.org/zap"

	"mall/adaptor"
	"mall/adaptor/redis"
	"mall/adaptor/rpc"
	"mall/config"
	"mall/consts"
	"mall/utils/logger"
)

type AccessToken struct {
	Token     string `json:"token"`
	ExpiresIn int64  `json:"expires_in"`
}

type GetTokenFun func() (*AccessToken, error)

type Service struct {
	conf        *config.Config
	locker      redis.ILocker
	accessToken redis.IAccessToken
	lark        rpc.ILark
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		conf:        adaptor.GetConfig(),
		locker:      redis.NewLocker(adaptor),
		accessToken: redis.NewAccessToken(adaptor),
		lark:        rpc.NewLark(adaptor),
	}
}

// 存储access token的key
func (s *Service) cacheTokenKeyFmt(appCode int32) string {
	return fmt.Sprintf("%s:cachetoken:%d", config.ServerFullName, appCode)
}

// 分布式锁key
func (s *Service) lockTokenKeyFmt(appCode int32) string {
	return fmt.Sprintf("%s:locktoken:%d", config.ServerFullName, appCode)
}

func (s *Service) updateToken(ctx context.Context, getToken GetTokenFun, lockKey, cacheKey string) (*AccessToken, error) {
	locked, err := s.locker.GetLock(ctx, lockKey)
	if err != nil {
		return nil, err
	}

	if locked {
		token, err := getToken()
		if err != nil {
			logger.Error("updateToken getToken error", zap.Error(err))
			return nil, err
		}
		err = s.accessToken.SetAccessToken(ctx,
			cacheKey, gconv.String(token),
			time.Duration(token.ExpiresIn-consts.ExpireDueDuration)*time.Second)
		if err != nil {
			logger.Error("updateToken SetAccessToken error", zap.Error(err))
			return nil, err
		}
		return token, nil
	}

	// 等待锁结束
	err = s.locker.AwaitLock(ctx, lockKey, time.Second*5)
	if err != nil {
		logger.Error("updateToken AwaitLock error", zap.Error(err))
		return nil, err
	}
	logger.Debug("updateToken getCache")
	return s.getCache(ctx, cacheKey)
}

func (s *Service) getCache(ctx context.Context, cacheKey string) (*AccessToken, error) {
	tokenJson, expireIn, err := s.accessToken.GetAccessToken(ctx, cacheKey)
	if err != nil {
		return nil, err
	}

	retToken := &AccessToken{}
	err = json.Unmarshal([]byte(tokenJson), &retToken)
	if err != nil {
		logger.Error("getCache Unmarshal error", zap.Error(err))
		return nil, err
	}
	retToken.ExpiresIn = expireIn
	return retToken, nil
}
