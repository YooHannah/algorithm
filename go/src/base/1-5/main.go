package main

import (
	"fmt"
	"sort"
)

func main() {
	_, err := ValidateUser("admin", "123456")
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("验证成功")
	}

	username, age, err := GetUserInfo(1)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("用户名:", username, "年龄:", age)
	}

	counter := createCounter()
	for i := 0; i < 5; i++ {
		fmt.Println("第", i, "次调用计数:", counter())
	}

	strs := []string{"hello", "world", "go"}
	sort.Slice(strs, func(i, j int) bool {
		return strs[i] < strs[j]
	})
	fmt.Println("排序后的strs:", strs)

	strs = processString(strs, func(str string) string {
		return str + "!"
	})
	fmt.Println("添加感叹号后的strs:", strs)

	fmt.Println(sum(1, 2))
	fmt.Println(sum(1, 2, 3))
}

func ValidateUser(username string, password string) (bool, error) {
	if len(username) < 3 {
		return false, fmt.Errorf("用户名长度不能小于3")
	}
	if len(password) < 6 {
		return false, fmt.Errorf("密码长度不能小于6")
	}
	return true, nil
}

// 返回多个值
func GetUserInfo(id int) (string, int, error) {
	if id < 1 {
		return "", 0, fmt.Errorf("用户ID不能小于1")
	}

	// 模拟数据库查询
	users := map[int]struct {
		username string
		age      int
	}{
		1: {
			username: "张三",
			age:      18,
		},
		2: {
			username: "李四",
			age:      19,
		},
		3: {
			username: "王五",
			age:      20,
		},
	}

	// user, ok := users[id]
	// if !ok {
	// 	return "", 0, fmt.Errorf("用户ID不存在")
	// }

	// return user.username, user.age,

	if user, ok := users[id]; ok {
		return user.username, user.age, nil
	} else {
		return "", 0, fmt.Errorf("用户ID不存在")
	}
}

// 闭包
func createCounter() func() int {
	i := 0
	return func() int {
		i++
		return i
	}
}

// func 作为变量使用

type StringProcessor func(string) string

func processString(strs []string, f StringProcessor) []string {
	var result []string
	for _, str := range strs {
		result = append(result, f(str))
	}
	return result
}

// 可变参数
func sum(nums ...int) int {
	total := 0
	for _, num := range nums {
		total += num
	}
	return total
}
