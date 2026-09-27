package reader

import (
	"1-15/common"
	"fmt"
	"time"

	"code.byted.org/lang/gg/optional"
)

type Address struct {
	Province optional.O[string]
	City     optional.O[string]
	Street   optional.O[string]
	ZipCode  optional.O[string]
	Email    optional.O[string]
}

func (a *Address) ChangeAddress(newAddress Address) Address {
	// 新地址中显式提供了该字段(IsOK)才覆盖，否则保留原值
	if newAddress.Province.IsOK() {
		a.Province = newAddress.Province
	}
	if newAddress.City.IsOK() {
		a.City = newAddress.City
	}
	if newAddress.Street.IsOK() {
		a.Street = newAddress.Street
	}
	if newAddress.ZipCode.IsOK() {
		a.ZipCode = newAddress.ZipCode
	}
	if newAddress.Email.IsOK() {
		a.Email = newAddress.Email
	}
	common.LogOperation("changeAddress success")
	return *a
}

type Reader struct {
	Id        int
	Name      string
	Password  string
	Address   Address
	CreatedAt time.Time
}

func (r Reader) validatePassword() string {
	if r.Password == "" {
		return "密码不能为空"
	}
	if len(r.Password) < 6 {
		return "密码长度不能小于6位"
	}
	return ""
}

func (r Reader) ShowReaderInfo() Reader {
	fmt.Println("读者ID:", r.Id, "读者姓名:", r.Name, "读者邮箱:", r.Address.Email, "读者注册时间:", r.CreatedAt)
	return r
}
func CreateReader(Name string, Password string, Address Address) (*Reader, error) {
	common.LogOperation("CreateReader")
	r := &Reader{
		Id:        int(time.Now().Unix()),
		Name:      Name,
		Password:  Password,
		Address:   Address,
		CreatedAt: time.Now(),
	}
	common.LogOperation("CreateReader 成功" + fmt.Sprintf("ID: %d", r.Id))
	if errMsg := r.validatePassword(); errMsg != "" {
		return r, fmt.Errorf(errMsg)
	}
	return r, nil
}

var TestMessage string

func init() {
	TestMessage = "hello world"

	fmt.Println("reader init fire TestMessage:", TestMessage)
}
