package consts

import "time"

const (
	AdminTokenKey   = "token"
	UserTokenKey    = "token"
	CustomerUserKey = "user_key"
	AdminUserKey    = "admin_user_key"
)

const (
	AdminUserTokenExpire        = time.Hour * 24
	AdminUserPassWrongErrCount  = 3
	AdminUserPassWrongErrExpire = time.Minute * 10
)

// ExpireDueDuration token 提前过期的安全余量（秒）：
// 缓存 token 时在其真实有效期上减去该值，避免临界时刻用到即将失效的 token。
const ExpireDueDuration int64 = 5
const (
	IsEnable  = 1
	IsDisable = -1
)

const (
	WechatAppCode = 1000
	LarkAppCode   = 2000
)

const (
	LarkIDTypeOpenID = 1
)

// 短信验证码场景（需与前端发送验证码时的 scene 保持一致）
const (
	SmsSceneLogin      = "login"
	SmsSceneChangePwd  = "change_password"
)
