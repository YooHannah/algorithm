package admin

import (
	"context"
	"fmt"

	"mall/common"
	"mall/service/dto"
	"mall/utils/logger"
	"mall/utils/tools"

	"github.com/go-redis/redis"
	"go.uber.org/zap"
)

func (s *Service) MobilePasswordLogin(ctx context.Context, req *dto.MobilePasswordLoginReq) (*dto.MobilePasswordLoginDtoResp, common.Errno) {
	if req.Ticket == "" {
		return nil, common.ParamErr.WithMsg("ticket is empty")
	}
	if req.Phone == "" {
		return nil, common.ParamErr.WithMsg("phone is empty")
	}
	if req.Password == "" {
		return nil, common.ParamErr.WithMsg("password is empty")
	}
	// 校验验证码
	ticket, err := s.verify.GetCaptchaTicket(ctx, req.Ticket)
	if err != nil {
		if err == redis.Nil {
			return nil, common.InvalidCaptchaErr
		}
		return nil, common.RedisErr.WithErr(err)
	}
	if ticket != req.Ticket {
		logger.Error("MobilePasswordLogin GetCaptchaTicket error", zap.Error(err))
		return nil, common.ParamErr.WithMsg("ticket is invalid")
	}

	// 校验手机号是否存在
	user, err := s.adminUser.GetUserByMobile(ctx, req.Phone)
	if err != nil {
		logger.Error("MobilePasswordLogin GetUserByMobile error", zap.Error(err))
		return nil, common.DatabaseErr.WithErr(err)
	}
	if user.Password != req.Password {
		return nil, common.InvalidPasswordErr
	}
	token := tools.Sha256Hash(fmt.Sprintf("%d", user.ID))

	// 登录成功，设置token到redis
	// err = s.verify.SetCaptchaTicket(ctx, token, req.Ticket, time.Minute*2)
	// if err != nil {
	// 	logger.Error("MobilePasswordLogin SetCaptchaTicket error", zap.Error(err))
	// 	return nil, common.RedisErr.WithErr(err)
	// }
	return &dto.MobilePasswordLoginDtoResp{
		Token: token,
		User: dto.UserInfoResp{
			UserID: user.ID,
			Name:   user.Name,
		},
	}, common.OK
}
