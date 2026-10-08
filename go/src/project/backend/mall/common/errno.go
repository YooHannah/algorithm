package common

type Errno struct {
	Code   int
	Msg    string
	ErrMsg string
}

func (err Errno) Error() string {
	return err.Msg
}

func (err Errno) WithMsg(msg string) Errno {
	err.Msg = err.Msg + "," + msg
	return err
}

func (err Errno) WithErr(rawErr error) Errno {
	var msg string
	if rawErr != nil {
		msg = rawErr.Error()
	}
	err.ErrMsg = err.Msg + "," + msg
	return err
}

func (err Errno) IsOk() bool {
	return err.Code == 200
}

var (
	OK            = Errno{Code: 200, Msg: "OK"}
	NotOk         = Errno{Code: 400, Msg: "Not Ok"}
	ServerErr     = Errno{Code: 500, Msg: "Internal Server Error"}
	ParamErr      = Errno{Code: 400, Msg: "Param Error"}
	AuthErr       = Errno{Code: 401, Msg: "Auth Error"}
	PermissionErr = Errno{Code: 403, Msg: "Permission Error"}

	DatabaseErr = Errno{Code: 10000, Msg: "Database Error"}
	RedisErr    = Errno{Code: 10001, Msg: "Redis Error"}

	UserNotFoundErr       = Errno{Code: 11001, Msg: "User Not Found"}
	InvalidCaptchaErr     = Errno{Code: 11002, Msg: "滑块校验失败，请重试"}
	InvalidPasswordErr    = Errno{Code: 11003, Msg: "用户名/密码错误"} // 防止重试
	UserStatusErr         = Errno{Code: 11004, Msg: "用户状态异常"}
	AdminUserPassWrongErr = Errno{Code: 11005, Msg: "密码错误，10分钟内不能重复登录超过3次"}
	InvalidVerifyCodeErr  = Errno{Code: 11006, Msg: "验证码错误"}
)
