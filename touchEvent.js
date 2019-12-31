(
  function (window) {
    function myMobile(selector){
      return myMobile.prototype._init(selector)
    }
    myMobile.prototype = {
      _init:function(selector){
        if(typeof selector === 'string'){
          this.ele = window.document.querySelector(selector)
          return this
        }
      },
      //单击事件
      tap: function (handler) { 
        this.ele.addEventListener('touchstart',touchFn)
        this.ele.addEventListener('touchend',touchFn)
        var startTime,endTime
        function touchFn(e) { 
          e.preventDefault()
          switch( e.type){
            case "touchstart":
              startTime = new Date().getTime()
              break
            case "touchend":
              endTime = new Date().getTime()
              if(endTime-startTime<500){
                handler.call(this,e)
              }
              break
          }
         }
       },
       //长按事件
       longTap:function(handler){
        this.ele.addEventListener('touchstart',touchFn)
        this.ele.addEventListener('touchmove',touchFn)
        this.ele.addEventListener('touchend',touchFn)
        var timerId
        function touchFn(e) { 
          switch( e.type){
            case "touchstart":
              timerId = setTimeout(function(){
                handler.call(this.e)
              },500)
              break
            case "touchmove":
              clearTimeout(timerId)
              break
            case "touchend":
              clearTimeout(timerId)
              break
          }
         }
       },
       //左侧滑动
       slideLeft:function(handler){
        this.ele.addEventListener('touchstart',touchFn)
        this.ele.addEventListener('touchend',touchFn)
        var startX,startY,endX,endY
        function touchFn(e) { 
          e.preventDefault()
          var firstTouch = e.changedTouches[0]
          switch (e.type){
            case "touchstart":
              startX = firstTouch.pageX
              startY = firstTouch.pageY
              break
            case "touchend":
              endX = firstTouch.pageX
              endY = firstTouch.pageY
              if(Math.abs(endX-startX)>=Math.abs(endY-startY)&&startX-endX>=25){
                handler.call(this,e)
              }
              break
          }
        }
       }
    }
    window.$= window.myMobile = myMobile
})(window)