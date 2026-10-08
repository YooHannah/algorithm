package rpc

import (
	"context"
	"errors"
	"fmt"

	"mall/adaptor"
	"mall/config"
	"mall/service/do"
	"mall/utils/http"
	"mall/utils/logger"

	"github.com/samber/lo"
	"go.uber.org/zap"
)

const (
	HttpAccept         = "application/json"               // no usages
	HttpContentType    = "application/json;charset=utf-8" // 1 usage
	LarkHost           = "https://open.feishu.cn"         // 4 usages
	LarkChatGroupType  = "chat_id"                        // no usages
	LarkChatPersonType = "open_id"                        // no usages
)

type ILark interface {
	GetLarkUserInfo(ctx context.Context, userAccessToken string) (*do.LarkUserInfo, error)
	GetLarkUserAccessToken(
		ctx context.Context,
		appCode int32, code string,
		redirectUrl string, scope string) (*do.LarkUserAccessToken, error)

	// 发送消息
	SendLarkMsg(ctx context.Context, getToken GetTokenFunc, req *do.SendLarkMsg) error

	GetLarkTenantAccessToken(ctx context.Context, appCode int32) (*do.LarkTenantAccessToken, error)
}

type Lark struct {
	conf *config.Config
}

// GetTokenFunc 获取访问 token。
// force=false 时允许使用缓存；force=true 时必须向飞书重新获取（用于 token 失效重试）。
type GetTokenFunc func(ctx context.Context, force bool) (string, error)

func NewLark(adaptor adaptor.IAdaptor) *Lark {
	return &Lark{
		conf: adaptor.GetConfig(),
	}
}

func (l *Lark) GetLarkUserInfo(ctx context.Context, userAccessToken string) (*do.LarkUserInfo, error) {
	url := fmt.Sprintf("%s/open-apis/authen/v1/user_info", LarkHost)
	param := map[string]interface{}{}
	headers := map[string]string{
		"Content-Type":  "application/json; charset=utf-8",
		"Authorization": fmt.Sprintf("Bearer %s", userAccessToken),
	}

	type Response struct {
		Code int64           `json:"code"`
		Msg  string          `json:"msg"`
		Data do.LarkUserInfo `json:"data"`
	}

	resp := &Response{}
	err := http.Get(ctx, url, headers, param, resp)
	if err != nil {
		return nil, err
	}

	if resp.Code != 0 {
		return nil, fmt.Errorf("code:%d, msg:%s", resp.Code, resp.Msg)
	}

	return &resp.Data, nil
}
func (l *Lark) GetLarkUserAccessToken(
	ctx context.Context,
	appCode int32, code string,
	redirectUrl string, scope string) (*do.LarkUserAccessToken, error) {
	url := "https://open.feishu.cn/open-apis/authen/v2/oauth/token"

	body := map[string]interface{}{
		"grant_type":    "authorization_code",
		"client_id":     l.conf.AppConf[appCode].AppID,
		"client_secret": l.conf.AppConf[appCode].AppSecret,
		"code":          code,
		"redirect_uri":  redirectUrl,
		"scope":         scope,
	}
	headers := map[string]string{
		"Content-Type": "application/json",
		"Accept":       "application/json;charset=utf-8",
	}
	resp := &do.LarkUserAccessToken{}
	err := http.Post(ctx, url, headers, body, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (l *Lark) GetLarkTenantAccessToken(ctx context.Context, appCode int32) (*do.LarkTenantAccessToken, error) {
	url := fmt.Sprintf("%s/open-apis/auth/v3/tenant_access_token/internal", LarkHost)
	body := map[string]interface{}{
		"app_id":     l.conf.AppConf[appCode].AppID,
		"app_secret": l.conf.AppConf[appCode].AppSecret,
	}
	headers := map[string]string{
		"Content-Type": "application/json; charset=utf-8",
	}
	resp := &do.LarkTenantAccessToken{}
	err := http.Post(ctx, url, headers, body, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// LarkResp 飞书开放平台通用响应（不含 data 的场景）
type LarkResp struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
}

func (l LarkResp) IsOK() bool { return l.Code == 0 }

func (l LarkResp) IsTokenInvalid() bool { return l.Code == 4001 }

func (l LarkResp) Error() string {
	return fmt.Sprintf("code: %d, msg: %s", l.Code, l.Msg)
}

// SendLarkMsg 发送飞书消息。
// 文档：https://open.feishu.cn/document/server-docs/im-v1/message/create
func (l *Lark) SendLarkMsg(ctx context.Context, getToken GetTokenFunc, req *do.SendLarkMsg) error {
	// https://open.feishu.cn/document/server-docs/im-v1/message/create
	path := fmt.Sprintf("%s/open-apis/im/v1/messages", LarkHost)
	resp := &LarkResp{}
	force := false
	reqHeaders := map[string]string{
		"Content-Type": HttpContentType,
	}
	body := map[string]interface{}{
		"content":    fmt.Sprintf("{\"text\": \"%s\"}", req.Content),
		"msg_type":   "text",
		"receive_id": req.OpenID,
	}

	// 2次重试机制（处理 Token 过期情况）
	for _, v := range lo.Range(2) {
		token, err := getToken(ctx, force)
		if err != nil {
			return err
		}
		reqHeaders["Authorization"] = "Bearer " + token
		url := fmt.Sprintf("%s?receive_id_type=%s", path, req.IDType)
		err = http.Post(ctx, url, reqHeaders, body, resp)
		if err != nil {
			logger.Error("SendLarkMsg send fail", zap.Any("index", v), zap.Any("resp", resp))
			continue
		}
		// 发送成功
		if resp.IsOK() {
			break
		}
		// token失效，触发强刷
		if resp.IsTokenInvalid() {
			force = true
			continue
		}
		logger.Error("SendLarkMsg send resp error", zap.Any("index", v), zap.Any("resp", resp.Error()))
	}

	if !resp.IsOK() {
		logger.Error("SendLarkMsg send fail", zap.Any("resp", resp))
		return errors.New(resp.Error())
	}

	return nil
}
