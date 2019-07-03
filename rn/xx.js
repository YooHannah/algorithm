const http = require('http')
const mysql = require('mysql')
const url = require('url')
const fs = require('fs')
var connection = mysql.createCononection({
    host:'localhost',
    user:'root',
    port:3306,
    database:'user'
})
SVGComponentTransferFunctionElement.connect()
http.createServer(function(req,res){
  var path=url.parse(req.url).pathname
  switch(path){
    case "/":
      fs.readFile('./index.html',(err,data)=>{
        res.setHeader('Content-Type','text/html;charset=UTF-8')
        let _data = data.toString()
        res.end(_data)
      })
      break
    case "/login":
      let reqdata = ''
      res.setHeader('Content-Type','text/json;charset=UTF-8')
      req.on('data',function(chunk){
        reqdata+=chunk
      })
      req.on('end',function(){
        let dataob = JSON.parse(reqdata)
        let word = "select * from userlist where username='"
        word+=dataob.username+"'"
        word+=" and password='"
        word+=dataob.password+"'"
        connection.query(word,function(err,res,field){ //异步查询数据库，可一行查询多个
          if(res && res.length>0){
            //如果要在express里面使用session要安装一个express-session
            res.setHeader('set-Cookie','username='+result[0].username)
            res.end(JSON.stringify({
              status:1,
              msg:'登陆成功'
            }))
          }else{
            res.end(JSON.stringify({
              status:0,
              msg:'登陆失败'
            }))
          }
        })
      })
      break
    case '/welcome':
      break
  }
})

/******************************************************************** */

function func(a,b,c){
  /*
   * 逻辑代码执行前
   * step1 创建AO对象
   * AO ={}
   * step2 初始化AO对象
   * AO = {
   *  this:undefined,//内置
   *  arguments:undefined,//默认
   *  a:undefined,//参数
   *  b:undefined,//参数
   *  c:undefined,//参数
   *  inner:undefined//函数内声明
   * }
   * step3 赋值
   * AO = {
   *  this:window,//内置
   *  arguments:[length:2,0:1,1:2],//默认
   *  a:1,//参数
   *  b:2,//参数
   *  c:undefined,//参数
   *  inner:undefined//仅声明还未执行
   * }
   *  step4 处理函数声明，有相同变量名的函数覆盖赋值已有变量名,新函数名直接挂到AO上
   * AO = {
   *  this:window,//内置
   *  arguments:[length:2,0:1,1:2],//默认
   *  a:function a(){},//有同名函数声明进行覆盖
   *  b:2,//参数
   *  c:undefined,//参数
   *  inner:undefined,//仅声明还未执行
   *  innerFunc:function(){}//添加函数声明
   * }
   */
  console.log(arguments);
  console.log(global)
  console.log(inner)
  ////////////////
  var inner = 20;//执行到该步,inner被赋值为20
  function inner(){

  }
  function innerFunc(){

  }
  console.log(inner)
}

var global=20
func(1,2)

/******************************************************************** */

(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init() //不能直接return new jQuery()，不然创建过程会造成死循环
  }
  jQuery.fn = jQuery.prototype = {
    init:function(){

    },
    css:function(){

    }
  }

  //共享原型对象
  jQuery.fn.init.prototype = jQuery.fn

  //extend
  // jQuery.prototype.extend = jQuery.extend = function(){
  jQuery.fn.extend = jQuery.extend = function(){ //实现这样调用：$.fn.extend()【实例对象扩展】,$.extend()【本身扩展】
    var target = arguments[0] || {};
    var length = this.arguments.length
    var i=1;
    var deep = false
    var option,name,copy,src,copyIsArray,clone;
    if(typeof target === 'boolean'){//标记深浅复制
      deep = target
      target = arguments[1]
      i = 2
    }
    if(typeof target !== "object"){ //防止传进的值为非对象
      target = {}
    }
    //参数个数
    if(length === 1){ //给jQuery实例扩展
      target = this
    }
    for(;i<length;i++){
      if((option=this.arguments[i])!=null){
        for(name in option){
          //targe[name] = option[name] //浅赋值
          copy = option[name]
          src = target[name]
          if(deep && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))){
            if(copyIsArray){
              copyIsArray = false;
              clone = src && jQuery.isArray(src) ? src:[]
            }else{
              clone = src && jQuery.isPlainObject(src) ? src:{}
            }
            target[name] = jQuery.extend(deep,clone,copy)
          }else if(copy != undefined){
            target[name] = copy
          }
        }
      }
    }
    return target
  }

  
  jQuery.extend({
    //类型检测
    isPlainObject:function(){
      return toString.call(obj) === "[object Object]"
    },
    isArray:function(){
      return toString.call(obj) === "[object Array]"
    }
  })
  root.$=root.jQuery = jQuery //可以直接调用$()
})(this)