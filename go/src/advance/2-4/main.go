package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

type Order struct {
	ID       int
	UserID   int
	Amount   float64
	Status   string
	CreateAt time.Time
}

// 1. 生产者消费者模型： 解耦生产消费速度，通过channel缓冲协调
func orderProduct(orderChan chan<- Order, number int) {
	defer close(orderChan)
	for i := 1; i <= number; i++ {
		order := Order{
			ID:       i,
			UserID:   rand.Intn(1000) + 1,
			Amount:   rand.Float64() * 1000,
			Status:   "pending",
			CreateAt: time.Now(),
		}
		fmt.Printf("生成订单: ID=%d, 金额=¥%.2f\n", order.ID, order.Amount)
		orderChan <- order
		time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond) // 模拟生产间隔
	}
}

func orderConsumer(orderChan <-chan Order, wg *sync.WaitGroup) {
	defer wg.Done()
	for order := range orderChan {
		// 模拟订单处理
		time.Sleep(200 * time.Millisecond)
		order.Status = "processed"
		fmt.Printf("处理订单: ID=%d, 状态=%s\n", order.ID, order.Status)
	}
}

// 2.扇出: 一个channel 供多个消费者处理， 一产多消，提高处理吞吐量
func funOutProcessor(inputChan <-chan Order, orderType int, wg *sync.WaitGroup) {
	defer wg.Done()
	for order := range inputChan {
		switch orderType {
		case 1: // 计算折扣
			order.Amount *= 0.8
			fmt.Printf("计算折扣: ID=%d, 状态=%s, 金额：%.2f\n", order.ID, order.Status, order.Amount)
		case 2: // 发送通知
			fmt.Printf("发送通知: ID=%d, 状态=%s\n", order.ID, order.Status)
		case 3: // 记录日志
			fmt.Printf("记录日志: ID=%d, 状态=%s\n", order.ID, order.Status)
		}
		time.Sleep(time.Millisecond * 100)
	}
}

// 3. 扇入模式：多个数据源合并，多产一消，聚合多源数据，注意channel管理
func fanInProducer(producerID int, output chan<- Order) {
	defer fmt.Printf("生产者%d结束\n", producerID)
	for i := 1; i <= 3; i++ {
		order := Order{
			ID:     producerID*100 + i,
			UserID: producerID,
			Amount: float64(producerID*100 + i),
			Status: "new",
		}
		fmt.Printf("生产者%d生成订单: %d\n", producerID, order.ID)
		output <- order
		time.Sleep(time.Duration(producerID) * 100 * time.Millisecond)
	}
}

// 4. Pipeline模式：订单处理流水线，任务分解为阶段，每个阶段专注单一职责，提高处理效率
// 阶段间同步顺序进行（A-B-C），每个阶段之间通过channel传递数据，实现并行处理，数据进入不同阶段的channel, 进行不同阶段的操作
// channel 位于内存，如果在磁盘中实现pipeline 就是消息队列
func validationStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第一阶段：订单验证
			time.Sleep(50 * time.Millisecond)
			if order.Amount > 0 {
				order.Status = "validated"
				fmt.Printf("验证通过: 订单%d\n", order.ID)
				output <- order
			} else {
				fmt.Printf("验证失败: 订单%d金额异常\n", order.ID)
			}
		}
	}()
	return output
}

func paymentStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第二阶段：支付处理
			time.Sleep(100 * time.Millisecond)
			order.Status = "paid"
			fmt.Printf("支付成功: 订单%d\n", order.ID)
			output <- order
		}
	}()
	return output
}

func shippingStage(input <-chan Order) <-chan Order {
	output := make(chan Order, 10)
	go func() {
		defer close(output)
		for order := range input {
			// 第三阶段：发货处理
			time.Sleep(150 * time.Millisecond)
			order.Status = "shipped"
			fmt.Printf("发货完成: 订单%d\n", order.ID)
			output <- order
		}
	}()
	return output
}

func main() {
	//rand.Seed(time.Now().UnixNano())
	//
	//fmt.Println("=== 1. 生产者-消费者模式演示 ===")
	//// 创建订单channel
	//orderCh := make(chan Order, 5)
	//var wg sync.WaitGroup
	//
	//// 启动消费者
	//wg.Add(2)
	//go orderConsumer(orderCh, &wg)
	//go orderConsumer(orderCh, &wg)
	//
	//// 启动生产者
	//go orderProduct(orderCh, 6)
	//
	//wg.Wait()

	//fmt.Println("\n=== 2. 扇出模式演示 ===")
	//// 扇出：一个输入，多个处理器
	//fanOutCh := make(chan Order, 10)
	//var fanOutWg sync.WaitGroup
	//
	//// 启动3个处理器
	//fanOutWg.Add(3)
	//for i := 1; i <= 3; i++ {
	//	go funOutProcessor(fanOutCh, i, &fanOutWg)
	//}
	//
	//// 生产一些测试数据
	//go func() {
	//	for i := 1; i <= 6; i++ {
	//		fanOutCh <- Order{
	//			ID:     i,
	//			Amount: float64(i * 100),
	//			Status: "pending",
	//		}
	//	}
	//	close(fanOutCh)
	//}()
	//
	//fanOutWg.Wait()

	// fmt.Println("\n=== 3. 扇入模式演示 ===")
	// // 扇入：多个生产者，一个输出
	// fanInCh := make(chan Order, 10)

	// // 启动3个生产者
	// for i := 1; i <= 3; i++ {
	// 	go fanInProducer(i, fanInCh)
	// }

	// // 收集结果
	// go func() {
	// 	time.Sleep(2 * time.Second)
	// 	close(fanInCh)
	// }()

	// fmt.Println("收集到的订单:")
	// for order := range fanInCh {
	// 	fmt.Printf("  订单ID: %d, 金额: ¥%.2f\n", order.ID, order.Amount)
	// }

	// fmt.Println("\n=== 4. Pipeline模式演示 ===")
	// 创建初始输入
	// pipelineInput := make(chan Order, 10)

	// // 构建流水线
	// validatedOrders := validationStage(pipelineInput)
	// paidOrders := paymentStage(validatedOrders)
	// shippedOrders := shippingStage(paidOrders)

	// // 发送测试订单到流水线
	// go func() {
	// 	for i := 1; i <= 3; i++ {
	// 		pipelineInput <- Order{
	// 			ID:     i,
	// 			UserID: i * 10,
	// 			Amount: float64(i * 50),
	// 			Status: "new",
	// 		}
	// 	}
	// 	close(pipelineInput)
	// }()
	// 根据数据进入不同 channel， 进行不同阶段的操作
	// 数据进入 pipelineInput， validationStage 收到数据开始处理，返回validatedOrders
	// paymentStage 收到validatedOrders，开始处理，返回paidOrders
	// paidOrders 进入 shippingStage 处理发货处理， 返回shippedOrders
	// 收集最终结果
	// fmt.Println("流水线处理结果:")
	// for order := range shippedOrders {
	// 	fmt.Printf("  完成: 订单%d, 状态: %s\n", order.ID, order.Status)
	// }

}
