/**
 * $() 无new 实现创建实例
 */
(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init() //创建jQuery.prototype.init()的实例返回
  }
  jQuery.prototype = {
    init:function(){},
    css:function () {}
  }
  //共享原型对象
  //将init原型对象指向jQuery原型对象，实现共享，从而让产生的init实例共享原型方法
  jQuery.prototype.init.prototype = jQuery.prototype 
  root.$ = root.jQuery = jQuery //把$符，jQuery挂到window上，可以直接使用
})(this);

/**
 * extend方法实现
 * 
 * extend方法可以给jQuery本身扩展方法，
 * $.extend({work:function(){}}) ----> jQuery.work()
 * 
 * 也可以给实例进行扩展
 * $.fn.extend({name:'jack'}) ----> $().name //jack
 * 
 * 也可以给任意对象扩展
 * var obj = $.extend({},{name:'hannah'}) ---->obj:{name:'hannah'}
 */
(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init()
  }
  jQuery.fn = jQuery.prototype = {
    init:function(){},
    css:function () {}
  }
  //extend
  jQuery.fn.extend = jQuery.extend = function(){
    var target = arguments[0] || {}
    var length = arguments.length
    var i=1
    var deep=false //标识是否深度复制
    var option,name,copy,src，copyIsArray;
    if(typeof target === 'boolean'){ //第一个参数为boolean,true进行深度复制，false浅复制
      deep = target;
      target = arguments[1]
      i=2
    }
    if(typeof target !== 'object'){ //如果目标对象，传进来不是对象，规范为对象
      target = {}
    }
    if(length === i){ //实例进行扩展,或者对jquery本身扩展的情况
      target = this
      i--
    }
     for(;i<length;i++){
      if((option=arguments[i])!=null){
          for(name in option){
            copy = option[name]
            src = target[name]
            if(deep && (jQuery.isPlainObject(copy)||(copyIsArray=jQuery.isArray(copy)))){ //深度复制时，判断要复制的值是对象还是数组
              if(copyIsArray){//如果是数组
                copyIsArray=false;//||短路原理复原，防止下一个属性值不是数组
                clone = src && jQuery.copyIsArray(src)?src:[]//一开始没有值的话初始化为数组，否则保留原值(有值的话，可能是原来就有该name key的值,要不然就是已经处理过一个argument级别里面的值，这个值有name key这个属性，并有值)，用于递归复制
              }else{//如果是对象
                clone = src && jQuery.isPlainObject(src)?src:{}//同数组，初始化为对象
              }
              targe[name] = jQuery.extend(deep,clone,copy)//递归处理值为对象的属性
            }else if(copy !=undefined){//浅复制/深度复制递归最底层
              target[name] = copy
            }
          }
      }
     }
     return target
  }
  // jQuery.prototype.init.prototype = jQuery.prototype 
  jQuery.fn.init.prototype = jQuery.fn
  jQuery.extend({
    //类型检测
    isPlainObject:function(){
      return toString.call(obj) === '[object Object]'
    },
    isArray:function(obj){
      return toString.call(obj) === '[object Array]'
    }
  })
  root.$ = root.jQuery = jQuery
})(this);
