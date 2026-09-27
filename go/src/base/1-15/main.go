package main

import (
	"1-15/book"
	"1-15/common"
	"1-15/reader"
	"fmt"

	"code.byted.org/lang/gg/optional"
)

func main() {
	library := book.NewLibrary()
	library.AddBook("《三体》", "刘慈欣", "科幻", 100, 10)
	library.AddBook("《哈利波特》", "J.K.罗素", "魔幻", 50, 20)
	library.AddBook("《速度与激情》", "弗兰克·德米特里", "动作", 100, 10)
	library.AddBook("《傲慢、偏见》", "简·斯密斯", "小说", 100, 10)
	library.AddBook("《哈利·波特与魔法石》", "J.K.罗素", "魔幻", 50, 20)
	library.ListAllBooks()

	ID, err := library.GetBookIDByTitle("《哈利波特》")
	if err != nil {
		common.LogOperation("获取图书ID失败:" + err.Error())
		return
	}
	common.LogOperation("获取图书ID成功" + fmt.Sprintf("ID: %d", ID))

	book, _, err := library.FindBookById(ID)
	if err != nil {
		common.LogOperation("查找图书失败:" + err.Error())
		return
	}
	common.LogOperation("查找图书成功" + book.Title + fmt.Sprintf("stock: %d", book.Stock))

	book, err = library.LendBook(ID)
	if err != nil {
		common.LogOperation("借阅图书失败:" + err.Error())
		return
	}
	common.LogOperation("借阅图书成功" + book.Title + fmt.Sprintf("stock: %d", book.Stock))

	book, err = library.ReturnBook(ID)
	if err != nil {
		common.LogOperation("归还图书失败:" + err.Error())
		return
	}
	common.LogOperation("归还图书成功" + book.Title + fmt.Sprintf("stock: %d", book.Stock))

	readerService := reader.NewReaderService()

	addr1 := reader.Address{City: optional.OK("北京"), Province: optional.OK("北京"), Street: optional.OK("北京"), ZipCode: optional.OK("100000"), Email: optional.OK("zhangsan@example.com")}
	addr2 := reader.Address{City: optional.OK("上海"), Province: optional.OK("上海"), Street: optional.OK("上海"), ZipCode: optional.OK("200000"), Email: optional.OK("lisi@example.com")}
	addr3 := reader.Address{City: optional.OK("北京"), Province: optional.OK("北京"), Street: optional.OK("北京"), ZipCode: optional.OK("100000"), Email: optional.OK("zhangsan@example.com")}

	readerService.AddReader("张三", "123456", addr1)
	readerService.AddReader("李四", "654321", addr2)
	readerService.AddReader("王五", "123456", addr3)
	readerService.ListAllReaders()

	currentReader, _, err := readerService.FindReaderByName("张三")
	if err != nil {
		common.LogOperation("查找读者失败:" + err.Error())
		return
	}
	common.LogOperation("查找读者成功" + currentReader.Name)

	newAddr := reader.Address{City: optional.OK("北京"), Province: optional.OK("北京"), Street: optional.OK("北京"), ZipCode: optional.OK("100000"), Email: optional.OK("zhangsan1111@example.com")}

	currentReader.Address.ChangeAddress(newAddr)

	currentReader.ShowReaderInfo()

	readerService.DropReaderById(currentReader.Id)
	readerService.ListAllReaders()

	fmt.Println("main fire TestMessage:", reader.TestMessage)

}
