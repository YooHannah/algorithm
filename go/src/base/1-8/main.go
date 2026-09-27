package main

import (
	"fmt"
)

type CartItem struct {
	Name     string
	Price    float64
	Quantity int
}

func main() {
	cart := []CartItem{}
	fmt.Println("购物车容量:", len(cart), cap(cart))
	cart = append(cart, CartItem{"apple", 1.0, 2})
	cart = append(cart, CartItem{"orange", 2.0, 1})
	cart = append(cart, CartItem{"banana", 3.0, 3})
	cart = append(cart, CartItem{"peach", 4.0, 5})

	totalPrice := 0.0
	totalQuantity := 0
	for _, item := range cart {
		fmt.Println("商品名称:", item.Name, "单价:", item.Price, "数量:", item.Quantity)
		totalPrice += item.Price * float64(item.Quantity)
		totalQuantity += item.Quantity
	}
	fmt.Println("移除商品前:", len(cart), cap(cart))
	fmt.Println("总价:", totalPrice)
	fmt.Println("总数量:", totalQuantity)

	fmt.Println("商品移除: orange")
	if totalQuantity > 5 {
		// orange 在下标 1：保留下标1之前的(apple)，拼接下标2之后的(banana)
		cart = append(cart[:1], cart[2:]...)
		fmt.Println("移除商品后:", cart)
	}
	totalPriceAfterRemove := 0.0
	totalQuantityAfterRemove := 0
	for _, item := range cart {
		fmt.Println("商品名称:", item.Name, "单价:", item.Price, "数量:", item.Quantity)
		totalPriceAfterRemove += item.Price * float64(item.Quantity)
		totalQuantityAfterRemove += item.Quantity
	}
	fmt.Println("移除商品后:", len(cart), cap(cart))
	fmt.Println("移除商品后总价:", totalPriceAfterRemove)
	fmt.Println("移除商品后总数量:", totalQuantityAfterRemove)

	full := cart[:4]
	fmt.Println("满仓商品:", full)
	// 满仓商品: [{apple 1 2} {banana 3 3} {banana 3 3} { 0 0}]

	fmt.Println("_________________________________指针切片")
	cart2 := []*CartItem{}
	cart2 = append(cart2, &CartItem{"apple", 1.0, 2})
	cart2 = append(cart2, &CartItem{"orange", 2.0, 1})
	cart2 = append(cart2, &CartItem{"banana", 3.0, 3})
	cart2 = append(cart2, &CartItem{"peach", 4.0, 5})
	fmt.Println("购物车2:", cart2)

	totalPrice2 := 0.0
	totalQuantity2 := 0
	for _, item := range cart2 {
		totalPrice2 += item.Price * float64(item.Quantity)
		totalQuantity2 += item.Quantity
	}
	fmt.Println("购物车2容量:", len(cart2), cap(cart2))
	fmt.Println("购物车2总价:", totalPrice2)
	fmt.Println("购物车2总数量:", totalQuantity2)

	fmt.Println("购物车2商品移除: orange")
	if totalQuantity2 > 5 {
		// 这样会左移留位
		// 删前 购物车2: [0x52ecebb2e180 0x52ecebb2e1a0 0x52ecebb2e1c0 0x52ecebb2e200]
		// 删后 购物车2满仓商品: [0x52ecebb2e180 0x52ecebb2e1c0 0x52ecebb2e200 0x52ecebb2e200]
		// cart2 = append(cart2[:1], cart2[2:]...)
		// fmt.Println("移除商品后:", cart2)

		// 删前 购物车2: [0x52ecebb2e180 0x52ecebb2e1a0 0x52ecebb2e1c0 0x52ecebb2e200]
		// 删后 购物车2满仓商品: [0x169da672a180 0x169da672a1c0 0x169da672a200 <nil>]
		// orange 在下标1：把下标2开始的元素整体左移，覆盖到下标1
		copy(cart2[1:], cart2[2:])
		cart2[len(cart2)-1] = nil // 断掉尾部残留引用，让 GC 可回收
		cart2 = cart2[:len(cart2)-1]
		fmt.Println("移除商品后:", cart2)
	}

	totalPriceAfterRemove2 := 0.0
	totalQuantityAfterRemove2 := 0
	for _, item := range cart2 {
		totalPriceAfterRemove2 += item.Price * float64(item.Quantity)
		totalQuantityAfterRemove2 += item.Quantity
	}
	fmt.Println("购物车2移除商品后:", len(cart2), cap(cart2))
	fmt.Println("购物车2移除商品后总价:", totalPriceAfterRemove2)
	fmt.Println("购物车2移除商品后总数量:", totalQuantityAfterRemove2)

	full2 := cart2[:4]
	fmt.Println("购物车2满仓商品:", full2)
}
