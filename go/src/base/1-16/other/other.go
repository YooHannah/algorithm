package other

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"strings"
	"text/template"
)

func DemoTemplate() {
	const TemplateText = `
	产品信息
	产品ID：{{.Id}}
	产品名称：{{.Name}}
	产品价格：{{.Price}}
	产品描述：{{.Description}}
	`
	type Product struct {
		Id          int
		Name        string
		Price       float64
		Description string
	}
	tmpl, err := template.New("product").Parse(TemplateText)
	if err != nil {
		panic(err)
	}
	product := Product{
		Id:          1,
		Name:        "Product 1",
		Price:       100.0,
		Description: "这是一个产品",
	}
	err = tmpl.Execute(os.Stdout, product)
	if err != nil {
		panic(err)
	}
}

func DemoCompression() {
	originData := "这是一段需要压缩的文本数据，" +
		"重复内容" + strings.Repeat("重复", 10) +
		"结束。"

	var compressed bytes.Buffer

	gzWriter := gzip.NewWriter(&compressed)
	_, err := gzWriter.Write([]byte(originData))
	if err != nil {
		panic(err)
	}
	gzWriter.Close()
	fmt.Printf("原始数据大小: %d byes\n", len(originData))
	fmt.Printf("压缩后的数据大小: %d byes\n", compressed.Len())
	fmt.Printf("压缩率: %.1f%%\n",
		float64(compressed.Len())/float64(len(originData))*100)

	gzReader, err := gzip.NewReader(&compressed)
	if err != nil {
		panic(err)
	}
	defer gzReader.Close()
	decompressed, err := io.ReadAll(gzReader)
	if err != nil {
		panic(err)
	}
	fmt.Printf("解压缩后的数据: %s\n", string(decompressed))
}

func DemoBuffIO() {
	file, err := os.Create("text_buffer.txt")
	if err != nil {
		panic(err)
	}
	writer := bufio.NewWriter(file)

	for i := 0; i < 10; i++ {
		writer.WriteString(fmt.Sprintf("第%d行数据\n", i))
	}

	writer.Flush()
	fmt.Println("数据写入完成")

	file.Close()

	file2, err := os.Open("text_buffer.txt")
	if err != nil {
		panic(err)
	}
	defer file2.Close()

	reader := bufio.NewReader(file2)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			panic(err)
		}
		fmt.Println(line)
	}

}
