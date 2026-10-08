package router

var AdminAuthWhiteList = map[string]bool{
	"/ping":                                 true,
	"/metrics":                              true,
	"/admin/v1/user/verify/captcha/check":   true,
	"/admin/v1/user/verify/captcha":         true,
	"/admin/v1/user/verify/mobile/password": true,
	"/admin/v1/user/login/mobile/password":  true,
	"/admin/v1/user/verify/smscode":         true,
	"/admin/v1/user/login/mobile/phone":     true,
	"/admin/v1/user/login/Lark/qrcode":      true,
	"/admin/v1/user/mobile/verify_login":    true,
	"/admin/v1/user/mobile/password_login":  true,
	"/admin/v1/user/password/reset":         true,
}
