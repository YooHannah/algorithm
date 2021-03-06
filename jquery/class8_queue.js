/**
 * queue队列，如同data数据缓存与Deferred异步模型一样，都是jQuery库的内部实现的基础设施
 *  queue队列是animante动画依赖的基础设施，整个jquery中队列仅供给动画使用
 * queue数据存储重度依赖了data函数
 * 动画会调用队列，队列会调用data数据接口还保存队列里面的动画数据
 */
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
  //类数组结构检测
  function isArraylike(obj){
    var len = obj.length
    return toString.call(obj) === '[object Array]' || typeof obj!=='function' &&(len === 0 || typeof len === 'number' && len> 0 && (len-1)in obj)
  }
  function Data(){
    //jQuery.expando是jquery的静态属性，对于jquery的每次加载运行期间时唯一的随机数
    this.expando = jQuery.expando+Math.random() //UUID 用作key挂载dom对象上 
    this.cache = {}//创建缓存对象
    //
  }
  Data.uid = 1
  Data.prototype={
    key:function(elem){
      var descriptor={},
          unlock = elem[this.expando] //UUID
      if(!unlock){
        unlock = Data.uid++;
        descriptor[this.expando]={//钥匙
          value:unlock
        }
        //方法直接在一个对象上定义一个或多个新的属性或修改现有属性，并返回该对象
        Object.defineProperties(elem,descriptor)//elem[this.expando] = unlock
      }
      //确保缓存对象记录信息
      if(!this.cache[unlock]){
        this.cache[unlock] = {}//数据
      }
      return unlock
    },
    get:function(elem,key){
      //找到或者创建缓存
      var cache = this.cache[this.key(elem)] //this.key(elem) 生成ID
      //key 有值直接在缓存中取读
      return key === undefined?cache:cache[key]
    },
    set:function(owner,key,value){
      var prop
      var unlock= this.key(owner)
      var cache = this.cache[unlock]
      if(typeof key === 'string'){
        cache[key] = value
      }
      if(jQuery.isPlainObject(key)){
        for(prop in key){
          cache[key] = value
        }
      }
    },
    access:function(owner,key,value){
      /**
        处理elem在cache中映射的缓存数据对象 >{id:{**queue}}
        未指定key的值 返回整个缓存对象
        指定了key 未设置value 返回存储在cache中对应的key的数据
      */
      this.set(owner,key,value)
      return value !== undefined?value:key
    }
  }
  //缓存用户的数据
  var data_user = new Data()
  //缓存对象 内部私有
  var data_priv = new Data()

  jQuery.fn.extend({
    //缓存数据到dom结点
    //$('.box').data('name','max')
    //console.log($('.box').data('name'))
    data:function(key,value){
      var _this=this
      return jQuery.access(this,function(){
        //get
        if(value===undefined){
          var data = data_user.get(this,key)
          if(data !==undefined){
            return data
          }
        }
        //set
        _this.each(function(){
          data_user.set(this,key,value)
        })
      },null,value)
    }
  })

  jQuery.extend({
    queue:function(elem,type,data){
      var queue,type
      if(elem){
        type = (type || 'fx') +'queue'
        var queue = data_priv.get(elem,type)
        if(data){
          if(!queue || jQuery.isArray(data)){
            data_priv.access(elem,type,jQuery.markArray(data))
          }else{
            queue.push(data)
          }
        }
        return queue || []
      }
    },
    dequeue:function(elem,type){
      type = type || 'fx'
      var queue = jQuery.queue(elem,type),
          startLength = queue.length,
          fn = queue.shift,
          next = function(){ //接着执行下一个队列中的函数*********！
            jQuery.dequeue(elem,type)
          }，
          hooks = jQuery._queueHooks(elem,type) //1.用于队列函数全部处理完后的清理工作2.用作钩子函数，存储动画数据的信息
      if(fn === 'inprogress'){
        fn = queue.shift()
        startLength--
      }
      if(fn){
        if(type === 'fx'){
          queue.unshift('inprogress')
        }
        fn.call(elem,next)
      }
      if(!startLength && hooks){
        hooks.empty.fire()
      }
    }
  })

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
    now:Data.now,//返回当前时间距离时间零点的毫秒数
    //类型检测
    isPlainObject:function(){
      return toString.call(obj) === '[object Object]'
    },
    isArray:function(obj){
      return toString.call(obj) === '[object Array]'
    }，
    markArray:function(arr,results){
      var ret = results || []
      if(isArraylike(arr)){
        if(arr != null){
          jQuery.merge(ret,typeof arr === 'string'?[arr]:arr)
        }
      }else{
        [].push.call(ret,arr)
      }
      return ret
    }
  })
  root.$ = root.jQuery = jQuery
})(this);