package redis

import (
	"context"
	"fmt"
	"mall/adaptor"
	"mall/config"
	"time"

	"github.com/go-redis/redis"
)

type IVerify interface {
	SetCaptchaKey(ctx context.Context, key, value string, expire time.Duration) error
	GetCaptchaKey(ctx context.Context, key string) (string, error)
	SetCaptchaTicket(ctx context.Context, key, ticket string, expire time.Duration) error
	GetCaptchaTicket(ctx context.Context, key string) (string, error)

	SetVerifyCode(ctx context.Context, mobile string, sceneCode string, value interface{}, expire time.Duration) error
	GetVerifyCode(ctx context.Context, mobile string, sceneCode string) (string, error)
	DelVerifyCode(ctx context.Context, mobile string, sceneCode string) error

	SetAdminUserToken(ctx context.Context, token string, tokenValue string, expire time.Duration) error
	GetAdminUserToken(ctx context.Context, token string) (string, error)
	DelAdminUserToken(ctx context.Context, token string) error

	IncPasswordErr(ctx context.Context, mobile string, expire time.Duration) (int64, error)
	DelPasswordErr(ctx context.Context, mobile string) error
}

type Verify struct {
	redis *redis.Client
}

func NewVerify(adaptor adaptor.IAdaptor) *Verify {
	return &Verify{
		redis: adaptor.GetRedis(),
	}
}

func fmtVerifyCaptchaKey(key string) string {
	return fmt.Sprintf("%s:captcha:%s", config.ServerFullName, key)
}

func (v *Verify) SetCaptchaKey(ctx context.Context, key string, value string, expire time.Duration) error {
	redisKey := fmtVerifyCaptchaKey(key)
	return v.redis.Set(redisKey, value, expire).Err()
}
func (v *Verify) GetCaptchaKey(ctx context.Context, key string) (string, error) {
	redisKey := fmtVerifyCaptchaKey(key)
	get, err := v.redis.Get(redisKey).Result()
	if err != nil {
		return "", err
	}
	v.redis.Del(redisKey)
	return get, nil
}

func fmtVerifyCaptchaTicket(key string) string {
	return fmt.Sprintf("%s:captcha:ticket:%s", config.ServerFullName, key)
}
func (v *Verify) SetCaptchaTicket(ctx context.Context, key string, ticket string, expire time.Duration) error {
	redisKey := fmtVerifyCaptchaTicket(key)
	return v.redis.Set(redisKey, key, expire).Err()
}
func (v *Verify) GetCaptchaTicket(ctx context.Context, key string) (string, error) {
	redisKey := fmtVerifyCaptchaTicket(key)
	get, err := v.redis.Get(redisKey).Result()
	if err != nil {
		return "", err
	}
	v.redis.Del(redisKey)
	return get, nil
}

func fmtVerifyAdminUserToken(token string) string {
	return fmt.Sprintf("%s:admin_user:token:%s", config.ServerFullName, token)
}

func (v *Verify) SetAdminUserToken(ctx context.Context, token string, tokenValue string, expire time.Duration) error {
	redisKey := fmtVerifyAdminUserToken(token)
	return v.redis.Set(redisKey, tokenValue, expire).Err()
}

func (v *Verify) GetAdminUserToken(ctx context.Context, token string) (string, error) {
	redisKey := fmtVerifyAdminUserToken(token)
	get, err := v.redis.Get(redisKey).Result()
	if err != nil {
		return "", err
	}
	return get, nil
}

func (v *Verify) DelAdminUserToken(ctx context.Context, token string) error {
	redisKey := fmtVerifyAdminUserToken(token)
	return v.redis.Del(redisKey).Err()
}

func (v *Verify) fmtVerifyPasswordErr(mobile string) string {
	return fmt.Sprintf("%s:admin:user:password:err:count:%s", config.ServerFullName, mobile)
}
func (v *Verify) IncPasswordErr(ctx context.Context, mobile string, expire time.Duration) (int64, error) {
	redisKey := v.fmtVerifyPasswordErr(mobile)
	// 不能在 Pipeline 里调用后立刻读 Result()：管道命令要到 Exec() 才真正执行，
	// Exec 之前 .Result() 只会拿到零值 0。这里直接用客户端同步执行 INCR。
	// incr, err := v.redis.Incr(redisKey).Result()
	// if err != nil {
	// 	return 0, err
	// }
	// // 仅第一次计数时设置过期，保证从“首次错误”起有一个固定的计时窗口
	// if incr == 1 {
	// 	if err = v.redis.Expire(redisKey, expire).Err(); err != nil {
	// 		return incr, err
	// 	}
	// }
	// return incr, nil
	pipe := v.redis.Pipeline()

	// 1. 将 Incr 命令放入管道
	incrCmd := pipe.Incr(redisKey)

	// 2. 执行管道（发送给 Redis 并获取结果）
	_, err := pipe.Exec()
	if err != nil {
		fmt.Println("IncPasswordErr exec error:", err)
		return 0, err
	}

	// 3. 从命令对象中获取真正的自增结果
	incr, err := incrCmd.Result()
	if err != nil {
		fmt.Println("IncPasswordErr result error:", err)
		return 0, err
	}

	// 4. 判断 incr == 1，如果是，则执行第二次操作（设置过期时间）
	// 注意：这里无法在同一个 Pipeline 里实现，必须分两次网络请求
	if incr == 1 {
		// 设置过期时间 (使用普通的 Set 或 Expire)
		err = v.redis.Expire(redisKey, expire).Err()
		if err != nil {
			fmt.Println("IncPasswordErr expire error:", err)
			// 此处不建议 return 0, err，因为自增已经成功了，过期失败应该记录日志告警
		}
	}

	return incr, nil
}

func (v *Verify) DelPasswordErr(ctx context.Context, mobile string) error {
	redisKey := v.fmtVerifyPasswordErr(mobile)
	err := v.redis.Del(redisKey).Err()
	return err
}

func fmtVerifyVerifyCode(mobile string, sceneCode string) string {
	return fmt.Sprintf("%s:admin:user:verify_code:%s:%s", config.ServerFullName, mobile, sceneCode)
}

func (v *Verify) SetVerifyCode(ctx context.Context, mobile string, sceneCode string, value interface{}, expire time.Duration) error {
	redisKey := fmtVerifyVerifyCode(mobile, sceneCode)
	return v.redis.Set(redisKey, value, expire).Err()
}
func (v *Verify) GetVerifyCode(ctx context.Context, mobile string, sceneCode string) (string, error) {
	redisKey := fmtVerifyVerifyCode(mobile, sceneCode)
	get, err := v.redis.Get(redisKey).Result()
	if err != nil {
		return "", err
	}
	return get, nil
}
func (v *Verify) DelVerifyCode(ctx context.Context, mobile string, sceneCode string) error {
	redisKey := fmtVerifyVerifyCode(mobile, sceneCode)
	err := v.redis.Del(redisKey).Err()
	return err
}
