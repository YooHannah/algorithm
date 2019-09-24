/**
*underscore 对object对象的一些处理
*/
var _ = {}
_.isObject = function(obj){
  return toString.call(obj) === "[object Object]"
}
//属性检测
var hasOwnProperty = Object.hasOwnProperty
_.has = function (obj,key) {
  return obj != null && hasOwnProperty.call(obj,key)
}
//propertyisEnumerable()方法返回一个布尔值，表示指定的属性是否可枚举
//检测浏览器是否有将自定义的toString属性(与原型上不可枚举属性同名的属性)设置成可枚举的，是，返回true,否则返回false，
//返回false的情况是需要兼容的
var hasEnumbug = ({toString:null}).propertyIsEnumerable('toString') 
var collect = ['constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf']
//Object.keys polyfill
_.keys = function (obj) {
  var prop;
  if(!_.isObject(obj)){
    return []
  }
  if(Object.keys){
    return Object.keys(obj) //仅返回自身属性
  }
   var result = []
   //遍历自身 + 原型链上面的可枚举属性
   for(name in obj){
     result.push(name)
   }
   if(!hasEnumbug){
    for(var i=0;i<collect.length;i++){
      prop = collect[i]
      if(obj[prop] !== Object.prototype[prop]){ //把自定义的同原型上同名的属性push进去
        result.push(prop)
      }
    }
   }
   return result
}
_.Allkeys = function(obj){
  var prop;
  if(!_.isObject(obj)){
    return []
  }
   //遍历自身 + 原型链上面的可枚举属性
  for(name in obj){
    result.push(name)
  }
  return result
}
//key <=> value 值和key 对调
_.invert = function(obj){
  var result = {}
  var keys = _.keys(obj)
  for(var i = 0; i<keys.length;i++){
    result[obj[keys[i]]] = keys[i]
  }
  return result
}
var createAssigner = function(func){
  return function(obj){
    var length = arguments.length
    if(obj == null || length<2){
      return obj
    }
    for(i=1;i<length;i++){
      var target = arguments[i]
      var keys = func(target)
      var len = keys.length
      for(var j=0;j<len;j++){
        obj[keys[j]] = target[keys[j]]
      }
    }
    return obj
  }
}
//解耦 颗粒度小
_.extend = createAssigner(_.Allkeys) //自身对象可枚举属性 + 原型链上可枚举属性
_.extendOwn = createAssigner(_.leys) //自身对象可枚举属性