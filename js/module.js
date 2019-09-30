/**
 * 模块化就是把系统分离成独立功能的方法，从而实现需要什么功能，就加载什么功能
 * 当一个项目开发得越来越复杂时，会出现问题：命名冲突；文件依赖
 * 使用模块化开发，可以避免以上问题，并且提高开发效率：可维护性；可复用性
 * 
 * 模块化开发演变
 * 1.使用全局函数      ===>早期开发就是将重复得代码封装到函数中，再将一系列的函数放到一个文件中
 *   存在的问题就是：污染全局变量；看不出相互的直接关系
 * 2.使用对象命名空间  ===>通过对象命名空间的形式，从某种程度上解决了变量命名冲突的问题，但是并不能从根本上解决命名冲突
 *   存在的问题是：内部状态可被外部改写；命名空间越来越来长
 * 3.私有共有成员分离  ===>利用此种方式将函数包装成一个独立的作用域，私有空间的变量和函数不会影响全局作用域
 *   存在问题：解决了变量命名冲突问题，但是没有解决降低开发复杂度的问题
 * 
 * Commonjs
 * commomJS规范加载模块是【同步】的，也就是说，加载完成才执行后面的操作
 * Node.js主要用于服务器编程呢个，模块都是存在本地硬盘中加载比较快，所以Node.js采用CommonJS
 * 三个部分：
 * module变量在每个模块内部，就代表当前模块
 * exports属性是对外的接口，用于导出当前模块的方法或变量
 * require()用来加载外部模块，读取并执行js文件，返回该模块的exports对象
 * 
 * AMD(requirejs)
 * AMD也就是【异步】模块定义，它采用异步方式加载模块，通过define方法去定义模块，require方法去加载模块
 * 定义：
 * define([tools],function(){return {}}) //第一个参数为数组时，说明该模块还依赖其他模块,提前声明依赖，没有依赖时，只传入function即可
 * 加载：
 * require(['module'],callback) //第一个参数数组内成员即要加载的模块，callback是前面所有某块都加载成功之后的回调函数
 */


/** a.js */

define(['b'], function(b) {
  console.log(b)
  var hello = function(){
    console.log('hello work')
  }
  return {
    Hello:Hello
  }
});

/** b.js */

define(function(){
  var name = 'max'
  return{
    name:name
  }
})

/** 使用a.js,b.js */

/*
 <script type='text/javascript' src='require.js'></script>
 <script type='text/javascript'>
  require.config({
    paths:{
      'a':'./a',
      'b':'./b'
    }
  })
  require(['a','b'],function(a,b){ //启用模块加载器
    console.log(a)
    console.log(b)
  })
 </script>
 */

 /* 
 * CMD(seajs)
 * 与AMD一样，只是定义和模块加载方式上不同
 * 一个模块一个文件
 * define(function(require,exports,module){
 *  //require 是可以把其他模块导入进来的一个参数
 *  //exports可以把模块内的一些属性和方法导出
 *  //module是一个对象，上面存储了与当前模块相关联的一些属性和方法
 * })
 * CMD推崇依赖就近，延迟执行，文件是提前加载好的，只有在require的时候才去执行文件
 * define(function(require,exports,module){
 *    var math = require('./math')
 *    math.add()
 * })
 * 
 */

/** a.js */

define(function(require,exports,module) {
  var b = require('b')
  console.log(b)
  exports.hello = function(){
    console.log('hello work')
  }
});

/*
 <script type='text/javascript' src='sea.js'></script>
 <script type='text/javascript'>
  seajs.config({
    alias:{
      'a':'./a',
      'b':'./b'
    }
  })
  seajs.use(['a','b'],function(a,b){ //启用模块加载器
    console.log(a)
    console.log(b)
  })
 </script>
 */

/**
 *  ES6模块化
 *  汲取CommonJS和AMD优点，支持异步加载，未来可以成为浏览器和服务器通用的模块化解决方案
 *  export:用于把模块里的内容暴露出来， export default 为模块指定默认输出，一个模块只能有一个默认输出，所以export default 只能使用一次
 *  import： 用于引入模块提供的功能===> import {x1,x2} form './lib'; x1()
 *  ES6模块运行机制：
 *  ES6模块是动态引用，如果使用import从一个模块加载变量，变量不会被缓存，
 *  而是成为一个指向被加载模块的引用。等脚本执行时，根据只读引用到被加载的那个模块中去取值
 */

/**
 * 加载器结构
 * 模块部分 ---每个模块创建都先初始化数据，存储在缓存对象中
 *   数据初始化：加载器中设计了一个名为Module的构造函数，【每个模块都是此构造函数的实例对象】
 *              构造函数中给实例对象扩展了'未来'所需要用到的属性（uri:当前模块绝对路径地址，deps:模块的依赖列表....)及方法(load,resolve:获取当前模块绝对路径...)
 *   模块存储：加载器中设计了一个名为cache的缓存对象，每个文件(模块)都会存储在cache对象中
 *            具体存储方式:{'当前模块绝对路径': new Module()} 注意：当前模块的绝对路径是通过资源部分，资源定位方法实现的
 * 资源部分 --- 资源定位和依赖管理是加载器涉及的两大核心
 *   资源定位：加载器中设计了一个resolve()方法把模块名解析成绝对路径格式
 *            检测当前模块名称是否有路径短名称配置，是否有模块短名称配置，是否有后缀
 *            在加载器启动方法中会去调用传入数组列表中的模块，获取模块名称
 *            然后根据当前项目绝对路径和模块名称进行拼接
 *   动态加载script文件：动态创建script标签： document.create('script')； src指向当前模块绝对路径地址
 *                      加载文件同时，模块加载器解析当前模块所依赖的模块，以数组形式存储，更新到deps属性中
 *   依赖管理：已知当前模块在cache中的形态，{'当前模块绝对路径': new Module()}
 *            换算成：{'当前模块绝对路径': {uri:'当前模块绝对路径',deps:[]}}
 *            deps存储当前模块的依赖列表，依赖列表通过动态加载script文件正则解析获取
 *            重点：解析依赖--->获取依赖模块绝对路径地址---->动态加载---->提取依赖---->解析依赖
 *                  递归方式加载所有模块，直至模块全部加载完毕（模块的deps属性集合中没有依赖的绝对路径，即长度为0）
 */