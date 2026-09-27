package common

// 通用日志工具

import (
	"fmt"
	"log"
	"os"
	"time"
)

// NewLogger 创建一个新的日志记录器，外部导入后可用
func NewLogger(prefix string) *log.Logger {
	return log.New(os.Stdout, prefix+" ", log.Ldate|log.Ltime)
}

// LogOperation 记录操作日志，外部导入后可用
func LogOperation(operation string) {
	fmt.Printf("[%s]操作： %s\n", time.Now().Format(time.DateTime), operation)
	log.Println(formatLogMessage("INFO", operation))
}

// formatLogMessage因为是小写字母开头，只能在当前包的内部使用，如上LogOperation，外部导入后不可用
func formatLogMessage(level, message string) string {
	return fmt.Sprintf("[%s] %s: %s", time.Now().Format(time.DateTime), level, message)
}
func GetRandomID() int {
	// 生成随机ID
	return int(time.Now().UnixNano())
}
