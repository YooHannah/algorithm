package main

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"
)

func validateEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	match, _ := regexp.MatchString(pattern, email)
	return match
}

func validatePhone(phoneNumber string) bool {
	pattern := `^1[2-9]\d{9}$`
	match, _ := regexp.MatchString(pattern, phoneNumber)
	return match
}

// input: john doe:25:john@example.com
func ProcessUserInfo(userInfo string) map[string]interface{} {
	result := make(map[string]interface{})
	cleaned := strings.TrimSpace(userInfo)
	cleaned = strings.ToLower(cleaned)
	// 解析用户信息
	parts := strings.Split(cleaned, ":")
	if len(parts) != 3 {
		result["error"] = "用户信息格式错误"
		return result
	}
	// 存储用户信息
	result["name"] = parts[0]
	age, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil {
		result["error"] = "年龄格式错误"
	} else {
		result["age"] = age
	}
	email := strings.TrimSpace(parts[2])
	if !validateEmail(email) {
		result["email"] = "Invalid email"
	} else {
		result["email"] = email
	}

	result["origin_length"] = len(userInfo)
	result["cleaned_length"] = len(cleaned)
	result["rune_count"] = utf8.RuneCountInString(userInfo)
	return result
}

func main() {

	users := []string{
		"john doe:25:john@example.com",
		"jane doe:30:jane@example.com",
		"jim doe:35:jim@example.com",
		"嗨嗨:30:jane@example.com",
	}
	for _, user := range users {
		result := ProcessUserInfo(user)
		for key, value := range result {
			fmt.Printf("%s: %v\n", key, value)
		}
		fmt.Println("-----------------")
	}

	phoneNumbers := []string{
		"13800138000",
		"13800138001",
		"13800138002",
		"13800138003",
	}
	for _, phoneNumber := range phoneNumbers {
		if validatePhone(phoneNumber) {
			fmt.Printf("Valid phone number: %s\n", phoneNumber)
		} else {
			fmt.Printf("Invalid phone number: %s\n", phoneNumber)
		}
	}

	// 字符串构造器
	var builder strings.Builder
	builder.WriteString("Hello, ")
	products := []string{"中国", "美国"}
	for _, v := range products {
		builder.WriteString(v)
		builder.WriteString("\n")
	}
	fmt.Println(builder.String())

	// 字符串替换和重复
	template := "重要通知: {message} | 重复显示: {repeat}"
	replaced := strings.Replace(template, "{message}", "系统维护通知", 1)
	repeated := strings.Repeat("注意!", 3)
	final := strings.Replace(replaced, "{repeat}", repeated, 1)
	fmt.Println(final)

	// 字符串前缀和后缀
	var (
		str  string
		str2 string
	)
	str = "This is a test string."
	str2 = "This is a test string."
	if str == str2 {
		fmt.Println("字符串相等")
	}

	url1 := "https://test.com/api/v1/users"
	url2 := "https://test.com/api/v1/products"

	if strings.HasPrefix(url1, "https://") && strings.HasSuffix(url1, "users") {
		fmt.Println("有效的URL")
	} else {
		fmt.Println("无效的URL")
	}

	if strings.HasPrefix(url2, "https://") && strings.HasSuffix(url2, ".com") {
		fmt.Println("有效的URL")
	}

}
