/**
*underscore 深拷贝浅拷贝
*/
(function(root){
	var _= function(obj){}
	_.isArray = function (array) {
    return toString.call(array) === "[object Array]"
  }
  _.isObject = function(obj){
    return typeof obj === 'object'
  }
  _.isFunction = function (func) {
    return toString.call(func) === "[object Function]"
  }
  _.map = function (obj,iterate,context) { 
    //生成不同功能迭代器
    var iterate = cb(iterate,context)
    //分辨obj是数组对象，还是object对象
		var keys = !_.isArray(obj) && Object.keys(obj)
		var length = (keys || obj).length
		var result = Array(length)

		for(var index = 0;index<length;index++){
			var currentKey = keys ?keys[index]:index
			result[index] = iterate(obj[currentKey],index,obj)
		}

		return result
  }
  //浅拷贝
  _.clone = function(obj){
    if(!_.isObject(obj)){
      return obj
    }
    return _.isArray(obj)?obj.slice():_.extend({},obj)
  }
  //深拷贝
  _.deepClone = function (obj) { 
    if(_.isArray(obj)){
      return _.map(obj,function(elem){ //回调->迭代器函数
        return _.isArray(elem) || _.isObject(elem)?_.deepClone(elem):elem
      })
    }else if(_.isObject(obj)){
      return _.reduce(obj,function(memo,value,key){
        memo[key] = _.isArray(value) || _.isObject(value)?_.deepClone(value):value
        return memo
      },{})
    }else{
      return obj
    }
  }
  //过滤白名单
  /**
   * 
   * 应用
   * var ret = _.pick({
   *   name:'max',
   *   age:'30',
   *   userId:'xx'
   * },function(value,key,object){
   *    return _isNumber(value)
   * })                             ======>{age:30}
   * 
   * var ret1 = _.pick({ 
   *   name:'max',
   *   age:'30',
   *   userId:'xx'
   * },'name')                      ======>{name:'max'}
   */
  _.pick = function(object,oiteratee,context){
    var result = {}
    var iteratee,keys
    if(object == null){
      return result
    }
    if(_isFunction(oiteratee)){
      iteratee = optimizeCb(oiteratee,context)
    }else{
      keys = [].slice.call(arguments,1)
      iteratee = function(value,key,object){ //自定义过滤器，用于过滤指定属性key的值
        return key in object
      }
    }
    for(var i =0;i<keys.length;i++){
      var key = keys[i]
      var value = object[key]
      if(iteratee(value,key,object)){
        result[key] = value
      }
    }
    return result
  }
	root._ = _
})(this)