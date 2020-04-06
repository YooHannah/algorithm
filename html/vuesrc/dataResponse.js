//vue2.0响应式原理
//1.对象响应式，遍历每个key,定义getter,setter
//2.数组响应，覆盖数组原型方法，额外增加通知逻辑
//对象响应式原理：Object.defineProperty() 递归遍历传入的obj，定义每个属性拦截
//数组响应式原理:覆盖可以修改数组的7个方法
//从数组原型中获取这个方法，并覆盖为可以发送更新通知的函数实现
const originalProto = Array.prototype
const arrayProto = Object.create(originalProto)
['push','pop','shift','unshift','splice','reverse','sort'].forEach(
  method=>{
    arrayProto[method] = function(){
      //做数组方法本来应该做的事
      originalProto[method].apply(this,arguments)
      //通知更新
      notifyUpdate()
    }
  }
)
function observe(obj){
  if(typeof obj !== 'object' || obj == null){
    return obj
  }
  //判断类型，如果是数组则替换他的原型
  if(Array.isArray(obj)){ //替换具体数组的原型方法，而不是替换数组对象原型方法
    Object.setPrototypeOf(obj,arrayProto)
  }else{
    const keys = Object.keys(obj)
    for(let index =0; index<keys.length;index++){
      const key = keys[index]
      //对obj每个key执行拦截
      defineReactive(obj,key,obj[key])
    }
  }
 
}
//具体定义指定的key拦截器
function defineReactive(obj,key,val){
  //递归遍历
  observe(val)
  //val实际是一个闭包
  Object.defineProperty(obj,key,{
    get(){
      return val;//返回父域变量，相当于闭包变量，不会被释放
    },
    set(newVal){
      if(newVal !== val){
        //val可能是对象,比如给一个key值赋值一个对象时
        observe(newVal)
        notifyUpdate()
        val = newVal //更新父域变量，更新闭包值
      } 
    }
  })
}
function notifyUpdate(){
  console.log('页面更新了')
}
let data = {foo:'foo',bar:{a:'aaa'},tua:[1,2]}
//一般更新
data.foo = 'foooooo'
//套嵌更新
data.bar.a = 10
//赋值为对象
data.bar = {a:11}
//数组
data.tua.push(3)

//问题分析
//1.需要响应化的数据较大，递归遍历性能不好，消耗较大
//2.新增或删除属性无法监听
//3.数组响应化需要额外实现
//4.修改语法有限制，不一致
vue3的使用写法
<html>
  <head>
    <scrip src='../vue3.js'></scrip>
  </head>
  <body>
    <div id = 'app'></div>
    <scrip>
      const {createApp,reactive,effect} = Vue;
      //声明组件
      const App = {
        template;'<div>count:{{count}}</div>',
        setup(){
          const state = reactive({ //定义data，做响应式处理
            count:0
          })
          setInterval(()=>{
            state.count++
          },1000)
          effect(()=>{//函数中依赖到的数据发生变化就会执行
            console.log('count发生变化了：',state.count)
          })
          return state
        }
      }

      createApp().mount(App,'#app')
    </scrip>
  </body>
</html>

//vue3响应式原理：利用Proxy对象对数据拦截

//缓存避免重复代理
const toProxy = new WeakMap() //形如 obj:observed
const toRaw = new WeakMap() //形如 observed:obj
//帮助函数
function isObject(obj){
  return typeof obj === 'object' || obj === null
}
function hasOwn(obj,key){
  return obj.hasOwnProperty(key)
}
function reactive(obj){
  if(!isObject(obj)){
    return obj
  } 

  //取缓存
  //查找缓存，避免重复代理
  if(toProxy.has(obj)){
    return toProxy.get(obj)
  }
  //传入obj本身就是一个代理对象,此时不用反复代理
  if(toRaw.has(obj)){
    return obj
  }
  //没有缓存
   //初始化时避免了遍历key
  const observed = new Proxy(obj,{
    get(target,key,receiver){
      //访问
      const res = Reflect.get(target,key,receiver) //避免异常，如key不存在
      console.log(`获取${key}:${res}`)

      //依赖收集
      track(target,key)
      return isObject(res)?reactive(res):res //将递归遍历过程转移到运行时,在运行时进行套嵌情况下的拦截处理
    },
    set(target,key,value,receiver){
      //新增和更新
      const hadKey = hasOwn(target,key) //判断 ADD 或 SET
      const oldVal = target[key] //值变才更新
      const res = Reflect.set(target,key,value,receiver) //返回设置成功与否
      
      if(!hadKey){
        console.log(`新增${key}:${res}`)
        trigger(target,'ADD',key)
      }else if(oldVal !== value){
        console.log(`设置${key}:${res}`)
        trigger(target,'SET',key)
      }
      return res
    },
    deleteProperty(target,key){
      //删除
      const hadKey = hasOwn(target,key)
      const res = Reflect.deleteProperty(target,key) //返回成功成功与否
      //key存在并且删除成功才更新
      if(res && hadKey){
        console.log(`删除${key}:${res}`)
        trigger(target,'DELETE',key)
      }
      return res
    }
  })
  //双向存一下缓存
  toProxy.set(obj,observed)
  toRaw.set(observed,obj)
  return observed
}

const activeReactiveEffectStack = []
//依赖收集执行
//基本结构{target:{key:[eff1,eff2,...]}} WeakMap->Map->Set
let targetsMap = new WeakMap()
function track(target,key){
  //从栈中获取响应函数
  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length-1]
  if(effect){
    let depsMap = target.targetsMap.get(target)
    if(!depsMap){
      //首次访问target
      depsMap = new Map()
      targetsMap.set(target,depsMap)
    }
    //存放key
    let deps = depsMap.get(key)
    if(!deps){
      deps = new Set()
      depsMap.set(key,deps)
    }
    if(!deps.has(effect)){
      deps.add(effect)
    }
  }
}
function trigger(target,type,key){
  //获取依赖表
  const depsMap = targetsMap.get(target)
  if(depsMap){
    //获取响应函数集合
    const deps = depsMap.get(key)
    const effects = new Set()
    if(deps){
      //执行所有响应函数
      deps.forEach(effect=>{
        effects.add(effect)
      })
    }
    //数组新增或删除，长度会发生变化
    if(type === 'ADD' || type === 'DELETE'){
      if(Array.isArray(target)){
        const deps = depsMap.get('length')
        if(deps){
          deps.forEach(effect=>{
            effects.add(effect)
          })
        }
      }
    }
    //获取已存在的Dep Set执行，执行依赖
    effects.forEach(effect=>effect())
  }
}
function effect(fn){
//1.异常处理
//2.执行函数
//3.放置到activeReactiveEffectStack
  const rxEffect = function(...args){
    try {
      activeReactiveEffectStack.push(fn)
      return fn(...args)//执行函数触发依赖收集
    }finally{
      activeReactiveEffectStack.pop()
    }
  }
  rxEffect()//默认立即执行
  return rxEffect
}


let data = {foo:'foo',bar:{a:'aaa'},tua:[1,2]}
const react = reactive(data)
//1.获取
console.log(react.foo)
//2.设置已存在属性
react.foo = 'foooooo'
//3.设置不存在属性
react.baz = 'bazzz'
//4.嵌套对象
react.bar.a = a
//重复代理
console.log(reactive(data)=== react)
console.log(reactive(react) === react)
