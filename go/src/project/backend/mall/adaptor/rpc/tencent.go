package rpc

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"mall/adaptor"
	"mall/config"
	"mall/service/do"
	"mall/utils/logger"
	"mall/utils/tools"

	"github.com/tencentyun/cos-go-sdk-v5"
	sts "github.com/tencentyun/qcloud-cos-sts-sdk/go"
)

// https://cloud.tencent.com/document/product/436/68283 临时密钥
// https://console.cloud.tencent.com/cos/bucket 腾讯云对象存储

type IStorage interface {
	// 获取临时上传密钥
	GetTempSecret(ctx context.Context, req *do.GetTempSecret) (*do.TempSecret, error)
	// 获取文件预览地址
	GetPreviewUrl(ctx context.Context, req *do.GetPreviewUrl) (map[string]string, error)
	// 删除文件--视频文件太大，业务层判断是否已经更新视频，更新则原来的文件
	DeleteFile(ctx context.Context, req *do.DeleteFile) error
}

type Storage struct {
	db   *gorm.DB
	conf config.Config
}

func NewStorage(adaptor adaptor.IAdaptor) *Storage {
	return &Storage{
		db:   adaptor.GetDB(),
		conf: *adaptor.GetConfig(),
	}
}

func (s *Storage) getUploadClient(ctx context.Context) (*cos.Client, error) {
	u, err := url.Parse(s.conf.Storage.Bucket.Domain)
	if err != nil {
		return nil, err
	}
	baseUrl := &cos.BaseURL{BucketURL: u}
	uploadClient := cos.NewClient(baseUrl, &http.Client{
		Transport: &cos.AuthorizationTransport{
			SecretID:  s.conf.Storage.SecretID,  // 用户的 SecretId，建议使用子账号密钥，
			SecretKey: s.conf.Storage.SecretKey, // 用户的 SecretKey，建议使用子账号密钥
		},
	})
	return uploadClient, nil
}

func (s *Storage) getPreviewClient(ctx context.Context) (*cos.Client, error) {
	u, err := url.Parse(s.conf.Storage.Bucket.CdnDomain)
	if err != nil {
		return nil, err
	}
	baseUrl := &cos.BaseURL{BucketURL: u}
	preivewClient := cos.NewClient(baseUrl, &http.Client{
		Transport: &cos.AuthorizationTransport{
			SecretID:  s.conf.Storage.SecretID,  // 用户的 SecretId，建议使用子账号密钥，
			SecretKey: s.conf.Storage.SecretKey, // 用户的 SecretKey，建议使用子账号密钥
		},
	})
	return preivewClient, nil
}

func (s *Storage) GetCredentialOptions(path string) *sts.CredentialOptions {
	return &sts.CredentialOptions{
		DurationSeconds: int64(time.Hour.Seconds()),
		Region:          s.conf.Storage.Bucket.Region,
		Policy: &sts.CredentialPolicy{
			Statement: []sts.CredentialPolicyStatement{
				{
					// 密钥的权限列表。简单上传和分片需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
					Action: []string{
						// 简单上传
						"name/cos:PostObject",
						"name/cos:PutObject",
						// 分片上传
						"name/cos:InitiateMultipartUpload",
						"name/cos:ListMultipartUploads",
						"name/cos:ListParts",
						"name/cos:UploadPart",
						"name/cos:CompleteMultipartUpload",
					},
					Effect: "allow",
					Resource: []string{
						// 这里改成允许的路径前缀，可以根据自己网站的用户登录态判断允许上传的具体路径，例子： a.jpg 或者 a/* 或者 * (使用通配符*存在重大安全风险, 请谨慎评估使用)
						// 存储桶的命名格式为 BucketName-APPID，此处填写的 bucket 必须为此格式
						fmt.Sprintf("qcs::cos:%s:uid/%s:%s/%s/*",
							s.conf.Storage.Bucket.Region,
							s.conf.Storage.AppID,
							s.conf.Storage.Bucket.BucketName,
							path),
					},
					// 开始构建生效条件 condition
					// 关于 condition 的详细设置规则和COS支持的condition类型可以参考https://cloud.tencent.com/document/product/436/71306
					Condition: map[string]map[string]interface{}{},
				},
			},
		},
	}
}

func (s *Storage) GetTempSecret(ctx context.Context, req *do.GetTempSecret) (*do.TempSecret, error) {
	client, err := s.getPreviewClient(ctx)
	if err != nil {
		return nil, err
	}
	fileKey, err := s.buildKey(req.Scene, req.FileName)
	if err != nil {
		return nil, err
	}

	opt := s.GetCredentialOptions(strings.TrimPrefix(s.conf.Storage.Bucket.Paths[req.Scene], "/"))
	stClient := sts.NewClient(s.conf.Storage.SecretID, s.conf.Storage.SecretKey, nil)
	res, err := stClient.GetCredential(opt)
	if err != nil {
		logger.Error("GetTempSecret GetCredential error", zap.Error(err))
		return nil, err
	}

	// 生成 PUT 预签名 URL：前端拿到后直接 PUT 文件，无需再走后端代理上传。
	// 注意：签名时若指定了 Content-Type，前端上传时必须携带完全一致的 Content-Type 头。
	contentType := strings.TrimSpace(req.FileType)
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	presignOpt := &cos.PresignedURLOptions{
		Header: &http.Header{},
	}
	presignOpt.Header.Set("Content-Type", contentType)

	pre, err := client.Object.GetPresignedURL(
		ctx,
		http.MethodPut,
		fileKey,
		s.conf.Storage.SecretID,
		s.conf.Storage.SecretKey,
		time.Hour,
		presignOpt,
	)
	if err != nil {
		logger.Error("GetTempSecret GetPresignedURL error", zap.Error(err))
		return nil, err
	}

	// 上传后立即可播放的 GET 预签名地址（私有桶）；过期时间由调用方指定（默认 2 小时，富文本图片传 1 年）
	expire := time.Hour * 2
	if req.ExpireHours > 0 {
		expire = time.Hour * time.Duration(req.ExpireHours)
	}
	accessUrl, err := s.getPresignedGetURL(ctx, fileKey, expire)
	if err != nil {
		accessUrl = s.objectURL(fileKey)
	}

	return &do.TempSecret{
		Bucket:        s.conf.Storage.Bucket.BucketName,
		Region:        s.conf.Storage.Bucket.Region,
		Key:           fileKey,
		FileUrl:       pre.String(),
		AccessUrl:     accessUrl,
		ExpiredTime:   int64(res.ExpiredTime),
		StartTime:     int64(res.StartTime),
		SecretId:      res.Credentials.TmpSecretID,
		SecretKey:     res.Credentials.TmpSecretKey,
		SecurityToken: res.Credentials.SessionToken,
	}, nil
}

// buildKey 按场景路径生成对象 key：{配置前缀}/{uuid}.{扩展名}
func (s *Storage) buildKey(scene, fileName string) (string, error) {
	path, ok := s.conf.Storage.Bucket.Paths[scene]
	if !ok || path == "" {
		return "", fmt.Errorf("不支持的上传场景: %s", scene)
	}
	postFix := ""
	if idx := strings.LastIndex(fileName, "."); idx >= 0 {
		postFix = fileName[idx:]
	}
	return strings.TrimPrefix(path, "/") + "/" + tools.UUIDHex() + postFix, nil
}

// objectURL 拼接对象的永久访问地址（CDN/桶域名 + key）
func (s *Storage) objectURL(key string) string {
	return strings.TrimRight(s.conf.Storage.Bucket.CdnDomain, "/") + "/" + key
}

// getPresignedGetURL 生成 GET 预签名 URL，用于私有桶的视频/图片回显播放。
func (s *Storage) getPresignedGetURL(ctx context.Context, key string, expire time.Duration) (string, error) {
	if expire <= 0 {
		expire = time.Hour * 2
	}
	client, err := s.getPreviewClient(ctx)
	if err != nil {
		return "", err
	}
	pre, err := client.Object.GetPresignedURL(
		ctx, http.MethodGet, key,
		s.conf.Storage.SecretID, s.conf.Storage.SecretKey,
		expire, nil,
	)
	if err != nil {
		return "", err
	}
	return pre.String(), nil
}

// GetPreviewUrl 返回 key -> GET 预签名访问地址 的映射（私有桶可直接播放）
func (s *Storage) GetPreviewUrl(ctx context.Context, req *do.GetPreviewUrl) (map[string]string, error) {
	result := make(map[string]string, len(req.Keys))
	for _, key := range req.Keys {
		if key == "" {
			continue
		}
		url, err := s.getPresignedGetURL(ctx, key, 0)
		if err != nil {
			// 单个失败降级为永久 URL，不影响整体列表
			url = s.objectURL(key)
		}
		result[key] = url
	}
	return result, nil
}

func (s *Storage) DeleteFile(ctx context.Context, req *do.DeleteFile) error {
	client, err := s.getUploadClient(ctx)
	if err != nil {
		return err
	}
	for _, key := range req.Keys {
		if _, err := client.Object.Delete(ctx, key); err != nil {
			return err
		}
	}
	return nil
}
