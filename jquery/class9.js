/*
闭包会造成内存泄露吗？
内存泄露：在C/C++动态分配的内存被长期持有，由于某种原因无法得到释放，造成内存浪费；不一定会报错，但内存溢出一定会报错
闭包：绑定了执行环境的函数，与普通函数的区别是它携带了执行环境
执行环境：作用域；this值；标识符列表(函数内用到，但为声明的变量)
js语言设计缺陷
var obj = {
	fn:function(){
	//this === obj
		return function(){
		  console.log(this)
		}
	}
}
obj.fn()() //this=== window

var obj = {
	fn:function(){
	//this === obj
		return ()=>{
		  console.log(this)
		}
	}
}
obj.fn()() //this=== obj

闭包不会造成内存泄露
内存泄露往往是所写的程序造成
闭包 ！== 内存泄露
造成‘闭包导致内存泄露’的原因是
‘IE浏览器‘垃圾回收机制采用引用计数
导致闭包函数中引用的父域内的变量无法被回收造成

原型链

*/
object.prototype.a = 1
Function.prototype.b = 2
function Person(){}
var aa = new Person()
console.log(max.a,max.b,Person.b,Person.a) //1 undefined 2 1
console.log(Person.__proto__ === Function.prototype) //true
console.log(Function.prototype .__proto__ === object.prototype)
console.log(object.__proto__ === Function.prototype)

//Function 是object的子类，object是其父类
//function 是object构造函数，object是其实例