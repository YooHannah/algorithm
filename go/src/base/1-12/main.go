package main

import (
	"fmt"
	"reflect"
	"strconv"
)

type BankAccount struct {
	AccountNumber string
	AccountHolder string
	Balance       float64
	IsActive      bool
}

// 值接收者
func (acc BankAccount) GetAccountInfo() string {
	status := "活跃"
	if !acc.IsActive {
		status = "冻结"
	}
	return fmt.Sprintf("账号: %s, 账户名: %s, 余额: %.2f, 状态: %s", acc.AccountNumber, acc.AccountHolder, acc.Balance, status)
}

// 指针接收者
func (acc *BankAccount) Deposit(amount float64) error {
	if !acc.IsActive {
		return fmt.Errorf("账户已冻结，无法存款")
	}
	if amount <= 0 {
		return fmt.Errorf("存款金额必须大于0")
	}
	acc.Balance += amount
	return nil
}

func (acc *BankAccount) Withdraw(amount float64) error {
	if !acc.IsActive {
		return fmt.Errorf("账户已冻结，无法取款")
	}
	if amount <= 0 {
		return fmt.Errorf("取款金额必须大于0")
	}
	if amount > acc.Balance {
		return fmt.Errorf("取款金额大于账户余额")
	}
	acc.Balance -= amount
	return nil
}

func (acc *BankAccount) Freeze() {
	acc.IsActive = false
}

func (acc *BankAccount) Unfreeze() {
	acc.IsActive = true
}

type myInt int

func (I myInt) String() string {
	// 注意：不能直接 fmt.Println(I)，否则打印时又会调用 I.String()，造成无限递归
	// 先转回底层 int，再用 strconv 转成十进制字符串
	fmt.Println("myInt.String()", int(I))
	return strconv.Itoa(int(I))
}
func main() {
	account := BankAccount{
		AccountNumber: "1234567890",
		AccountHolder: "张三",
		Balance:       1000.0,
		IsActive:      true,
	}

	// 值接收者
	fmt.Println(account.GetAccountInfo())

	err := account.Deposit(500.0)
	if err != nil {
		fmt.Println("存款失败", err)
	}
	fmt.Println("存款成功, 账户余额: ", account.Balance)

	account.Freeze()
	fmt.Println("账户已冻结")
	err = account.Deposit(100.0)
	if err != nil {
		fmt.Println("存款失败", err)
	} else {
		fmt.Println("存款成功, 账户余额: ", account.Balance)
	}

	var temp myInt = 1
	tempStr := temp.String()
	fmt.Println("原始值:", int(temp), "转换后的字符串:", tempStr)
	// 打印值类型
	fmt.Println("值类型:", reflect.TypeOf(temp), reflect.TypeOf(tempStr))
}
