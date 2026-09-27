package main

import (
	"errors"
	"fmt"
	"os"
	"time"
)

// 错误练习
func main() {
	userName, err := queryDatabase(-1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("用户名:", userName)
	}
	// 相对路径
	content, err := readFile("src/base/1-7/test.txt")
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("文件内容:", content)
	}

	value, err := safeAccess([]int{1, 2, 3}, 1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("数组元素:", value)
	}

	fmt.Println("deferReturn:", deferReturn())
}

type BusinessError struct {
	Code      int
	Message   string
	Timestamp time.Time
}

const (
	TimeFmt = "2006-01-02 15:04:05"
)

func (e *BusinessError) Error() string {
	return fmt.Sprintf("错误代码:%d, 错误信息:%s, 时间:%s", e.Code, e.Message, e.Timestamp.Format(TimeFmt))
}

func queryDatabase(UserId int) (string, error) {
	if UserId < 1 {
		return "", &BusinessError{
			Code:      1001,
			Message:   "用户ID不能小于1",
			Timestamp: time.Now(),
		}
	}
	if UserId == 999 {
		return "", errors.New("用户不存在")
	}
	return "gogo", nil
}

func readFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("打开文件失败: %w", err)
	}
	defer file.Close()
	buf := make([]byte, 1024)
	n, err := file.Read(buf)
	if err != nil {
		return "", fmt.Errorf("读取文件失败: %w", err)
	}
	return string(buf[:n]), nil
}

func safeAccess(arr []int, index int) (int, error) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("panic:", r)
		}
	}()
	return arr[index], nil
}

func deferReturn() (result int) {
	defer func() {
		result++
	}()
	return 10
}
