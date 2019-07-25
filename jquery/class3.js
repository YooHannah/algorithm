/**
 * $.Callbacks用于管理函数队列
 * 通过add添加处理函数到队列当中，通过fire去执行这些处理函数
 * 再jQuery内部使用，为ajax,$.Deferred等组件提供基础功能函数
 * 
 * 创建
 * $.Callbacks() 返回实例 -----> var cb = $.Callbacks(),可通过添加参数对函数添加或执行进行限制
 * $.Callbacks('once')        仅执行一次
 * $.Callbacks('unique')      往内部队列添加的函数保持唯一，不能重复添加
 * $.Callbacks('stopOnFalse') 内部队列里的函数时依次执行的，当某个函数的返回值时false时，停止继续执行剩下的函数
 * $.Callbacks('memory')      当函数队列fire一次过后，内部会记录当前fire的参数，当下次调用add时，会把记录的参数传递给新添加的函数并立即执行这个新添加的函数
 * 
 * 使用
 * cb.add(function(){})  向内部队列添加函数
 * cb.fire() 依次执行队列里的函数
 */

(function(root){
  var optionsCache = {}
  var _ = {
    callbacks:function(options){
      options = typeof options==='string'?(optionsCache[options]||createOptions(options)):{}
      var list=[]
      var index,length,testting,memory,start,starts;
      var fire = function (data) {
        memory = options.memory && data;//如果配置了memory就把data给到memory,没有配置memory被赋值undefined
        index = starts||0; //配置了memory时，第一次fire,starts为undefined
        start = 0
        testting = true;
        length = list.length
        for(;index<length;index++){
          if(list[index].apply(data[0],data[1])=== false && options.stopOnfalse){
            break
          }
        }
      }
      var self={
        add:function () {
          var args=Array.prototype.slice.call(arguments);//将伪数组转数组
          start = list.length
          args.forEach(function(fn){
            if(toString.call(fn)==="[object function]"){ //校验传参类型
              list.push(fn)
            }
          })
          if(memory){//配置了memory时，只有fire过一次memory才有值
            starts = start //确定开始执行的函数的位置，保证仅执行最新添加的函数
            fire(memory)
          }
          
        },
        fireWith:function(context,arguments){
          var args=[context,arguments]
          if(!options.once || !testting){ //testting用于监听配置了once时进行第一次执行，阻止以后执行
            fire(args)
          }
        },
        fire:function () {
          self.fireWith(this,arguments)
        },
      }
      return self
    }
  }
  function createOptions(options){ //创建时，处理多参数
    var object = optionsCache[options]={}
    options.split(/\s+/).forEach(function (value) {
      object[value] = true
    })
    return object
  }
  root._=_
})(this);