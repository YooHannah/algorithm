package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

type UserSession struct {
	UserID         string
	LoginTime      time.Time
	LastActiveTime time.Time
	IpAddress      string
}

type SessionManager struct {
	sessions map[string]*UserSession
	mutex    sync.RWMutex
}

func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]*UserSession),
	}
}

func (sm *SessionManager) AddSession(token string, userID string, ipAddress string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session := &UserSession{
		UserID:         userID,
		LoginTime:      time.Now(),
		LastActiveTime: time.Now(),
		IpAddress:      ipAddress,
	}
	sm.sessions[token] = session
}

func (sm *SessionManager) GetSession(token string) (*UserSession, bool) {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	session, ok := sm.sessions[token]
	if !ok {
		return nil, false
	}
	session.LastActiveTime = time.Now()
	return session, true
}

func (sm *SessionManager) RemoveSession(token string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()
	delete(sm.sessions, token)
}

func (sm *SessionManager) CleanupExpiredSessions(timeout time.Duration) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	now := time.Now()
	for token, session := range sm.sessions {
		if now.Sub(session.LastActiveTime) > timeout {
			delete(sm.sessions, token)
		}
	}
}

func main() {
	sessionManager := NewSessionManager()
	sessionManager.AddSession("token1", "user1", "192.168.1.1")
	sessionManager.AddSession("token2", "user2", "192.168.1.2")

	if session, ok := sessionManager.GetSession("token1"); ok {
		fmt.Printf("session: %v, last active time: %v\n", session.UserID, session.LoginTime.Format(time.DateTime))
	}
	// 清理过期会话
	sessionManager.CleanupExpiredSessions(time.Hour)
	// 禁用用户
	sessionManager.RemoveSession("token2")

	// 套嵌map
	usepreferences := map[string]map[string]string{
		"user1": {
			"theme": "dark",
			"font":  "Arial",
		},
		"user2": {
			"theme": "light",
			"font":  "Times New Roman",
		},
	}
	fmt.Println(usepreferences)

	// 作为集合使用
	uniqueIDs := make(map[int]bool)
	ids := []int{1, 2, 2, 3, 4, 5}
	// 利用key 值唯一去重
	for _, id := range ids {
		uniqueIDs[id] = true
	}
	fmt.Printf("唯一key数量: %d\n", len(uniqueIDs))

	// 键值翻转
	reversedIDs := map[string]int{
		"id1": 1,
		"id2": 2,
		"id3": 3,
	}
	reversedIDsMap := make(map[int]string)
	for id, name := range reversedIDs {
		reversedIDsMap[name] = id
	}
	fmt.Println("键值翻转:")
	fmt.Println("reversedIDsMap:", reversedIDsMap)

	// 键值排序
	// Map 是无序的键值对

	ageMap := map[string]int{
		"Bob":     30,
		"Alice":   25,
		"Charlie": 28,
	}

	keys := make([]string, 0)
	for key := range ageMap {
		keys = append(keys, key)
	}
	fmt.Println("原始ageMap", ageMap)
	sort.Strings(keys)
	fmt.Println("排序后的键:", keys)
	for _, key := range keys {
		fmt.Printf("Name: %s, Age: %d\n", key, ageMap[key])
	}

	// sync.Map
	// 并发安全的map 写多的时候才使用，万级数据场景适用
	// 低数量级场景使用 AddSession 添加读写锁的方式 效率更高
	var syncMap sync.Map
	syncMap.Store("key1", "value1")
	syncMap.Store("key2", "value2")
	fmt.Println("syncMap:", syncMap)

	syncMap.Range(func(key any, value interface{}) bool {
		fmt.Println("key:", key, "value:", value)
		return true
	})

}
