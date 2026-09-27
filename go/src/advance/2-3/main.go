package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type Stock struct {
	Stock   int
	rwMutex sync.RWMutex
}

func (s *Stock) GetStock() int {
	s.rwMutex.RLock()
	defer func() {
		s.rwMutex.RUnlock()
	}()
	time.Sleep(time.Millisecond * 100)
	stock := s.Stock
	return stock
}

func (s *Stock) IncreaseStock(num int) int {
	s.rwMutex.Lock()
	s.Stock += num
	time.Sleep(time.Millisecond * 100)
	s.rwMutex.Unlock()
	fmt.Println("增加库存成功，当前库存为：", s.Stock)
	return s.Stock
}

func (s *Stock) DecreaseStock(num int) int {
	s.rwMutex.Lock()
	defer func() {
		s.rwMutex.Unlock()
	}()
	if s.Stock < num {
		fmt.Println("库存不足")
		return s.Stock
	}
	s.Stock -= num
	time.Sleep(time.Millisecond * 100)
	fmt.Println("减少库存成功，当前库存为：", s.Stock)
	return s.Stock
}

type Counter struct {
	Count int32
}

func (c *Counter) Inc() {
	time.Sleep(time.Millisecond * 100)
	atomic.AddInt32(&c.Count, 1)
	fmt.Println("增加计数成功，当前计数为：", c.Count)
}

func (c *Counter) Dec() {
	time.Sleep(time.Millisecond * 100)
	atomic.AddInt32(&c.Count, -1)
	fmt.Println("减少计数成功，当前计数为：", c.Count)
}
func (c *Counter) GetCount() int32 {
	return atomic.LoadInt32(&c.Count)
}

func main() {
	// stock := &Stock{
	// 	Stock: 100,
	// }
	// fmt.Println("当前库存为：", stock.GetStock())

	// start := time.Now()
	// var wg sync.WaitGroup
	// for i := 0; i < 100; i++ {
	// 	wg.Add(1)
	// 	go func(i int) {
	// 		defer wg.Done()
	// 		stock.DecreaseStock(1)
	// 	}(i)
	// }

	// for i := 0; i < 10; i++ {
	// 	wg.Add(1)
	// 	go func(i int) {
	// 		defer wg.Done()
	// 		currentStock := stock.GetStock()
	// 		fmt.Println("当前库存为：", currentStock)
	// 	}(i)
	// }
	// wg.Wait()
	// fmt.Println("耗时：", time.Since(start))

	start1 := time.Now()
	counter := &Counter{
		Count: 100,
	}
	var wg2 sync.WaitGroup
	// for i := 0; i < 100; i++ {
	// 	wg2.Add(1)
	// 	go func(i int) {
	// 		defer wg2.Done()
	// 		counter.Inc()
	// 	}(i)
	// }

	DecFunc := func() {
		defer wg2.Done()
		counter.Dec()
	}

	for i := 0; i < 100; i++ {
		wg2.Add(1)
		go DecFunc()
	}

	for i := 0; i < 10; i++ {
		wg2.Add(1)
		go func() {
			defer wg2.Done()
			count := counter.GetCount()
			fmt.Println("当前计数为：", count)
		}()
	}
	wg2.Wait()
	fmt.Println("耗时：", time.Since(start1))

}
