package book

import (
	"1-15/common"
	"fmt"
	"log"
)

type Library struct {
	books  []*Book
	logger *log.Logger
}

func (b *Library) AddBook(title string, author string, desc string, price float64, Stock int) (*Book, error) {
	book, err := CreateBook(title, author, desc, price, Stock)
	if err != nil {
		b.logger.Printf("添加图书失败:%s", err.Error())
		return nil, err
	}
	b.logger.Printf("添加图书成功: %s ID: %d", book.Title, book.ID)
	b.books = append(b.books, book)
	return book, nil
}

func (b *Library) GetBookIDByTitle(title string) (int, error) {
	for _, book := range b.books {
		if book.Title == title {
			return book.ID, nil
		}
	}
	return -1, fmt.Errorf("没有找到书名为%s的图书", title)
}
func (b *Library) FindBookById(id int) (*Book, int, error) {
	for i, book := range b.books {
		if book.ID == id {
			return book, i, nil
		}
	}
	return nil, -1, fmt.Errorf("没有找到id为%d的图书", id)
}
func (b *Library) ReturnBook(id int) (*Book, error) {
	book, _, err := b.FindBookById(id)
	if err != nil {
		b.logger.Printf("归还图书失败:%s", err.Error())
		return nil, err
	}
	b.logger.Printf("归还图书成功 《%s》Stock: %d", book.Title, book.Stock)
	book.changeStock(book.Stock + 1)
	return book, nil
}
func (b *Library) LendBook(id int) (*Book, error) {
	book, _, err := b.FindBookById(id)
	if err != nil {
		b.logger.Printf("借阅图书失败:%s", err.Error())
		return nil, err
	}
	b.logger.Printf("借阅图书成功《%s》Stock: %d", book.Title, book.Stock)
	book.changeStock(book.Stock - 1)
	return book, nil
}

func (b *Library) ListAllBooks() {
	for _, book := range b.books {
		book.ShowBookInfo()
	}
}

func NewLibrary() *Library {
	return &Library{
		books:  make([]*Book, 0),
		logger: common.NewLogger("library"),
	}
}
