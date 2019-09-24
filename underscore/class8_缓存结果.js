/**
*underscore 对于数组的一些处理
*/
(function(root){
	var _= function(obj){}

	_.identity = function(value){
		return value
	}
  _.filter = function(obj,predicate,context){
		var results = []
		predicate = cb(predicate,context)
		_.each(obj,function(value,index,list){
			if(predicate(value,index,list)) results.push(value)
		})
		return results
  }
  //******去掉数组中的假值，利用filter的if(predicate(value,index,list))语句的隐式转换，过滤掉值为假的
  _.compact = function(array){
    return _.filter(array,_.identity)
  }


 //******返回一个某范围内的数值组成的数组
  _.range = function(start,stop,step){
    if(stop==null){ //传一个参数时表示从0到改参数，步长1的数组
      stop = start || 0
      start = 0
    }
    step = step || 1 //步长不设置，默认为1
    //返回数组的长度 返回大于等于参数X的最小整数 向上取整
    var length = Math.max(Math.ceil((stop-start)/step),0)
    var range = Array(length)
    for(var index = 0;index<length;index++,start+=step){
      range[index] = start
    }
    return range
  }

  //******数组去重 通过配置不同参数，进行不同处理结果
  _.uniq = _.unique = function(array,isSorted,iteratee,context){
    if(!_.isBloolean(isSorted)){
      context = iteratee
      iteratee = isSorted
      isSorted = false
    }
    //如果有迭代函数
    if(iteratee != null){
      iteratee = cb(iteratee,context)
    }
    var result = []
    //用来过滤重复值
    var seen
    for(var i= 0;i<array.length;i++){
      var computed = iteratee?iteratee(value,i,array):array[i]
      //如果是有序数组，则当前元素只需跟上一个元素对比即可
      //用seen变量保存上一个元素
      if(isSorted){
        if(!i || seen !== computed){
          result.push(computed)
        }
        seen = computed
      }else if (result.indexOf(computed) === -1){ //非有序数组一个一个比较
        result.push(computed)
      }
    }
    return result
  }

  //*******返回一个函数的副本  又叫偏函数
  _.partial = function (func) {
    //提取参数
    var args = [].slice.call(arguments,1)
    var bound = function(){
      var index = 0
      var length = args.length
      var ret = Array(length)
      for(var i = 0;i<length;i++){
        ret[i] = args[i]
      }
      while(index <arguments.length){
        ret.push(argument[index++])
      }
      return func.apply(this,ret)
    }
    return bound
  }

  //*******缓存函数计算的结果
  _.memoize = function(func,hasher){
    var memoize = function(key){
      var cache = memoize.cache;
      //求key 
      //如果传入了haser,则用haser函数记录key
      //否则用参数key(即memoize 方法传入的第一个参数)当key
      var address = '' +(hasher?hasher.apply(this,arguments):key)
      //如果这个key还没有被求过值，先记录在缓存中
      if(!_.has(cache,address)){
        cache[address] = func.apply(this,arguments)
      }
      return cache[address]
    }
    //cache 对象被当作key-value 键值对缓存中间运算结果
    memoize.cache = {}
    return memoize
  }

  //******** 延迟执行函数
  _.delay = function(func,wait){
    var args = [].slice.call(arguments,2) //整理参数，提高API健壮性，用户可以输入任意个数参数
    return setTimeout(function(){
      func.apply(null,args)
    },wait)
  }

  //******* 字符串逃逸 不安全的字符 变成字符串的实体
  var escapeMap = {
    '&':'&amp',
    '<':'&lt',
    '>':'&gt',
    '"':'&quot',
    "'":'&#x27',
    '`':'&#x60'
  }
  var creatEscaper = function(map){
    var source = "(?:"+Object.keys(map).join('|')+')'
    var testExp = new RegExp(source,"g")
    var replace = function(match){
      return map[match]
    }
    return function(string){
      return testExp.test(string)?string.replace(testExp,replace):string
    }
  }
  _.escape = creatEscaper(escapeMap)


 //***** 1.依次调用 倒叙 2.上一次执行函数返回值 传递给下一个要执行的函数
  _.compose = function(){
    var args = arguments
    var end = args.length -1
    return function() {
      var i = end
      var result = args[i].apply(null,arguments)
      while(i--){
        result = args[i].call(null,result)
      }
      return result
    }
  }

  /***react 中函数组合 */

  function compose(){
    var _len = arguments.length
    var funcs = []
    for(var i=0;i<_len;i++){
      funcs[i] = arguments[i]
    }
    if(funcs.length === 0){
      return function(arg){
        return arg
      }
    }
    if(funcs.length === 1){
      return funcs[0]
    }
    return funcs.reduce(function(a,b) {
      return function(){
        return a(b.apply(undefined,arguments))
      }
    })
  }

	root._ = _
})(this)