package main

import (
	"3-6/query"
	"context"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	ctx := context.Background()
	qs := query.Use(db).User
	//tqs := query.Use(db).UserProfile
	//db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	//	err := tx.Model(&model.UserProfile{}).Where(tqs.UserID.Eq(1))
	//})

	tx := qs.WithContext(ctx)

	// user := &model.User{
	// 	Name:  "张三2",
	// 	Email: "zhangsan@qq.com",
	// 	Age:   18,
	// }
	// err = tx.Create(user)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Println("创建用户ID:", user.ID)

	// user2 := &model.User{
	// 	Name:  "张三aaa",
	// 	Email: "zhangsan@qq.com",
	// 	Age:   20,
	// }
	// err = tx.Create(user2)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Println("创建用户ID:", user2.ID)

	// 没有任何逻辑，并列的两个查询条件为& 的关系
	// get, err := tx.Where(field.Or(qs.ID.Eq(1), qs.Name.Like("张三")), qs.Email.Like("zhangsan@qq.com")).First()
	// name 包含 aaa 的用户（% 是 SQL 通配符，代表任意个任意字符）

	// | Go 写法 | 生成的 SQL | 含义 |
	// |---------|-----------|------|
	// | `qs.Name.Like("张三")` | `name LIKE '张三'` | 精确等于张三（无通配符） |
	// | `qs.Name.Like("%aaa%")` | `name LIKE '%aaa%'` | **包含** aaa |
	// | `qs.Name.Like("张三%")` | `name LIKE '张三%'` | **以**张三**开头** |
	// | `qs.Name.Like("%aaa")` | `name LIKE '%aaa'` | **以**aaa**结尾** |
	// | `qs.Name.Like("张_")` | `name LIKE '张_'` | `张` 后跟**恰好 1 个**字符（`_` 匹配单个字符） |

	get, err := tx.Where(qs.Name.Like("%aaa%")).First()
	if err != nil {
		panic(err)
	}

	fmt.Println(get)

}
