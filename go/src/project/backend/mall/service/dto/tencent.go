package dto

type GetTempSecretReq struct {
	Scene       string `json:"scene"`
	FileName    string `json:"file_name"`
	FileSize    int64  `json:"file_size"`
	FileType    string `json:"file_type"`
	ClientIP    string `json:"client_ip"`
	ExpireHours int64  `json:"expire_hours"` // access_url 过期小时数，0 默认 2 小时
}

type TempSecretResp struct {
	SecretId      string `json:"secret_id"`
	SecretKey     string `json:"secret_key"`
	SecurityToken string `json:"security_token"`
	ExpiredTime   int64  `json:"expired_time"`
	StartTime     int64  `json:"start_time"`
	Bucket        string `json:"bucket"`
	Region        string `json:"region"`
	Key           string `json:"key"`
	FileUrl       string `json:"file_url"`
	AccessUrl     string `json:"access_url"`
}
