package book

import (
	"1-15/common"
	"fmt"
)

type Book struct {
	Author string
	Desc   string
	Title  string
	ID     int
	Price  float64
	Stock  int
}

func (b *Book) validateBook() string {
	if b.Title == "" {
		return "书名不能为空"
	}
	if b.Author == "" {
		return "作者不能为空"
	}
	if b.Desc == "" {
		return "描述不能为空"
	}
	if b.Price <= 0 {
		return "价格必须大于0"
	}
	if b.Stock <= 0 {
		return "库存必须大于0"
	}
	return ""
}

func (b *Book) changeStock(Stock int) (*Book, error) {
	b.Stock = Stock
	return b, nil
}

func (b *Book) ShowBookInfo() {
	fmt.Println("书名:", b.Title, "作者:", b.Author, "描述:", b.Desc, "价格:", b.Price, "库存:", b.Stock)
}

func CreateBook(title string, author string, desc string, Price float64, Stock int) (*Book, error) {
	book := &Book{
		Title:  title,
		Author: author,
		Desc:   desc,
		Price:  Price,
		Stock:  Stock,
		ID:     common.GetRandomID(),
	}
	err := book.validateBook()
	if err != "" {
		common.LogOperation("创建图书失败:" + err)
		return nil, fmt.Errorf(err)
	}
	common.LogOperation("创建图书成功" + book.Title + fmt.Sprintf("ID: %d", book.ID))
	return book, nil
}
