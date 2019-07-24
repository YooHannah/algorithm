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

  }
  // jQuery.prototype.init.prototype = jQuery.prototype 
  jQuery.fn.init.prototype = jQuery.fn
  root.$ = root.jQuery = jQuery
})(this);
