package main

import (
	"fmt"
	"reflect"
	"strconv"
)

// 通用配置管理
type Config struct {
	AppName string `config:"app_name" default:"my_app"`
	Port    int    `config:"port" default:"8080"`
	Debug   bool   `config:"debug" default:"true"`
}

// 更新端口号
func (c *Config) UpdatePort(newPort int) (int, int) {
	old := c.Port
	c.Port = newPort
	return old, c.Port
}

// 获取应用信息
func (c *Config) GetAppInfo() string {
	return fmt.Sprintf("AppName: %s, Port: %d, Debug: %t", c.AppName, c.Port, c.Debug)
}

type ConfigManager struct {
	config interface{} // 用于存储任意类型的配置
}

// 调用方法 ConfigManager.config 中的方法
func (cm *ConfigManager) CallMethod(methodName string, args ...interface{}) []interface{} {
	v := reflect.ValueOf(cm.config)
	if v.Kind() != reflect.Ptr {
		v = v.Addr()
	}
	// 获取 ConfigManager.config 中的方法，以reflect.Value 类型返回
	method := v.MethodByName(methodName)
	if !method.IsValid() {
		return []interface{}{fmt.Errorf("方法 %s 不存在", methodName)}
	}
	// 方法存在，将入参转换为 reflect.Value 类型的数组，方便下面传参
	in := make([]reflect.Value, len(args))
	for i, arg := range args {
		in[i] = reflect.ValueOf(arg)
	}

	// 调用方法,call 的入参需要是 reflect.Value 类型的数组
	out := method.Call(in)
	// 调用方法后，返回一个 reflect.Value 类型的数组，每个元素对应一个返回值
	// 这里将每个 reflect.Value 转换为 interface{} 类型，方便后续使用, 避免类型不兼容
	result := make([]interface{}, len(out))
	for i, out := range out {
		result[i] = out.Interface()
	}
	return result
}

/**
 * 获取当前ConfigManager.config 的字段类型
 * 然后将传入的数据存到 ConfigManager.config 中
 */
func (cm *ConfigManager) LoadFromMap(data map[string]string) error {
	// 获取当前ConfigManager.config 在实际使用是的值类型
	// 这里是type Config
	v := reflect.ValueOf(cm.config).Elem() // 相当于拿到 Config 实例
	t := v.Type()                          // 相当于拿到 type Config 类型 定义

	for i := 0; i < t.NumField(); i++ {
		field := v.Field(i)     // 拿到一个字段的值 eg. AppName
		fieldType := t.Field(i) // 拿到一个字段的类型定义 eg. AppName string `config:"app_name" default:"my_app"`

		configKey := fieldType.Tag.Get("config")     // 拿到一个字段的 config 标签 eg. app_name
		defaultValue := fieldType.Tag.Get("default") // 拿到一个字段的 default值 eg. my_app
		value := data[configKey]                     // data.app_name eg. TestMyApp
		if value == "" {
			value = defaultValue
		}

		switch field.Kind() { // 看AppName 是什么类型 当前是string
		case reflect.String:
			field.SetString(value) // 设置ConfigManager.config.AppName 为 TestMyApp
		case reflect.Int:
			intValue, err := strconv.Atoi(value)
			if err != nil {
				return err
			}
			field.SetInt(int64(intValue))
		case reflect.Bool:
			boolValue, err := strconv.ParseBool(value)
			if err != nil {
				return err
			}
			field.SetBool(boolValue)
		}

	}
	return nil
}

type Person struct {
	Name string
	Age  int
}

// 创建一个任意类型的实例
// 入参 t 是 reflect.Type 类型，用于创建实例的类型, 使用reflect.TypeOf(xx) 可以将任意类型转换为 reflect.Type 类型
// 返回值是 interface{} 类型，用于存储任意类型的实例
// 这里使用 reflect.New(t) 创建一个实例，返回一个 reflect.Value 类型的实例
// 然后使用 Interface() 方法将 reflect.Value 转换为 interface{} 类型

func createInstance(t reflect.Type) interface{} {
	return reflect.New(t).Interface()
}

func main() {
	config := &Config{}
	// ConfigManager.config 是一个接口，用于存储任意类型的配置
	// 这里使用时传入 *Config 类型
	configManager := &ConfigManager{config: config}
	configData := map[string]string{
		"app_name": "TestMyApp",
		"port":     "8088",
		"debug":    "false",
	}
	err := configManager.LoadFromMap(configData)
	if err != nil {
		panic(err)
	}
	fmt.Printf("app_name:%s, port: %d\n", config.AppName, config.Port)

	fmt.Println("-----------------------------------")

	// 调用方法 type Config 中的 UpdatePort(newPort int) (int, int) 方法
	// configManager 并不知道 config 字段上的值是否有这个方法
	results := configManager.CallMethod("UpdatePort", 9090)
	for _, result := range results {
		fmt.Println(result)
	}

	results = configManager.CallMethod("GetAppInfo")
	for _, result := range results {
		fmt.Println("UpdatePort after:", result)
	}

	fmt.Println("-----------------------------------")
	personType := reflect.TypeOf(Person{})
	inst := createInstance(personType)
	// inst.(*Person)：由于 inst 是 interface{} 类型，我们不能直接访问它的字段。
	// 需要使用类型断言来判断它的底层类型是否是 *Person。
	// ok：如果断言成功，ok 为 true，person 变量就变成了具体的 *Person 指针。
	// 相当于在赋值前判断ins 对象是不是 *Person 类型的
	if person, ok := inst.(*Person); ok {
		person.Name = "Tom"
		person.Age = 18
		fmt.Println("Person:", person)
	}
}
