package main

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"
)

func fetchData(url string, wg *sync.WaitGroup) string {
	time.Sleep(time.Millisecond * 100)

	fmt.Println("Fetching data from", url, "delay", 100, "ms")

	if wg != nil {
		defer wg.Done()
	}

	return url
}

func limitedWorkerPool(task []string, max int) {
	start := time.Now()

	// 1. 预先分配好结果切片，长度与任务数一致。
	// 这样每个协程可以直接按索引写入，无需锁，且保证了顺序。
	results := make([]string, len(task))

	semaphore := make(chan struct{}, max)
	var wg sync.WaitGroup
	for i, task := range task {
		wg.Add(1)
		fmt.Println("go before", task, "index", i)
		go func(task string, i int) { // go 决定当前匿名函数并行执行
			semaphore <- struct{}{} // 当semaphore 满了，即已经有max 个任务在执行，代码停在这里，直达有空位
			defer func() {
				<-semaphore
				wg.Done()
			}()
			fmt.Println("go inner", i, "start")
			fetchData(task, nil)
			// 执行实际的抓取任务
			res := fetchData(task, nil)

			// 【核心步骤】：将结果按索引存入预先分配好的切片中。
			// 不同协程操作不同的索引，因此这里不需要加锁，也是并发安全的。
			results[i] = res
		}(task, i)
	}
	wg.Wait() // 等待所有任务完成才执行后面的代码
	fmt.Println("All tasks completed 3", time.Since(start))
	// 2. 打印结果
	for i, res := range results {
		fmt.Println("Result", i, ":", res)
	}
}

// 显示当前Goroutine数量和CPU核心数，设置最大并行度为4
func showGoRoutine() {
	fmt.Printf("当前Goroutine数量: %d\n", runtime.NumGoroutine())
	fmt.Printf("CPU核心数: %d\n", runtime.NumCPU())

	// 设置最大并行度
	runtime.GOMAXPROCS(4)
}

func worker(context context.Context, id int) {
	for {
		select {
		case <-context.Done():
			fmt.Println("Worker", id, "DONE")
			return
		case <-time.After(time.Second * 1):
			fmt.Println("Worker", id, "working")
		}
	}
}
func main() {

	start := time.Now()

	urlSlice := []string{
		"https://www.google.com",
		"https://www.baidu.com",
		"https://www.bing.com",
		"https://www.yahoo.com",
		"https://www.yandex.com",
	}

	// 串行执行
	for _, url := range urlSlice {
		fetchData(url, nil)
	}

	fmt.Println("All tasks completed 1", time.Since(start))

	// 并行执行
	start1 := time.Now()
	var wg sync.WaitGroup
	for _, v := range urlSlice {
		wg.Add(1)
		go fetchData(v, &wg)
	}
	wg.Wait()
	fmt.Println("All tasks completed 2", time.Since(start1))

	// 限制并行度执行，只允许同时进行max 个任务
	limitedWorkerPool(urlSlice, 3)

	showGoRoutine()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	go worker(ctx, 1)
	go worker(ctx, 2)

	time.Sleep(time.Second * 10)

}
