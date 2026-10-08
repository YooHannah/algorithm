package do

type LarkUserInfo struct {
	Name            string `json:"name"`             // 用户姓名
	EnName          string `json:"en_name"`          // 用户英文名称
	AvatarURL       string `json:"avatar_url"`       // 用户头像
	AvatarThumb     string `json:"avatar_thumb"`     // 用户头像72x72
	AvatarMiddle    string `json:"avatar_middle"`    // 用户头像240x240
	AvatarBig       string `json:"avatar_big"`       // 用户头像640x640
	OpenID          string `json:"open_id"`          // 用户在应用内的唯一标识
	UnionID         string `json:"union_id"`         // 用户对ISV的唯一标识，对于同一个ISV，用户[截断]
	Email           string `json:"email"`            // 用户邮箱（字段权限要求：获取用户邮箱信息，[截断]
	EnterpriseEmail string `json:"enterprise_email"` // 企业邮箱，请先确保已在管理后台启用飞书邮箱[截断]
	UserID          string `json:"user_id"`          // 用户user_id（字段权限要求：获取用户userID[截断]
	Mobile          string `json:"mobile"`           // 用户手机号（字段权限要求：获取用户手机号，[截断]
	TenantKey       string `json:"tenant_key"`       // 当前企业标识
	EmployeeNo      string `json:"employee_no"`      // 用户工号（字段权限要求：获取用户受雇信息，[截断]
}

type LarkUserAccessToken struct {
	Code        int64  `json:"code"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	ErrCode     string `json:"error"`
	ErrMsg      string `json:"error_description"`
}

type LarkTenantAccessToken struct {
	Code              int64  `json:"code"`
	Msg               string `json:"msg"`
	TenantAccessToken string `json:"tenant_access_token"`
	Expire            int64  `json:"expire"`
}

type SendLarkMsg struct {
	AppCode int32  // APP CODE 2000 飞书后台应用
	OpenID  string // lark open_id
	IDType  string
	Content string // fmt.Sprintf("<b>手机验证码</b>\n\n手机号：%s \n验证码：%s", req.Mobile, verifyCode)
}
