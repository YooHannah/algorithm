package main

import (
	"fmt"
	"sort"
	"time"
)

type Product struct {
	ID        int
	Name      string
	Price     float64
	Rating    float64
	Sales     int
	CreatedAt time.Time
}

type ProductManager struct {
	products []Product
}

func NewProductManager() *ProductManager {
	return &ProductManager{
		products: []Product{
			{
				ID:        1,
				Name:      "Product 1",
				Price:     100.0,
				Rating:    4.5,
				Sales:     120,
				CreatedAt: time.Now().Add(-24 * time.Hour),
			},
			{
				ID:        2,
				Name:      "Product 2",
				Price:     600.0,
				Rating:    4.0,
				Sales:     800,
				CreatedAt: time.Now().Add(-48 * time.Hour),
			},
			{
				ID:        3,
				Name:      "Product 3",
				Price:     100.0,
				Rating:    4.1,
				Sales:     300,
				CreatedAt: time.Now().Add(-72 * time.Hour),
			},
			{
				ID:        4,
				Name:      "Product 4",
				Price:     200.0,
				Rating:    4.6,
				Sales:     400,
				CreatedAt: time.Now().Add(-12 * time.Hour),
			},
		},
	}
}

func (pm *ProductManager) SortProductsBySales(ascending bool) []Product {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Sales > pm.products[j].Sales
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Sales < pm.products[j].Sales
		})
	}
	return pm.products
}

func (pm *ProductManager) SortProductsByRating(ascending bool) []Product {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Rating > pm.products[j].Rating
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Rating < pm.products[j].Rating
		})
	}
	return pm.products
}

func (pm *ProductManager) SortProductsByPrice(ascending bool) []Product {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Price > pm.products[j].Price
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].Price < pm.products[j].Price
		})
	}
	return pm.products
}

func (pm *ProductManager) SortProductsByCreatedAt(ascending bool) []Product {
	if ascending {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].CreatedAt.Before(pm.products[j].CreatedAt)
		})
	} else {
		sort.Slice(pm.products, func(i, j int) bool {
			return pm.products[i].CreatedAt.After(pm.products[j].CreatedAt)
		})
	}
	return pm.products
}

func (pm *ProductManager) SortProductsByMultiplier(keys []string) []Product {
	// 如果keys为空，按照默认字段排序
	if keys == nil {
		keys = []string{"sales", "rating", "price", "created_at"}
	}

	// 按照多个字段排序
	// 先按照sales排序，再按照rating排序，再按照price排序，再按照created_at排序
	sort.Slice(pm.products, func(i, j int) bool {
		// 多字段排序：按 keys 优先级依次比较，
		// 当前字段不相等才返回结果；相等则继续比下一个字段
		for _, key := range keys {
			switch key {
			case "sales":
				if pm.products[i].Sales != pm.products[j].Sales {
					return pm.products[i].Sales > pm.products[j].Sales
				}
			case "rating":
				if pm.products[i].Rating != pm.products[j].Rating {
					return pm.products[i].Rating > pm.products[j].Rating
				}
			case "price":
				if pm.products[i].Price != pm.products[j].Price {
					return pm.products[i].Price > pm.products[j].Price
				}
			case "created_at":
				if !pm.products[i].CreatedAt.Equal(pm.products[j].CreatedAt) {
					return pm.products[i].CreatedAt.Before(pm.products[j].CreatedAt)
				}
			}
		}
		return false
	})
	return pm.products
}

func (pm *ProductManager) SortProducts(sortBy string, ascending bool) []Product {
	switch sortBy {
	case "sales":
		return pm.SortProductsBySales(ascending)
	case "rating":
		return pm.SortProductsByRating(ascending)
	case "price":
		return pm.SortProductsByPrice(ascending)
	case "created_at":
		return pm.SortProductsByCreatedAt(ascending)
	}
	return pm.products
}

/*
 * type Interface interface {
 * 	len() int
 * 	less(i, j int) bool
 * 	swap(i, j int)
 * }
 */

type Person struct {
	Name string
	Age  int
}

type People []Person

func (p People) Len() int {
	return len(p)
}

func (p People) Less(i, j int) bool {
	return p[i].Age < p[j].Age
}
func (p People) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}

func main() {
	pm := NewProductManager()
	fmt.Println("All products:")
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println("Sorted by sales:")
	pm.SortProducts("sales", true)
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println("Sorted by rating:")
	pm.SortProducts("rating", true)
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println("Sorted by price:")
	pm.SortProducts("price", true)
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println("Sorted by created at:")
	pm.SortProducts("created_at", true)
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println("Sorted by price, and sales:")
	pm.SortProductsByMultiplier([]string{"price", "sales"})
	for _, product := range pm.products {
		fmt.Printf("Product %d: %s, Price: %.2f, Rating: %.2f, Sales: %d, Created At: %s\n", product.ID, product.Name, product.Price, product.Rating, product.Sales, product.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	people := People{
		{"Alice", 25},
		{"Bob", 30},
		{"Charlie", 22},
	}
	sort.Sort(people)
	for _, person := range people {
		fmt.Printf("Name: %s, Age: %d\n", person.Name, person.Age)
	}

	pos := sort.Search(len(people), func(i int) bool {
		return people[i].Name == "Bob"
	})
	fmt.Println("Position of Bob:", pos)

	// 搜索字符串切片
	fmt.Println("Searching strings:")
	names := []string{"Alice", "Bob", "Charlie"}
	sort.Strings(names)
	index := sort.SearchStrings(names, "Bob")
	fmt.Println("Index of Bob:", index)
}
