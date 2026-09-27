package main

import (
	"fmt"
	"time"
)

type Payment interface {
	Pay(amount float64) (string, error)
	Refund(transactionID string, amount float64) (string, error)
}

type Querier interface {
	Query(transactionID string) (string, error)
}

// Payment + Querier 所有接口
type PaymentService interface {
	Payment
	Querier
}

type Alipay struct {
	AppID      string
	AppSecret  string
	MerchantID string
}

func (a Alipay) Pay(amount float64) (string, error) {
	return fmt.Sprintf("ALIPAY-%d", time.Now().Unix()), nil
}

func (a Alipay) Refund(transactionID string, amount float64) (string, error) {
	return fmt.Sprintf("ALIPAY-REFUND-%s", transactionID), nil
}
func (a Alipay) Query(transactionID string) (string, error) {
	return "交易成功", nil
}

type WechatPay struct {
	AppID      string
	AppSecret  string
	MerchantID string
}

func (a WechatPay) Pay(amount float64) (string, error) {
	return fmt.Sprintf("WECHAT-%d", time.Now().Unix()), nil
}

func (a WechatPay) Refund(transactionID string, amount float64) (string, error) {
	return fmt.Sprintf("WECHAT-REFUND-%s", transactionID), nil
}

func (a WechatPay) Query(transactionID string) (string, error) {
	return "Wechat 成功", nil
}

// 整合基类PaymentService，统一处理支付请求
// 支付成功后，返回交易ID
func ProcessPayment(paymentService PaymentService, amount float64) (string, error) {
	fmt.Println("开始处理支付请求")
	transactionID, err := paymentService.Pay(amount)
	if err != nil {
		return "", err
	}
	fmt.Println("支付成功:", transactionID)
	return transactionID, nil
}

func main() {
	alipay := Alipay{
		AppID:      "123456",
		AppSecret:  "789012",
		MerchantID: "1234567890",
	}
	wechatPay := WechatPay{
		AppID:      "123456",
		AppSecret:  "789012",
		MerchantID: "1234567890",
	}

	_, err := ProcessPayment(alipay, 100)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("支付宝 支付成功")
	}

	_, err = ProcessPayment(wechatPay, 100)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("微信 支付成功")
	}

	transactions := []struct {
		Payment PaymentService
		Amount  float64
		Name    string
	}{
		{alipay, 150, "支付宝"},
		{wechatPay, 200, "微信"},
	}

	for _, transaction := range transactions {
		transactionID, err := ProcessPayment(transaction.Payment, transaction.Amount)
		if err != nil {
			fmt.Println(err)
		} else {
			fmt.Println("ProcessPayment: ", transaction.Name, "支付成功", transactionID)
		}
	}

	// 测试空接口
	var anything interface{}
	processEmptyInterface(anything)
	anything = 123
	processEmptyInterface(anything)
	anything = "hello world"
	processEmptyInterface(anything)

}

// 类型判断
func processEmptyInterface(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Println("int:", v)
	case string:
		fmt.Println("string:", v)
		ss := i.(string)
		fmt.Println("string:", ss)
	default:
		fmt.Println("unknown")
	}
}
