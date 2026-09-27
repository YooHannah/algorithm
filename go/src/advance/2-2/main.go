package main

import (
	"fmt"
	"strconv"
	"sync"
	"time"
)

type DeploySheet struct {
	ProjectName    string
	Environment    string
	ReleaseVersion string
	Status         string
}

func CreateDeploySheet(DeploySheetChan chan *DeploySheet, count int) {
	for i := 0; i < count; i++ {
		DeploySheetChan <- &DeploySheet{
			ProjectName:    "project" + strconv.Itoa(i),
			Environment:    "env" + strconv.Itoa(i),
			ReleaseVersion: "release" + strconv.Itoa(i),
			Status:         "pending",
		}
		fmt.Printf("CreateDeploySheet %d success\n", i)
		time.Sleep(time.Second * 1)
	}
	close(DeploySheetChan)
}

func AuditDeploySheet(deploySheetChan chan *DeploySheet, resultChan chan *DeploySheet, wg *sync.WaitGroup) {
	defer wg.Done()
	for deploySheet := range deploySheetChan {
		fmt.Printf("AuditDeploySheet %s %s %s %s\n", deploySheet.ProjectName, deploySheet.Environment, deploySheet.ReleaseVersion, deploySheet.Status)
		deploySheet.Status = "AuditFinished"
		time.Sleep(time.Second * 1)
		resultChan <- deploySheet
	}
}

func FinishDeploySheet(resultChan chan *DeploySheet, done chan bool) {
	count := 0
	for deploySheet := range resultChan {
		fmt.Printf("FinishDeploySheet %s %s %s %s\n", deploySheet.ProjectName, deploySheet.Environment, deploySheet.ReleaseVersion, deploySheet.Status)
		count++
		time.Sleep(time.Second * 1)
	}

	done <- true
}

func worker(jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Println("worker:", j)
		time.Sleep(time.Millisecond)
		results <- j * 2
	}
}
func main() {
	DeploySheetChan := make(chan *DeploySheet)
	ResultChan := make(chan *DeploySheet)
	done := make(chan bool)

	go CreateDeploySheet(DeploySheetChan, 10)
	// 借助 sync.WaitGroup 等待所有审核 worker 退出后，再关闭 ResultChan
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go AuditDeploySheet(DeploySheetChan, ResultChan, &wg)
	}
	go func() {
		wg.Wait()
		close(ResultChan)
	}()
	go FinishDeploySheet(ResultChan, done)

	<-done // 通道内数据只接收，不保留,等待所有处理完成

	fmt.Println("hello world", done)

	// 利用Select 实现多路复用
	// ch1 := make(chan string)
	// ch2 := make(chan string)
	// go func() {
	// 	time.Sleep(time.Second * 4)
	// 	ch1 <- "来自ch1"
	// }()
	// go func() {
	// 	time.Sleep(time.Second * 2)
	// 	ch1 <- "来自ch2"
	// }()

	// for i := 0; i < 2; i++ {
	// 	select {
	// 	case msg := <-ch1:
	// 		fmt.Println(msg)
	// 	case msg := <-ch2:
	// 		fmt.Println(msg)
	// 	case <-time.After(time.Second * 1):
	// 		fmt.Println("超时")
	// 		return
	// 	}
	// }

	// 定时器
	// ticker := time.NewTicker(500 * time.Millisecond)
	// done := make(chan bool)
	// go func() {
	// 	for {
	// 		select {
	// 		case <-done:
	// 			return
	// 		case t := <-ticker.C: // 每500毫秒打印一次
	// 			fmt.Println("当前时间：", t.Format("2006-01-02 15:04:05"))
	// 		}
	// 	}
	// }()

	// time.Sleep(2 * time.Second)
	// ticker.Stop()
	// done <- true
	// fmt.Println("停止计时器")

	// jobs := make(chan int, 10)
	// results := make(chan int, 10)

	// for i := 0; i < 3; i++ {
	// 	go worker(jobs, results)
	// }
	// for i := 0; i < 10; i++ {
	// 	jobs <- i
	// }
	// close(jobs)

	// for i := 0; i < 10; i++ {
	// 	value := <-results
	// 	fmt.Println("result:", value)
	// }

}
