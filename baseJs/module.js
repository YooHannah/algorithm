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
 * Node.js主要用于服务器编程，模块都是存在本地硬盘中加载比较快，所以Node.js采用CommonJS
 * 三个部分：
 * module变量在每个模块内部，就代表当前模块
 * exports属性是对外的接口，用于导出当前模块的方法或变量
 * require()用来加载外部模块，读取并执行js文件，返回该模块的exports对象
 * 
 * 加载时执行：
 * a.js
 * exports.done = ture
 * var b = require('b.js')
 * console.log('a.js-done')
 * 
 * b.js
 * exports.done = false
 * var a = require('a.js')
 * console.log(a.done)
 * console.log('b.js-done')
 * 
 * App.js   执行App.js
 * var a = require('a.js') // 因为引用b.js，执行b.js代码故打印出true b.js-done，引用完毕后接着执行打印出 a.js-done
 * var b = require('b.js')// 已经被a引用过，不再执行 直接在缓存中找出 exports {done：false} 返回
 * console.log(a.done)
 * console.log(b.done) 
 * 
 * 如果a.js改成如下
 * var b = require('b.js')
 * exports.done = ture
 * console.log('a.js-done')
 * 执行App.js
 * 打印结果为undefined b.js-done a.js-done true false 
 * 因为a依赖b时，执行b，b再依赖a时，exports.done = ture语句还未执行，故a 的 exports 为{} exports.done自然为undefined
 * 
 * 
 * 只有commonjs因为同步加载，加载时执行可实现循环依赖，其他模式均不可以处理循环依赖的用法
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
 * ES6于CommonJS模块差异
 * CommonJS模块输出的是一个值的拷贝，ES6模块输出的是值得引用
 * CommonJS模块运行时加载，ES6模块编译时输出接口
 * 
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
 * 
 * 如何实现一个文件一个作用域？
 * 保证模块拥有独立作用域，采用对象命名空间的思想，即每个模块返回一个接口对象，这个独立作用域就是一个对象
 * 如何拿到依赖模块的接口对象？
 * 参数即define传入的函数，执行函数，返回函数返回的结果即对象
 * 如何让寻找依赖？
 * 拼接地址，缓存，然后递归
 */
/** 图片：依赖加载策略 模块数据初始化 资源定位-动态加载 依赖管理解决方案*/

(function(global) {
  var startUp = global.startUp = {
    version:'1.0.1'
  }
  
  
  var data = {} //配置信息
  var cache = {}
  var anonymousMeta = {}
  //模块生命周期

  var status = {
    FETCHED: 1,
    SAVED:2,
    LOADING:3,
    LOADED:4,
    EXECTING:5,
    EXECTED:6
  }
  var isArray = function (obj) {
    return toString.call(obj) === "[object Array]"
  }
  var isFunction = function (obj) {
    return toString.call(obj) === "[object Function]"
  }
  var isString = function (obj) {
    return toString.call(obj) === "[object String]"
  }
  function scripts(){
    return document.getElementsByTagName('script')
  }
  function getInteractiveScript(){ //支持data-main属性添加默认路径: <script data-main = 'common/js' src='module.js'></script>
    var arrS = scripts()
    var dataMain,src
    var exp = /^.*\.js$/
    arrS = [].slice.call(arrS)
    arrS.forEach(function(script){
      dataMain = script.getAttribute('data-main')
      if(dataMain && !data.baseUrl && !(exp.test(dataMain))){
        if(dataMain.substring(dataMain.length-1) !== '/'){
          dataMain = (dataMain+'/')
        }
        data.baseUrl = dataMain
      }
    })
  }
  getInteractiveScript()
  //是否使用了别名
  function parseAlias(id){
    var alias = data.alias //是否配置别名
    return alias && isString(alias[id]) ? alias[id] :id //没有配置别名，返回原来值，有配置别名，返回别名对应值
  }
  //不能以'/'':'开头，必须是一个'/'后面跟随任意字符至少一个
  var PATH_RE = /^([^\/:]+)(\/.+)$/ //([^\/:]+) 路径的短名称配置

  //检测是否 书写路径短名称
  function parsePaths(id) {
    var paths = data.paths; //是否配置短路径
    if(paths && (m=id.match(PATH_RE)) && isString(paths[m[1]])){
      id = paths[m[1]]+m[2]
    }
    return id
  }

  //检测是否添加后缀
  function normalize(path){
    var last = path.length-1
    var lastC = path.charAt(last)
    return (lastC === '/' || path.substring(last-2) === '.js') ? path :path+'.js'
  }
  //添加根目录
  function addBase(id,uri){
    // var result;
    // //相对路径
    // if(id.charAt(0) === '.'){
    //   result = realpath( (uri ? uri.match(/[^?]*\//)[0] : data.cwd ) + id)
    // }else{
    //   result = data.cwd+id
    // }
    var result = data.baseUrl ?data.cwd + data.baseUrl +id : data.cwd + id //支持data-main属性添加默认路径
    return result
  }

  var DOT_RE = /\/.\//g //   /a/b/./c/./d ==>/a/b/c/d     /./ ==>/
  var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//; // a/b/c/../../d ===>a/b/../d ==> a/d    /xxxxx/../==> /
  //规范路径
  function realpath(path){
    path = path.replace(DOT_RE,'/')
    while(path.match(DOUBLE_DOT_RE)){
      path= path.replace(DOUBLE_DOT_RE,'/')
    }
    return path
  }
  //生成绝对路径 资源路径解析
  startUp.resolve = function (child,parent) {
    if(!child) return ''
    child = parseAlias(child) //检测是否有别名
    child = parsePaths(child) //检测是否有路径别名，依赖模块中引包的模块路径地址 require('app/c)
    child = normalize(child) //检测是否添加后缀
    return addBase(child,parent) //添加根目录
  }

  startUp.request = function(url,callback){
    var node = document.createElement('script')
    node.src = url
    document.body.appendChild(node)
    node.onload = function(){
      node.onload = null
      document.body.removeChild(node) //加载依赖结束后移除加载时的script标签
      callback()
    }
  }
  //模块加载器启用
  startUp.use = function(list,callback){
    //检阅有没有预先加载的模块
    Module.preload(function(){
      Module.use(list,callback,data.cwd+"_use_"+cid()) //虚拟的根目录
    })
  }
  //模块加载器配置
  /**
   * 
   * startUp.config({
   *   alias:{
   *    a:'common/js/a'
   *   },
   *   preload:[c.js]
   * })
   */
  startUp.config = function (options) {
    var key,curr
    for(key in options){
      curr = Option[key]
      data[key] = curr
    }
  }

  //构造函数 模块初始化数据
  function Module(uri,deps){
    this.uri = uri;
    this.deps = deps || [] //依赖项
    this.exports = null
    this.status = 0
    this._waitings = {}
    this._remain = 0
  }

  //分析主干(左子树 | 右子树)上的依赖项
  Module.prototype.load = function(){
    var m = this
    m.status = status.LOADING//LOADING == 3 正在加载模块依赖项
    var uris = m.resolve()//获取主干上的依赖项
    var len = m.remain = uris.length

    //加载主干上的依赖项(模块)
    var seed
    for(var i=0;i<len;i++){
      seed = Module.get(uris[i]) //创建缓存信息
      if(seed.status <status.LOADED){ //LOADED == 4 准备加载执行当前模块
        seed._waitings[m.uri] = seed._waitings[m.uri] || 1 //多少模块依赖于我，_waitings是依赖我的模块的路径集合
      }else{
        seed._remain--
      }
    }
    //如果依赖列表模块全部加载完毕
    if(m._remain == 0){ //递归过程到此结束
      //获取模块的接口对象
      m.onload()
    }

    //准备执行根目录下的依赖列表中的模块
    var requestCache = {}
    for(var i=0;i<len;i++){
      seed = Module.get(uris[i])
      if(seed.status < status.FETCHED){
        seed.fetch(requestCache)
      }
    }
    for(uri in requestCache){
      requestCache[uri]()
    }
  }

  Module.prototype.fetch = function(requestCache){
    var m =this
    m.status = status.FETCHED
    var uri = m.uri
    requestCache[uri] = sendRequest; //Document.createElement('script)
    
    function sendRequest(){
      startUp.request(uri,onRequest) //动态加载script
    }

    function onRequest(){ //事件函数 script标签加载模块结束后，onload 函数中会被调用
      if(anonymousMeta){ //模块的数据更新
        m.save(uri,anonymousMeta)
      }
      m.load() //递归 模块加载策略
    }
  }

  Module.prototype.onload = function(){
    var mod = this
    mod.status = LOADED //4
    if(mod.callback){//获取模块接口对象
      mod.callback()
    }
    var waitings = mod._waitings //依赖加载完，递归回调 被依赖模块(父)的callback
    var key,m;
    for(key in waitings){
      var m = cache[key]
      m._remain -= waitings[key]
      if(m._remain == 0){ //判断父模块依赖是否全部加载完
        m.onload()
      }
    }
  }
 
  //资源定位 解析依赖项生成绝对路径
  Module.prototype.resolve = function(){
    var mod = this
    var ids = mod.deps
    var uris = []
    for(var i =0;i<ids.length;i++){
      uris[i] = startUp.resolve(ids[i],mod.uri) //依赖项（主干 | 子树）
    }
    return uris;
  }

   //更改初始化数据
  Module.prototype.save = function(uri,meta){
    var mod = Module.get(uri)
    mod.uri = uri
    mod.deps = meta.deps || []
    mod.factory = meta.factory
    mod.status = status.SAVED
  }
  
  //获取接口对象
  Module.prototype.exec = function(){
    var module = this
    //防止重复执行
    if(module.status >= status.EXECTING){
      return module.exports
    }
    module.status = status.EXECTING;
    var uri = module.uri
    function require(id){ //作为参数传递到define参数的函数中
      return Module.get(require.resolve(id)).exec() //获取接口对象
    }

    require.resolve = function(id){
      return startUp.resolve(id,uri)
    }

    var factory = module.factory //define传入的函数
    var exports = isFunction(factory) ? factory(require,module.exports= {},module) :factory;
    if(exports === undefined) {
      exports = module.exports
    }
    module.exports = exports
    module.status = status.EXECTED //6
    return exports
  }

  //定义一个模块
  Module.define = function(factory){
    var deps
    if(isFunction(factory)){
      //正则解析依赖项
      deps = parseDependencies(factory.toString())
    }
    //存储当前模块信息
    var meta = {
      id:'',
      uri:'',
      deps:deps,
      factory:factory
    }
    anonymousMeta = meta
  }

  //检测缓存对象上是否有当前模块信息
  Module.get = function(uri,deps){
    //cache['xxxxx.js'] = {uri:'xxxxx.js',deps:[]} //module 实例对象
    return cache[uri] || (cache[uri] = new Module(uri,deps))
  }

  Module.use = function(deps,callback,uri){
    var m = Module.get(uri,isArray(deps)?dep:[deps])
    console.log(module)
    //所有模块都加载完毕
    m.callback= function(){
      var exports = [] //所有依赖项模块的接口对象
      var uris = m.resolve()
      for(var i = 0;i<uris.length;i++){
        exports[i] = cache[uris[i]].exec() //获取模块对外定义的接口对象
      }
      if(callback){
        callback.apply(global,exports)
      }
    }
    m.load()
  }

  var _cid = 0

  function cid(){
    return _cid++
  }
  // data.preload = []
  //取消当前项目文档的URL
  data.cwd = document.URL.match(/[^?]*\//)[0]
  Module.preload = function(callback){
    var preload = data.preload ||[]
    var length = data.preload.length
    if(length){ //length !== 0 先加载预先设定模块
      Module.use(preload,function () {
        preload.splice(0,length)
        callback()
      },data.cwd+'_use_'+cid())
    } else{
      callback() 
    }
    
  }
  
  var REQUIRE_RE = /\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
  function parseDependencies(code){
    var ret = []
    code.replace(REQUIRE_RE,function(m,m1,m2){
      if(m2) ret.push(m2)
    })
    return ret
  }
  global.define = module.define
})(this)