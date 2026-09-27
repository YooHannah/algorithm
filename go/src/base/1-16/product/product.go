package product

import (
	"fmt"
	"log"
	"sync"
	"time"
)

type Product struct {
	Id        int       `json:"id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProductService struct {
	products map[int]*Product
	nextId   int
	mutex    sync.RWMutex
}

// 实际生产中相当于数据库相关操作
func NewProductService() *ProductService {
	return &ProductService{
		products: make(map[int]*Product),
		nextId:   1,
	}
}

func (p *ProductService) AddProduct(name string, price float64, stock int) *Product {
	p.mutex.Lock()
	defer p.mutex.Unlock()
	product := &Product{
		Id:        p.nextId,
		Name:      name,
		Price:     price,
		Stock:     stock,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	p.products[product.Id] = product
	p.nextId++
	return product
}

func (p *ProductService) GetProductById(id int) (*Product, error) {
	p.mutex.RLock()
	defer p.mutex.RUnlock()
	product, ok := p.products[id]
	if !ok {
		log.Printf("Product with ID %d not found", id)
		return nil, fmt.Errorf("Product with ID %d not found", id)
	}
	return product, nil
}

func (p *ProductService) GetProducts() ([]*Product, error) {
	p.mutex.RLock()
	defer p.mutex.RUnlock()
	var products = make([]*Product, 0, len(p.products))
	for _, product := range p.products {
		products = append(products, product)
	}
	return products, nil
}
