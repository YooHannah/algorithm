package main

import (
	"cmp"
	"fmt"
)

// [T 类型范围]
// T any  不指定任何类型，可以是任意类型
func Println[T any](v []T) {
	for _, item := range v {
		fmt.Println(item)
	}
}

// T comparable  可比较的类型，可以是任意可比较的类型，能进行 == 或者!= 操作
// 例如 int, float64, string, bool 等
func FoundIndex[T comparable](v []T, item T) int {
	for i, v := range v {
		if v == item {
			return i
		}
	}
	return -1
}

//	T cmp.Ordered，这里的类型范围是cmp.Ordered，可以排序的, 可以进行> < 操作
//
// 例如 int, float64, string 等
func Max[T cmp.Ordered](v []T) (T, int) {
	pos := 0
	maxVal := v[pos]
	for i, v := range v {
		if maxVal < v {
			maxVal = v
			pos = i
		}
	}
	return maxVal, pos
}

// 将T 指定为自定义类型
type Stringer interface {
	CustomPrintln(str string) string
}

func ForStringer[T Stringer](v []T) {
	for _, item := range v {
		item.CustomPrintln("其他信息")
	}
}

type Person struct {
	Name string
	Age  int
}

func (p Person) CustomPrintln(s string) string {
	fmt.Printf("名字%s, 年龄: %d 其他: %s\n", p.Name, p.Age, s)
	return p.Name
}

// 自定义类型，指定某几类数据
type MyNumber interface {
	~int | ~float64
}

func Sum[T MyNumber](v []T) T {
	var sum T
	for _, v := range v {
		sum += v
	}
	return sum
}

// 定义一个通用的Map结构体，用于存储键值对
// K 可比较的类型， V 任意类型
type Pair[K comparable, V any] struct {
	Key   K
	Value V
}

func main() {
	Println([]int{1, 2, 3})
	Println([]float64{1.3, 2.6, 3.8})
	Println([]string{"a", "b", "c"})

	pos := FoundIndex([]int{1, 2, 3}, 2)
	fmt.Println("2的索引为:", pos)

	maxVal, pos := Max([]int{1, 2, 3})
	fmt.Println("最大值为:", maxVal, "最大值的索引为:", pos)

	persons := []Person{
		Person{"张三", 18},
		Person{"李四", 18},
		Person{"王五", 20},
	}
	ForStringer(persons)

	fmt.Println("int 类型的和为:", Sum([]int{1, 2, 3}))
	fmt.Println("float64 类型的和为:", Sum([]float64{1.0, 2.0, 3.0}))

	pair1 := Pair[string, int]{"hello", 1}
	pair2 := Pair[int, string]{2, "world"}

	fmt.Println(pair1, pair2)

	fmt.Println("-----------------------------------")
	demoMyTools() // 这里虽然会报undefined，但`go run main.go tool.go `可以正常运行
}
