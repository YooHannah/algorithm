package main

import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	fmt.Println(now)
	fmt.Println(now.Format("2006-01-02 15:04:05"))

	// 获取3分钟后的时间
	threeMinutesFromNow := now.Add(3 * time.Minute)
	fmt.Println("3分钟后的时间:")
	fmt.Println(threeMinutesFromNow)
	fmt.Println(threeMinutesFromNow.Format("2006-01-02 15:04:05"))

	// 获取5天后时间
	fiveDaysFromNow := now.AddDate(0, 0, 5)
	fmt.Println("5天后的时间:")
	fmt.Println(fiveDaysFromNow)
	fmt.Println(fiveDaysFromNow.Format("2006-01-02 15:04:05"))

	// 获取5天前时间
	fiveDaysAgo := now.AddDate(0, 0, -5)
	fmt.Println("5天前的时间:")
	fmt.Println(fiveDaysAgo)
	fmt.Println(fiveDaysAgo.Format("2006-01-02 15:04:05"))

	// 计算两个时间之间的差值 天级
	diff := fiveDaysFromNow.Sub(fiveDaysAgo).Hours() / 24
	fmt.Println("5天前到5天后的天数:")
	fmt.Println(diff)

	// 哪个时间更大
	fmt.Println("now是否大于threeMinutesFromNow:")
	fmt.Println(now.After(threeMinutesFromNow))
	fmt.Println("now是否小于threeMinutesFromNow:")
	fmt.Println(now.Before(threeMinutesFromNow))

	// 指定时区
	fmt.Println("now的时间区:")
	fmt.Println(now.In(time.Local))
	fmt.Println(now.In(time.UTC))

	fmt.Println(now.Format(time.DateTime)) // 实际格式化规则固定

	loc, _ := time.LoadLocation("America/New_York")
	nyTime := time.Now().In(loc)
	fmt.Println("修改后时间区:")
	fmt.Println(nyTime.Format(time.DateTime))

	// 解析时间字符串
	dtime := "2025-10-18 14:23:12"
	ddtime, _ := time.Parse(time.DateTime, dtime)
	fmt.Println("解析后的时间:")
	fmt.Println(ddtime.Format(time.DateTime))

	// 时间周期
	start := time.Date(2025, 1, 1, 0, 0, 0, 0, time.Local)
	end := time.Date(2026, 1, 1, 0, 0, 0, 0, time.Local)
	days := end.Sub(start).Hours() / 24
	fmt.Println("2025年1月1日到2026年1月1日的天数:")
	fmt.Println(days)

}
