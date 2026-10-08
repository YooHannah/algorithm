package redis

import (
	"context"
	"errors"
	"time"

	"github.com/go-redis/redis"
	"github.com/google/uuid"

	"mall/adaptor"
)

// 锁默认安全过期时间：持锁方异常崩溃时防止死锁。
// 调用方 AwaitLock 的等待上限通常为 5s，这里取相同量级，
// 使未抢到锁的一方在轮询窗口内能观察到锁释放（过期）。
const defaultLockExpire = 5 * time.Second

// awaitLockInterval AwaitLock 轮询间隔
const awaitLockInterval = 100 * time.Millisecond

// ErrLockTimeout 等待锁释放超时
var ErrLockTimeout = errors.New("await lock timeout")

// ILocker 分布式锁（single-flight 场景：抢到锁的一方执行刷新，其余方等待后读缓存）
type ILocker interface {
	// GetLock 尝试获取锁：返回 true 表示成功获取（当前方负责临界区操作），
	// false 表示锁已被他人持有。
	GetLock(ctx context.Context, key string) (bool, error)
	// AwaitLock 阻塞等待直到锁被释放、ctx 取消或等待超时。
	AwaitLock(ctx context.Context, key string, timeout time.Duration) error
	// SetLock 直接设置一个带过期时间的锁。
	SetLock(ctx context.Context, key string, expire time.Duration) error
}

// Locker ILocker 的实现
type Locker struct {
	redis *redis.Client
}

func NewLocker(adaptor adaptor.IAdaptor) *Locker {
	return &Locker{
		redis: adaptor.GetRedis(),
	}
}

// GetLock 使用 SetNX 原子抢锁，并写入唯一 owner token 与安全过期时间。
func (l *Locker) GetLock(ctx context.Context, key string) (bool, error) {
	// owner token：标识本次持锁方，为后续“compare-and-delete”安全释放预留语义。
	owner := uuid.NewString()
	return l.redis.SetNX(key, owner, defaultLockExpire).Result()
}

// AwaitLock 轮询锁 key，直到其不存在（被释放或过期）；ctx 取消或超时则返回错误。
func (l *Locker) AwaitLock(ctx context.Context, key string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	ticker := time.NewTicker(awaitLockInterval)
	defer ticker.Stop()

	for {
		// 先检查锁是否仍存在（首轮立即检查，不必先等一个间隔）
		exists, err := l.redis.Exists(key).Result()
		if err != nil {
			return err
		}
		if exists == 0 {
			return nil
		}
		if time.Now().After(deadline) {
			return ErrLockTimeout
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}

// SetLock 直接设置带过期时间的锁。
func (l *Locker) SetLock(ctx context.Context, key string, expire time.Duration) error {
	return l.redis.Set(key, "", expire).Err()
}

// IAccessToken 以 Redis string 存储 access token（JSON），并带回剩余 TTL。
type IAccessToken interface {
	// SetAccessToken 将 token JSON 写入 key，并设置过期时间。
	SetAccessToken(ctx context.Context, key, value string, expire time.Duration) error
	// GetAccessToken 返回 token JSON 与其剩余存活秒数（TTL）。
	GetAccessToken(ctx context.Context, key string) (tokenJson string, expireIn int64, err error)
}

// AccessToken IAccessToken 的实现
type AccessToken struct {
	redis *redis.Client
}

func NewAccessToken(adaptor adaptor.IAdaptor) *AccessToken {
	return &AccessToken{
		redis: adaptor.GetRedis(),
	}
}

// SetAccessToken 直接 Set 并带过期时间。
func (a *AccessToken) SetAccessToken(ctx context.Context, key, value string, expire time.Duration) error {
	return a.redis.Set(key, value, expire).Err()
}

// GetAccessToken 读取 token JSON，并查询 key 的剩余 TTL（秒）作为 expireIn。
func (a *AccessToken) GetAccessToken(ctx context.Context, key string) (string, int64, error) {
	client := a.redis

	tokenJson, err := client.Get(key).Result()
	if err != nil {
		return "", 0, err
	}

	ttl, err := client.TTL(key).Result()
	if err != nil {
		return "", 0, err
	}

	return tokenJson, int64(ttl.Seconds()), nil
}
