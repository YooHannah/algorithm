package main

import (
	"fmt"
	"time"
)

func main() {
	// const (
	// 	statusSuccess = iota + 1
	// 	statusError
	// 	statusTimeout
	// )
	// fmt.Println(statusSuccess)
	// fmt.Println(statusError)
	// fmt.Println(statusTimeout)

	// fmt.Println("_________________________________")

	// var str string = "hello world 1"
	// var str2 = "hello world 2"
	// str3 := "hello world 3"
	// str, str2 = str2, str // 变量值交换
	// fmt.Println(str, str2, str3)
	// fmt.Println("_________________________________")
	// // testZeroValue
	// var a int
	// var b bool
	// var c float64
	// var d string
	// fmt.Println(a, b, c, '-', d, '-')

	// fmt.Println("_________________________________")
	// // typeConversion
	// var aa int = 1
	// var bb float64 = 1.1
	// fmt.Println(aa, bb)
	// // 需要转成相同类型才能计算
	// fmt.Println(aa + int(bb))     // 2
	// fmt.Println(bb + float64(aa)) // 2.1

	// fmt.Println("_________________________________")
	// // 自定义类型
	// var m Meter = 1.1
	// fmt.Println(m)
	// fmt.Println(m.String())

	// fmt.Println("_________________________________")
	// 结构体

	// person := Person{"bytedance", 18}
	// fmt.Println(person)
	// fmt.Println(person.Name)
	// fmt.Println(person.Age)

	// fmt.Println("_________________________________")

	// // 数组 长度固定
	// var arr1 [3]int
	// arr2 := [3]int{1, 2, 3}
	// fmt.Println(arr1, arr2)
	// fmt.Println("_________________________________")

	// 切片 长度可变
	// var slice1 []int
	// slice1 = append(slice1, 1, 2, 3)
	// fmt.Println(slice1)
	// s2 := []int{1, 2, 3}
	// fmt.Println(s2)
	// fmt.Println("_________________________________")

	// s3 := make([]int, 0, len(s2))
	// s4 := new([]int) // 指针类型
	// fmt.Println(s3, s4)
	// fmt.Println("_________________________________")

	// m1 := map[string]int{
	// 	"a": 1,
	// 	"b": 2,
	// }
	// fmt.Println(m1)

	// m2 := make(map[string]int) // 使用于动态key 值数据整理
	// m2["a"] = 11
	// m2["b"] = 22
	// fmt.Println(m2)

	// // 遍历map
	// for k, v := range m1 {
	// 	fmt.Println(k, v)
	// }

	fmt.Println("_________________________________运算符与表达式")
	price := 100
	discount := 0.8
	orderAmount := float64(price) * discount
	fmt.Println("原价:", price, "折扣:", discount, "折后价:", orderAmount)

	isAdmin := true
	hasWritePermission := false
	canEdit := isAdmin && hasWritePermission
	fmt.Println("可以编辑吗？", canEdit)

	age := 18
	canVote := age >= 18
	fmt.Println("可以投票吗？", canVote)

	const (
		ReadPermission    = 1 << iota // 位运算 0001
		WritePermission               // 位运算 0010
		ExecutePermission             // 位运算 0100
	)

	userPermission := ReadPermission | WritePermission // 位运算 0001 | 0010 = 0011
	if userPermission&WritePermission != 0 {           // 位运算 0011 & 0010 = 0010
		fmt.Println("有写权限")
	} else {
		fmt.Println("没有写权限")
	}

	a1 := 1

	a1++
	fmt.Println(a1)

	a1 += 50
	fmt.Println(a1)

	fmt.Println("_________________________________流程控制")

	score := 60
	if score >= 90 {
		fmt.Println("优秀")
	} else if score >= 80 {
		fmt.Println("良好")
	} else if score >= 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("不及格")
	}

	orders := []string{"order1", "order2", "order3", "order4"}
	for i, order := range orders {
		fmt.Println("处理的第", i, "个订单:", order)
	}

	i := 0
	for {
		fmt.Println("处理的第", i, "个订单:", orders[i])
		i++
		if i >= len(orders) {
			break
		} // 没有限制条件就是死循环，有限制条件就相当于while循环的条件
	}

	statusCode := 200
	switch statusCode {
	case 200:
		fmt.Println("OK")
	case 404:
		fmt.Println("NOT FOUND")
	case 500:
		fmt.Println("INTERNAL SERVER ERROR")
	default: // 可不写
		fmt.Println("UNKNOWN")
	}

	switch {
	case score >= 90:
		fmt.Println("优秀")
	case score >= 80:
		fmt.Println("良好")
	case score >= 60:
		fmt.Println("及格")
	default:
		fmt.Println("不及格")
	}

	ch := make(chan string, 1)

	go func() {
		time.Sleep(1 * time.Second)
		ch <- "task done"
	}()

	select {
	case result := <-ch:
		fmt.Println(result)
	case <-time.After(2 * time.Second):
		fmt.Println("timeout")
	}

	studentScore := map[string]int{
		"张三": 90,
		"李四": 80,
		"王五": 70,
	}
	for name, score := range studentScore {
		if score >= 60 {
			fmt.Println(name, "通过")
		} else {
			fmt.Println(name, "未通过")
		}
	}

	str := "hello world 你好 世界"

	for i := 0; i < len(str); i++ {
		// str[i] 拿到的是第i个字节的ASCII码值
		fmt.Println("字符串中第", i, "个字节是:", string(str[i]), "ASCII码是:", str[i], "ASCII码对应的字符是:", string(str[i]))
	}

	// 错误演示：按字节(byte)遍历，中文在UTF-8中占3个字节，会被拆碎成乱码
	fmt.Println("len(str) =", len(str), "（字节数，不是字符数）")

	// 正确方式一：range 遍历，自动按 rune（Unicode 码点）解码
	// i 是字节起始位置，r 是该字符的 Unicode 码点（int32）
	for i, r := range str {
		fmt.Println("字节位置", i, "字符:", string(r), "Unicode码点:", r)
	}

	// 正确方式二：先转成 []rune，再像数组一样按下标取每个字符
	runes := []rune(str)
	fmt.Println("字符总数:", len(runes))
	for i := 0; i < len(runes); i++ {
		fmt.Println("第", i, "个字符:", string(runes[i]), "Unicode码点:", runes[i])
	}

	// Unicode 码点转回中文：用 string() 包住 rune
	fmt.Println(string(rune(20320)), string(rune(22909))) // 你 好

}

type Meter float64

func (m Meter) String() string {
	return fmt.Sprintf("%.2f m", m)
}

type Person struct {
	Name string
	Age  int
}

func (p Person) String() string {
	return fmt.Sprintf("Name: %s, Age: %d", p.Name, p.Age)
}

func (p *Person) String2() string {
	return fmt.Sprintf("Name: %s, Age: %d", p.Name, p.Age)
}

/**
func (p Person) String()：p 是调用该方法时原对象的一个副本（Copy）。在 String() 内部修改 p.Name，不会影响原来的 Person 对象。
func (p *Person) String2()：p 是原对象在内存中的地址（指针）。在 String2() 内部修改 p.Name，会直接改变原来的 Person 对象。
*/
