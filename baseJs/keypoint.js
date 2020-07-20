//1.
function foo(){
  foo.a=function(){console.log(1)};
  this.a=function(){console.log(2)};
  a=function(){console.log(3)};
  var a = function(){console.log(4)}
}
foo.prototype.a=function(){
  console.log(5)
}
foo.a=function(){
  console.log(6)
}
foo.a()//6 访问静态属性
var b=new foo();
b.a();//2  实例属性存在不再访问原型属性
foo.a();//1 静态属性 因为new 重新被覆盖

//2.
var a = 5;
function test(){
  a=0;
  console.log(a);
  console.log(this.a);
  var a;
  console.log(a)
}
test() //0 5 0
new test()//0 undefined 0

//3.
var foo = 1;
function bar(){
  foo=10;
  return
  function foo(){}
}
console.log(foo);//1
bar();
console.log(foo);//1
//function foo 在bar里面定义，所以foo这个名，其实变成了bar的作用域里面的变量，也就是bar的局部变量，foo=10,改的也是局部的，第二个console所以打印的还是bar函数外面的

//4.
function Foo(){
  getName = function(){console.log(1)};
  return this;
}
Foo.getName=function (){console.log(2)};
Foo.prototype.getName = function(){console.log(3)};
var getName= function(){console.log(4)};
function getName(){console.log(5)};
Foo.getName();//2
getName();//4 最先解析的同名函数被同名变量覆盖
Foo().getName(); //this 为window 1
getName();//原来挂载的函数被覆盖 1
new Foo.getName();//2 运算优先级.和()大于new,所以先执行Foo.getName()，再执行new
new Foo().getName()//3  先执行new Foo(),返回Foo{},Foo.getName 为构造函数静态属性，只能构造函数访问,所以追溯至原型
new new Foo().getName();//3 执行顺序为，先初始化Foo的实例化对象，然后将其原型上的getName函数作为构造函数再次new
console.log('baidu' && 'google'); //google
console.log('baidu' || 'google'); //百度

