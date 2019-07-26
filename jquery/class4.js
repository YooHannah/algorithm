/**
 * promise A+规范
 * Promise表示一个异步操作的结果
 * 与Promise最主要的交互方法是，通过将函数传入它的then方法，从而获取Promise最终的值或Promise最终拒绝reject的原因
 * 一个Promise必须处于一下状态其中之一：pending,fulfilled或rejected
 * 一个Promise必须提供一个then方法来获取值或原因
 * 
 * Deferred API
 * jQuery.Deferred() 一个构造函数，返回一个链式实用对象方法来注册多个回调，回调队列，调用回调队列，并转达任何同步或异步函数的成功或失败状态
 * deferred.done() 当Deferred(延迟)对象解决时，调用添加处理程序
 * deferred.fail() 当Deferred(延迟)对象拒绝时，调用添加处理程序
 * deferred.progress()  当Deferred(延迟)对象生成进度通知时，调用(已)添加的处理程序
 * jQuery.when() 提供一种方法来执行一个或多个对象的回调函数，Deferred(延迟)对象通常表示异步事件
 * .promise() 返回一个Promise对象用来观察当某种类型的所有行动绑定到集合，排队与否还是已经完成
 * 
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
        //指定上下文对象执行函数
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
    },
    Deferred:function(func){
      //延迟对象的三种不同状态信息的描述
      //状态，添加处理函数的方式，处理函数的存放队列，最终状态信息描述
      var tuples =[
        ['resolve','done',jQuery.callbacks('once memory'),'resolved'],
        ['reject','fail',jQuery.callbacks('once memory'),'rejected'],
        ['notify','progress',jQuery.callbacks('memory'),]
      ],
      state = 'pending',
      promise = {
        state:function(){return state},
        then:function(){},
        promise:function(obj){return obj!=null?jQuery.extend(obj,promise):promise} //调用$.when时obj为null
      },
      //延迟对象 属性方法
      deferred = {}

      tuples.forEach(function(tuple,i){
        var list = tuple[2],//callbacks实例
            stateString = tuple[3];//不同状态名
        //使执行promise.done()/promise.fail()/promise.progress()相当于执行callbacks.add ，
        //调用$.when时返回promise后会调用这些方法，执行时会立刻调用传入的函数，因为list创建时配有参数memory
        promise[tuple[1]] = list.add
        if(stateString){
          list.add(function(){
            state = stateString
          })
        }
        //使执行deferre.resolve()/deferre.reject()/deferre.notify()相当于执行callbacks.firewith
        deferred[tuple[0]+'with'] = list.fireWith//引入callbacks的firewith方法
        deferred[tuple[0]] = function(){
          //这里仅会执行各自队列里面的第一个函数，state = stateString,更新状态，
          //同时本次执行后方便，根据memory创建的callbacks再执行add时，同时执行相应函数
          deferred[tuple[0]+'with'](this===deferred?promise:this,arguments) 
          return this
        }
        
      })
      //将promise属性合并到deferred
      promise.promise(deferred)

      return deferred
    },
    //执行一个或多个对象的延迟对象的回调函数
    when:function(subordinate){
      return subordinate.promise() //返回promise对象
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