/**
 * DOM0级事件
 * 通过JS指定事件处理程序的传统方式
 * 就是将一个函数赋值给一个事件处理程序属性
 * 
 * DOM2级事件
 * 2级DON中增加定义了DOM事件模型的概念
 * DOM2级事件规定的事件流包括3个阶段：
 * 事件捕获阶段，处于目标阶段和事件冒泡阶段
 * 首先发生的是事件捕获，然后处于目标阶段，最后才是事件冒泡
 * DOM2级事件定义了一个方法用于指定事件处理程序
 * addEventListener()
 * 接受三个参数：
 * 处理事件名称；
 * 事件处理程序；
 * 一个指定是在事件冒泡还是事件捕获阶段处理的布尔值
 * true 则为在事件捕获阶段处理
 * false(默认)为在事件冒泡阶段处理
 * 
 * 事件委托
 * 利用事件冒泡，只指定一个事件处理程序来管理某一类型的所有事件
 * 好处：提升整体运行性能
 * 原理：子元素触发事件的响应利用冒泡阶段，委托父级元素代为执行
 * 
 * jQuery事件API
 * 1.为被选元素添加一个或多个事件处理程序，并规定事件发生时运行的函数
 *   $(selector).bind(event,data,function) 
 * 2.为被选元素的子元素添加一个或多个事件处理程序，并规定事件发生时运行的函数
 *   $(selector).delegate(child,event,data,function)
 * 3.在被选元素及子元素上添加一个或多个事件处理程序
 *  $(selector).on(event,child,data,function)
 */

/**on的实现 */

(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init()
  }
  jQuery.fn = jQuery.prototype = {
    init:function(){},
    css:function () {},
    /**
     * object 目标源
     * callback 回调函数
     * args 自定义回调函数参数
     */
    each:function(object,callback,args){
      //objec 数组对象||object对象
      var length = object.length
      var name,i = 0
      //自定义callback函数
      if(args){
        if(length === undefined){
          for(name in object){
            callback.apply(object,args)
          }
        }else{
          for(;i<length;){
            callback.apply(object[i++],args)
          }
        }
      }else{
        if(length === undefined){
          for(name in object){
            callback.call(object,name,object[name])
          }
        }else{
          for(;i<length;){
            callback.call(object[i],i,object[i++])
          }
        }
      }
    }
  }
  function Data(){
    //jQuery.expando是jquery的静态属性，对于jquery的每次加载运行期间时唯一的随机数
    this.expando = jQuery.expando+Math.random()
    this.cache = {}
    //
  }
  Data.uid = 1
  Data.prototype={
    key:function(elem){
      var descriptor={},unlock = elem[this.expando]
      if(!unlock){
        unlock = Data.uid++;
        descriptor[this.expando]={//钥匙
          value:unlock
        }
        //方法直接在一个对象上定义一个或多个新的属性或修改现有属性，并返回该对象
        Object.defineProperties(elem,descriptor)
      }
      //确保缓存对象记录信息
      if(!this.cache[unlock]){
        this.cache[unlock] = {}//数据
      }
      return unlock
    },
    get:function(elem,key){
      //找到或者创建缓存
      var cache = this.cache[this.key(elem)] //1 {}=>{events:{},handle:function(){}}
      //key 有值直接在缓存中取读
      return key === undefined?cache:cache[key]
    }
  }
  var data_priv = new Data()
  //jQuery 事件模块
  jQuery.event = {
    //1.利用data_priv 数据缓存，分离事件与数据 2：元素与缓存中建立guid的映射关系用于查找
    add:function (elem,type,handler) {
      var eventHandle,events,handlers;
      //事件缓存---数据仓库里面对应的数据对象
      var elemData = data_priv.get(elem)
      //handler是事件函数
      //检测handler是否存在ID(guid)如果没有那么传给他一个ID
      //添加ID的目的是 用来寻找或者删除相应的事件
      if(!handler.guid){
        handler.guid = jQuery.guid++;
      }
      /**
       * 给缓存增加事件处理句柄
       * elemData={
       *  events:
       *  handle:
       * }
       */
      //同一个元素，不同事件，不重复绑定
      if(!(events=elemData.events)){
        events = elemData.event={}
      }
      if(!(eventHandle=elemData.handle)){
        //Event 对象代表事件的状态 通过apply传递
        eventHandle = elemData.handle = function(e){
          return jQuery.event.dispatch.apply(eventHandle.elem,arguments)
        }
      }
      eventHandle.elem = elem
      //通过events存储同一个元素上的多个事件 {events:{click:[]}}
      if(!(handler=events[type])){
        handlers= events[type] = [];
        handlers.delegateCount = 0;//事件代理数量
      }
      handler.push({
        type:type,
        handler:handler,
        guid:handler.guid
      })
      //添加事件
      if(elem.addEventListener){
        elem.addEventListener(type,eventHandle,false)
      }
    },
    //修复事件对象event从缓存体中的events对象取得对应队列
    dispatch:function(event){
      //IE兼容性处理如：event.target or event.srcElement(扩展阅读)
      //event = jQuery.event.fix(event)

      //提取当前元素在cache中的events属性值
      var handler = (data_priv.get(this,'events') ||{})[event.type]||[]
      event.delegateTarget = this
      //执行事件处理函数
      jQuery.event.handlers.call(this,event,handler)
    },
    //执行事件处理函数
    handlers:function (event,handlers) {
      handlers[0].handler.call(this,event)
    },
    fix:function(event){
      if(event[jQuery.expando]){
        return event
      }
    },
    trigger:function(event,data,elem){
      var i,cur,tmp,bubbleType,ontype,handle,
          i=0,
          eventPath = [elem||document],
          type = event.type || event,
          cur = tmp = elem = elem||document
          //证明是ontype绑定是事件
          ontype = /^\w+$/.test(type) && 'on' +type;

      //模拟事件对象 如果jQuery.expando说明event已经是模拟的事件对象
      event = event[jQuery.expando]?
      event:new jQuery.event(type,typeof event === 'object' && event);

      //定义event.target属性
      if(!event.target){
        event.target = elem
      }
      //如果没有传入参数，就把event存储在数组中，有传递合并数组
      //如之前所看到：data可选，传递到事件处理程序的额外参数。注意：事件处理程序第一个参数默认event
      data = data == null?[event]:jQuery.markArray(data,[event])
      //事件类型是否需要进行特殊化处理
      special = jQuery.event.special[type]||{}
      //如果事件类型已经有trigger方法，就调用它
    }
  }
  //extend
  jQuery.fn.extend = jQuery.extend = function(){}
  jQuery.fn.init.prototype = jQuery.fn
  jQuery.fn.extend({
    each:function (callback,args) {
      return jQuery.each(this,callback,args)
    },
    on:function(types,fn){
      var type;
      if(typeof types === 'object'){
        for(type in types){
          this.on(types[type],fn)
        }
      }
      return this.each(function(){
        //this 即element对象
        jQuery.event.add(this,types,fn)
      })
    },
    //语法：data可选，传递到事件处理程序的额外参数。注意事件处理程序第一个参数默认是event
    trigger:function(type,data){
      return this.each(function(){
        jQuery.event.trigger(type,data,this)
      })
    }
  })
  jQuery.extend({
    expando:'jQuery'+(core_version+Math.random()).replace(/\D/g,''),
    guid:1,//计数器
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

