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
//V1 调用方式 cssTransform(dom,'rotate',90)
function cssTransform(element,prop,value){
  //element 要操作的元素
  //prop 运动属性
  //具体值
  //定义一个属性
  var transform,transformValue = ''
  if(element.transform === undefined){
    element.transform = transform=Object.create(null)
    // let a= {}
    // let b =Object.create(null) 
    //二者区别，a 会继承对象原型属性
    //b不会继承对象原型，
    //foe-in遍历时a除了自身属性还是遍历原型上属性
    //b仅包含自身属性，故仅遍历自身属性
  }
  //设置元素
  if(value !== undefined){
    element.transform[prop] = value
    transform = element.transform
     //transform对象可能不止一个属性 遍历
    for(let name in transform){
      switch (name){
        case "scale":
        case "scaleX":
        case "scaleY":
          transformValue += ''+name + '('+transform[name]+')'
          break;
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          transformValue +=' '+name + '('+transform[name]+'deg)'
          break
        default:
        transformValue +=' '+name + '('+transform[name]+'px)'
      }
    }
    //赋值
    element.style.WebkitTransform = element.style.transform = transformValue
  }else{
    //读取元素属性值
    return element.transform[prop]
  }
}
//v2 调用方式 dom.cssTransform('rotate',90)
HTMLElement.prototype.cssTransform = function (prop,value) {
  var transform,transformValue = ''
  if(this.transform === undefined){
    this.transform = transform=Object.create(null)
  } 
   //设置元素
   if(value !== undefined){
    this.transform[prop] = value
    transform = this.transform
     //transform对象可能不止一个属性 遍历
    for(let name in transform){
      switch (name){
        case "scale":
        case "scaleX":
        case "scaleY":
          transformValue += ''+name + '('+transform[name]+')'
          break;
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          transformValue +=' '+name + '('+transform[name]+'deg)'
          break
        default:
        transformValue +=' '+name + '('+transform[name]+'px)'
      }
    }
    //赋值
    this.style.WebkitTransform = this.style.transform = transformValue
  }else{
    //读取元素属性值
    return this.transform[prop]
  }
}
//v3 数据驱动实现 Transform(dom) dom.translate = 100
function  Transform(element){
  var transform = {}
  var transformValue = ''
  var props = ['scaleX','scaleY','rotate','rotateX','rotateY','skewX','skewY']
  props.forEach(function(prop){
    if(prop.indexOf('scale')>=0){
      transform[prop] = 1
    }else{
      transform[prop] = 0
    }
    Object.defineProperty(element,prop,{
      get:function(){
        return transform[prop]
      },
      set:function(value){
        transformValue = ''
        transform[prop]= value
          //transform对象可能不止一个属性 遍历
        for(let name in transform){
          switch (name){
            case "scale":
            case "scaleX":
            case "scaleY":
              transformValue += ''+name + '('+transform[name]+')'
              break;
            case 'rotate':
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'skewX':
            case 'skewY':
              transformValue +=' '+name + '('+transform[name]+'deg)'
              break
            default:
            transformValue +=' '+name + '('+transform[name]+'px)'
          }
        }
        //赋值
        element.style.WebkitTransform = element.style.transform = transformValue
      }
    })
  })
}

//利用transform实现自定义滑动,通过监听touchstart记录开始位置，监听touchmove得到当前位置计算移动位置，然后修改父元素CSS位移位置
var lists = document.getElementById('list')
var startY = 0;
var startEl = 0
var translateY = 0
lists.addEventListener('touchstart',function(e){
  startY = e.changedTouches[0].pageY
  startEl = translateY
})
lists.addEventListener('touchmove',function(e){
  var moveY = e.changedTouches[0].pageY
  var distance = moveY-startY
  translateY = startEl+distance
  lists.style.WebkitTransform = lists.style.transform = 
  'translateY('+translateY+'px)'
})


//陀螺仪摇一摇实现
{/* <div id = 'con'>
  <p id='text'>开始摇一摇</p>
</div> */}
var lastX=0,lastY=0,lastZ=0
var maxRange = 70 //触发摇动的幅度阙值，大于该值时认为进行了摇动，
var minRange = 10 //停下来之后的幅度阙值，当小于该值时认为摇动停止
var isRange = false //节流阀，是否进行过摇动的标志
var text = document.getElementById('text')
window.addEventListener('devicemotion',(e)=>{
  var motion = e.accelerationIncludingGravity//获取各个方向的重力加速度
  var x=Math.round(motion.x)
  var y=Math.round(motion.y)
  var z=Math.round(motion.z)
  //保证安卓与IOS兼容性
  function getAdr(){ //获取机型判断是否时安卓
    var type = navigator.userAgent
    var isAndroid = type.indexOf('Android')>-1 || type.indexOf('Adr')
    return isAndroid
  }
  if(!getAdr()){
    x = -x
    y = -y
    z = -z
  }
  var distance = Math.abs(x-lastX)+Math.abs(y-lastY)+Math.abs(z-lastY)
  if(distance>maxRange){
    text.innerHTML = '摇一摇'
    isRange = true
    //do sth
  }
  if(distance<minRange&&isRange){
    isRange = false
    setTimeout(()=>{
      text.innerHTML = '触发事件'
    },3000)
    //do sth
  }
  lastX = x
  lastY = y
  lastZ = z
})

//多指操作Android兼容处理
//gesture(dom,{
//   start:()=>{},
//   change:()=>{},
//   end:()=>{}
// })
(function(w){
  w.gesture = (ele,callback)=>{
    let isStart = false
    ele.addEventListener('touchStart',(event)=>{
      if(event.touches.length >=2){ //触点多余1个才能叫多触点
        isStart = true
         this.startDistance= getDistance(event.touches[0],event.touches[1])
         this.startDeg = getDeg(event.touches[0],event.touches[1])
         if(callback && typeof callback['start'] === 'function'){
            callback['start'](event)
         }
      }
    })
    ele.addEventListener('touchmove',(event)=>{
      if(event.touches.length >=2){ //触点多余1个才能叫多触点
         var currDistance= getDistance(event.touches[0],event.touches[1])//记录两个触点实时位置
         var currDeg = getDeg(event.touches[0],event.touches[1])//记录实时角度
         event.scale = currDistance/this.startDistance //计算实时距离与初始距离的比例，传入event属性里
         event.rotation = currDeg-this.startDeg //计算实时角度与初始角度的差值
         if(callback && typeof callback['change'] === 'function'){
            callback['change'](event)
         }
      }
    })
    ele.addEventListener('touchend',(event)=>{
      if(event.touches.length <2 && isStart){ //触点多余1个才能叫多触点
         if(callback && typeof callback['end'] === 'function'){
            callback['end'](event)
         }
      }
      isStart = false
    })
    //两点的距离
    function getDistance(touch1,touch2){
      var x=touch1.clientX-touch2.clientX
      var y=touch1.clientY-touch2.clientY
      return Math.sqrt(x*x+y*y)//勾股定理
    }
    //两触点角度
    function getDeg(){
      var x=touch1.clientX-touch2.clientX
      var y=touch1.clientY-touch2.clientY
      var radian = Math.atan2(y,x) //tan值=对边Y/临边X
      return radian*180/Math.PI
    }
  }
})(window)


