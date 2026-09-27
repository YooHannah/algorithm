package main

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

type Result struct {
	Value int
	Error error
}

// 带错误处理的生产者-消费者
func safeProducer(ch chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 1; i <= 5; i++ {
		// 模拟偶尔出错
		if i == 3 {
			ch <- Result{Error: errors.New("模拟错误")}
		} else {
			ch <- Result{Value: i}
		}
		time.Sleep(100 * time.Millisecond)
	}
	close(ch)
}

func safeConsumer(ch <-chan Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for result := range ch {
		if result.Error != nil {
			fmt.Printf("处理出错: %v\n", result.Error)
		} else {
			fmt.Printf("处理成功: %d\n", result.Value)
		}
	}
}

func main() {
	fmt.Println("=== 带错误处理的并发 ===")

	resultCh := make(chan Result, 5)
	var safeWg sync.WaitGroup

	safeWg.Add(2)
	go safeProducer(resultCh, &safeWg)
	go safeConsumer(resultCh, &safeWg)

	safeWg.Wait()
}
