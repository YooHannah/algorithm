package main

import (
	"fmt"
)

type InterfaceA interface {
	a1(m string) string
}

type A struct {
	aa InterfaceA
}

type B struct {
	bb string
}

func (b B) a1(m string) string {
	fmt.Println("B a1:", m, b.bb)
	return b.bb
}

type C struct {
	cc []string
}

func (c C) a1(m string) string {
	for i, v := range c.cc {
		fmt.Println("C a1:", i, ":", v, m)
	}
	return c.cc[0]
}

type Test1 struct {
	id string
}

func (t Test1) GetId(m string) string {
	fmt.Println("test1 getId:", m, t.id)
	return t.id
}

type Test2 struct {
	name string
	Test1
}

func (t Test2) GetName(m string) string {
	fmt.Println("test2 getName:", m, t.name)
	return t.name
}

type Test3 struct {
	count int
	Test2
}

func (t Test3) GetCount(m string) int {
	fmt.Println("test3 getCount:", m, t.count)
	return t.count
}

func main() {
	b := B{bb: "hello world"}
	c := C{cc: []string{"hello", "world"}}
	// b, c 类型结构不同，但都可以赋值给aa
	tempb := A{
		aa: b,
	}
	tempc := A{
		aa: c,
	}

	tempb.aa.a1("hello world bbb")
	tempc.aa.a1("hello world ccc")

	test1 := Test1{id: "test1"}

	test2 := Test2{
		name:  "test2",
		Test1: test1,
	}

	test3 := Test3{
		count: 3,
		Test2: test2,
	}

	test3.GetId("test1 fucntion")
}
