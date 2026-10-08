package do

import "time"

type GetTempSecret struct {
	Scene       string
	FileName    string
	FileSize    int64
	FileType    string
	ClientIP    string
	ExpireHours int64 // access_url（GET 预签名）过期小时数，0 表示默认 2 小时
}

type TempSecret struct {
	SecretId      string
	SecretKey     string
	SecurityToken string
	ExpiredTime   int64
	StartTime     int64
	Bucket        string
	Region        string
	Key           string
	FileUrl       string
	AccessUrl     string
}

type GetPreviewUrl struct {
	Keys   []string
	Expire int64
}

type DeleteFile struct {
	Keys []string
}

type ResourceUploadFile struct {
	Scene          string
	FileKey        string
	UserID         int64
	UserType       int64
	FileType       string
	FileSize       int64
	FileName       string
	UploadClientIP string
	CreateAt       time.Time
}
