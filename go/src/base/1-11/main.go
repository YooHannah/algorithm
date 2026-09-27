package main

import "fmt"

type Address struct {
	Province string
	City     string
	Street   string
	ZipCode  string
}

type User struct {
	ID       int
	UserName string
	Password string
	Email    string
	Age      int
	Address  Address // 套嵌结构体
}

type UserProfile struct {
	ID       int
	UserName string
	Address  // 匿名套嵌, 直接使用结构体名称，访问时直接访问当前结构体内部字段
}

func main() {
	addr := Address{
		Province: "北京",
		City:     "北京",
		Street:   "北京",
		ZipCode:  "100000",
	}
	user := User{
		ID:       1,
		UserName: "admin1",
		Password: "password",
		Email:    "1111@qq.com",
		Age:      18,
		Address:  addr,
	}

	user2 := User{
		ID:       2,
		UserName: "admin2",
		Password: "password",
		Email:    "2222@qq.com",
		Age:      18,
		Address: Address{
			Province: "北京",
			City:     "北京",
			Street:   "北京",
			ZipCode:  "100000",
		},
	}

	fmt.Println("用户名:", user.UserName, "城市:", user.Address.Province, "街道:", user.Address.Street)
	fmt.Println("用户名:", user2.UserName, "城市:", user2.Address.Province, "街道:", user2.Address.Street)

	userProfile := UserProfile{
		ID:       1,
		UserName: "admin11",
		Address: Address{
			Province: "北京",
			City:     "北京",
			Street:   "北京",
			ZipCode:  "100000",
		},
	}

	fmt.Println("用户名:", userProfile.UserName, "城市:", userProfile.Province, "街道:", userProfile.Street)

	userPointer := &User{
		ID:       1111,
		UserName: "指针用户",
		Password: "123456",
		Email:    "1111@qq.com",
		Address: Address{
			Province: "北京4",
			City:     "北京",
			Street:   "北京4",
		},
	}
	fmt.Println("用户名:", userPointer.UserName, "城市:", userPointer.Address.Province, "街道:", userPointer.Address.Street)

	newUser := new(User)
	newUser.UserName = "newUser"
	fmt.Printf("用户名: %s, 城市: %s, 街道: %s\n", newUser.UserName, newUser.Address.Province, newUser.Address.Street)
}
