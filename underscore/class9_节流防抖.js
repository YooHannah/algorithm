/**
*underscore 节流防抖算法实现原理
*_.throttle(func,wait,options) 表现
* func 处理函数
* wait 指定时间间隔
* options 配置项只能配置{leading:false}或者{trailing:false} 或者都不配置
* leading:false 阻止立即执行，等待wait毫秒之后，func执行一次，在wait时间内的触发都不执行
* trailing:false 先立即执行，func执行一次，之后在wait时间内的触发都不执行，超过或刚好在wait时间的触发再执行
* 都不配置时，以上两种情况均能走通，因而会出现，触发一次，func执行两次
*
*  _.debounce(func,wait,immediate) 
* immediate为true时连续两次触发时间间隔在wait时间之外，第一次触发立即执行，第二次触发也立即执行，
* 若两次触发间隔在wait时间内，则仅执行第一次，第二次触发不执行，直到wait时间后再触发再执行
* immediate为false时,第一次触发，若等待wait时间内的没有第二次触发则等待wait时间后执行，若
* 在等待wait时间内的触发了第二次，甚至三四次，则会延迟func的执行，直到最后一次触发的间隔与上一次间隔大于等于wait，才会执行func
*/
(function(root){
  var _= function(obj){}
  _.now = Date.now

/***节流函数 */
  _.throttle = function(func,wait,option){
    var lastTime = 0
    var timeOut = null
    if(!options){
      options = {}
    }
    var later = function(){
      lastTime = options.leading === false?0:_.now()
      timeOut = null
      result = func.apply(null,args)
    }
    return function(){
      //首次执行节流函数时间
      var now = _.now()
      args = arguments
      //是否配置了leading
      if(!lastTime && options.leading === false){
        lastTime = now
      }
      //如果配置了leading 首次执行remaining === 1500 第二次调用及以上数值逐渐变小
      var remaining = wait -(now-lastTime) //wait 固定值 now(会change) lastTime 上次/第一次调用时间戳 频率===时间戳===对比
      if(remaining<=0){ //配置trailing时
        if(timeOut){
          clearTimeout(timeOut)
          timeOut = null
        }
        lastTime = now
        result = func.apply(null,args)
      }else if(!timeOut && option.trailing !== false){ //配置leading时
        timeOut = setTimeout(later,remaining)
      }
      return result
    }
  }

/*****防抖函数 */
  _.debounce = function(func,wait,immediate){
    var lastTime,timeOut,args,result
    var later = function(){
      var last = _.now()-lastTime
      if(last<wait){
        timeOut = setTimeout(later,wait-last) //根据连续两次调用时间间隔决定func执行，大于等于WAIT才会去执行
      }else{
        timeOut = null //为立即执行下一次触发做准备
        if(!immediate){
          result = func.apply(null,args) //不立即执行状态下连续俩次触发时间超过wait就执行
        }
      }
    }
    return function(){
      args = arguments;
      //首次触发防抖函数的时间戳
      lastTime = _.now()
      //立即调用满足两个条件
      var callNow = immediate && !timeOut
      if(!timeOut){
        timeOut = setTimeout(later,wait) //不立即调用
      }
      if(callNow){
        result = func.apply(null,args) //立即调用
      }
      return result
    }
  }
	root._ = _
})(this)