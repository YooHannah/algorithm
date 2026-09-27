package main

import (
	"1-16/config"
	"1-16/other"
	"1-16/product"
	"flag"
	"fmt"
	"log"
	"net/http"
)

func main() {
	var configFile string
	var port int
	// flag 读取启动命令行参数，name 为参数key, value 为不指定时的默认值
	flag.StringVar(&configFile, "config", "config.json", "path to config file")
	flag.IntVar(&port, "port", 8080, "port to listen")
	flag.Parse()
	// 加载配置文件
	config, err := config.LoadConfig(configFile)
	if err != nil {
		panic(err)
	}
	// 定义接口
	productHandler := product.NewProductHandler(product.NewProductService())
	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			fmt.Println("GetProducts")
			productHandler.GetProducts(w, r)
		case http.MethodPost:
			fmt.Println("AddProduct")
			productHandler.AddProduct(w, r)
		}
	})
	http.HandleFunc("/products/", productHandler.GetProduct)

	// DemoTemplate "text/template"
	other.DemoTemplate()
	// DemoCompression "compress/gzip"
	other.DemoCompression()
	// DemoBuffIO "bufio"
	other.DemoBuffIO()
	// 启动服务
	addr := fmt.Sprintf(":%d", config.Port)
	log.Println("启动服务，端口：", config.Port)
	log.Fatal(http.ListenAndServe(addr, nil))

}
