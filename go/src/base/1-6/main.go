package main

import (
	"fmt"
)

type User struct {
	ID      int
	Name    string
	Balance float64
}

func updateBalancePointer(user *User, amount float64) {
	user.Balance += amount
	fmt.Println("updateBalancePointer更新后的余额:", user.Balance)
}

func updateBalanceValue(user User, amount float64) {
	user.Balance += amount
	fmt.Println("updateBalanceValue更新后的余额:", user.Balance)
}

func main() {
	user := User{ID: 1, Name: "lili", Balance: 1000}

	updateBalanceValue(user, 200)
	fmt.Println("updateBalanceValue更新后:", user)

	updateBalancePointer(&user, 100)
	fmt.Println("updateBalancePointer更新后:", user)

	users := []*User{
		&User{ID: 1, Name: "lili", Balance: 1000},
		&User{ID: 2, Name: "lili2", Balance: 2000},
		&User{ID: 3, Name: "lili3", Balance: 3000},
	}
	for _, user := range users {
		user.Balance += 100
	}
	for _, user := range users {
		fmt.Println("updateBalancePointer更新后的余额:", user.Balance)
	}

	// & 取地址运算符 用于获取变量的内存地址
	// * 指针运算符，取值，将当前地址里面存放的值取出来

	x := 10
	p := &x
	fmt.Println("x:", x)
	fmt.Println("p:", p)
	fmt.Println("*p:", *p)

	// 二级指针

	pp := &p
	fmt.Println("p:", p)
	fmt.Println("pp:", pp)
	fmt.Println("*pp:", *pp)
	fmt.Println("**pp:", **pp)

}
