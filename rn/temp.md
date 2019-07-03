1.
数据类型在内存中分布
常量池：boolean,number,string
栈：undefined
堆：object
函数定义区：function(其实在堆里面)
 === 比较变量地址；==会通过V8进行隐式转换

2.
 把Object 看作普通类，Object 是Function的实例 
 Object.__proto__ === Function.prototype
 把Object 看作构造函数，functionxxx 是 Object的派生
 functionxxx.__proto__ === Function.prototype
 Function.prototype.__proto__ === Object.prototype
 Object.__proto__.__proto__ === Object.prototype

3. 
CommonJs AMD CMD NodeModules

4.LESS/SASS存在价值，有什么作用
编程式CSS,可维护性，可扩展性，静态样式一定程度上可以实现动态化

5.
前端基础：HTML/CSS/ECMAScript jQuery/bootStrap
新前端：React/VUE/Angular CommonJS/AMD/CMD/NodeModule
工具：npm/bowser 预编译（LESS\SASS\Babel）构建工具(webpack\gulp\grunt)
应用端服务器：Node Web应用\http协议\RPC\发布部署\微服务
跨平台开发：PC（window,mac）前端（web+h5）移动端(andorid,ios)（flutter\react-native）\小程序