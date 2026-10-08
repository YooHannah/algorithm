package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	stdhttp "net/http"
	"net/url"
	"strings"
	"time"
)

// defaultClient 默认 HTTP 客户端：复用底层连接，并设置整体请求超时作为兜底。
var defaultClient = &stdhttp.Client{
	Timeout: 10 * time.Second,
}

// Get 发起 HTTP GET 请求。
//   - params：query 参数，会被编码后拼接到 URL；
//   - headers：自定义请求头；
//   - resp：响应体的 JSON 反序列化目标，传 nil 表示忽略响应体。
func Get(
	ctx context.Context,
	rawURL string,
	headers map[string]string,
	params map[string]interface{},
	resp interface{},
) error {
	if len(params) > 0 {
		values := url.Values{}
		for key, val := range params {
			values.Add(key, fmt.Sprintf("%v", val))
		}
		sep := "?"
		if strings.Contains(rawURL, "?") {
			sep = "&"
		}
		rawURL += sep + values.Encode()
	}

	req, err := stdhttp.NewRequestWithContext(ctx, stdhttp.MethodGet, rawURL, nil)
	if err != nil {
		return err
	}
	setHeaders(req, headers)

	return do(req, resp)
}

// Post 发起 HTTP POST 请求，body 会被编码为 JSON。
//   - headers：自定义请求头；
//   - resp：响应体的 JSON 反序列化目标，传 nil 表示忽略响应体。
func Post(
	ctx context.Context,
	rawURL string,
	headers map[string]string,
	body map[string]interface{},
	resp interface{},
) error {
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(data)
	}

	req, err := stdhttp.NewRequestWithContext(ctx, stdhttp.MethodPost, rawURL, reader)
	if err != nil {
		return err
	}
	setHeaders(req, headers)

	return do(req, resp)
}

func setHeaders(req *stdhttp.Request, headers map[string]string) {
	for key, val := range headers {
		req.Header.Set(key, val)
	}
}

// do 执行请求，对非 2xx 状态码报错，并将响应体 JSON 解码到 resp。
func do(req *stdhttp.Request, resp interface{}) error {
	httpResp, err := defaultClient.Do(req)
	if err != nil {
		return err
	}
	defer httpResp.Body.Close()

	data, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return err
	}

	if httpResp.StatusCode < 200 || httpResp.StatusCode >= 300 {
		return fmt.Errorf("http request failed, status: %d, body: %s", httpResp.StatusCode, truncate(data))
	}

	if resp != nil && len(data) > 0 {
		if err = json.Unmarshal(data, resp); err != nil {
			return fmt.Errorf("decode response failed: %w, body: %s", err, truncate(data))
		}
	}
	return nil
}

// truncate 截断过长的响应体，避免错误信息过大。
func truncate(b []byte) string {
	const maxLen = 512
	if len(b) > maxLen {
		return string(b[:maxLen]) + "...(truncated)"
	}
	return string(b)
}
