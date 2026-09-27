package main

import "fmt"

func Map[T, U any](slice []T, f func(T) U) []U {
	mapped := make([]U, 0, len(slice))
	for _, item := range slice {
		mapped = append(mapped, f(item))
	}
	return mapped
}

func Filter[T any](slice []T, f func(T) bool) []T {
	filtered := make([]T, 0, len(slice))
	for _, item := range slice {
		if f(item) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func Reduce[T, U any](slice []T, f func(U, T) U, initial U) U {
	acc := initial
	for _, item := range slice {
		acc = f(acc, item)
	}
	return acc
}

func Contains[T comparable](slice []T, item T) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func Unique[T comparable](slice []T) []T {
	seen := make(map[T]bool)
	var result []T
	for _, v := range slice {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

func demoMyTools() {

	slice := []int{1, 2, 3, 4, 5}
	mapped := Map(slice, func(item int) int {
		return item * 2
	})
	fmt.Println("映射后的切片:", mapped)
	filtered := Filter(slice, func(item int) bool {
		return item > 2
	})
	fmt.Println("过滤后的切片:", filtered)

	reduced := Reduce(filtered, func(acc int, item int) int {
		return acc + item
	}, 0)
	fmt.Println("reduce:", reduced)

	fmt.Println("是否包含3:", Contains(filtered, 3))

	slice2 := []int{1, 2, 3, 3, 4, 4, 5}
	fmt.Println("去重后的切片:", Unique(slice2))

}
