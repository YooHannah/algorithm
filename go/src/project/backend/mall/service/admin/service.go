package admin

import (
	"mall/adaptor"
	"mall/adaptor/redis"
	"mall/adaptor/repo/admin"
	"mall/adaptor/rpc"
	"mall/config"
	"mall/service/token"
	"mall/utils/captcha"

	"github.com/wenlng/go-captcha/v2/slide"
)

type Service struct {
	conf      *config.Config
	adminRole admin.IAdminRole
	adminUser admin.IAdminUser
	verify    redis.IVerify
	captcha   slide.Captcha
	token     *token.Service
	lark      rpc.ILark
}

func NewService(adaptor adaptor.IAdaptor) *Service {
	return &Service{
		conf:      adaptor.GetConfig(),
		adminUser: admin.NewAdminUser(adaptor),
		adminRole: admin.NewAdminRole(adaptor),
		verify:    redis.NewVerify(adaptor),
		captcha:   captcha.NewSlideCaptcha(),
		token:     token.NewService(adaptor),
		lark:      rpc.NewLark(adaptor),
	}
}
