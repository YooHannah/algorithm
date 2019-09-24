/**
* underscore 迭代器生成/设计原理
* 使用：_().map([1,2,3],function(value,index,obj){},obj)
*/
(function(root){
	var _= function(obj){}

	_.map = function(obj,iterate,context){
		var iterate = cb(iterate,context)
		var keys = !_.isArray(obj) && Object.keys(obj)
		var length = (keys || obj).length
		var result = Array(length)

		for(var index = 0;index<length;index++){
			var currentKey = keys ?keys[index]:index
			result[index] = iterate(obj[currentKey],index,obj)
		}

		return result
	}
	//默认迭代器
	_.identity = function(value){
		return value
	}
	//生成迭代器
	var cb = function(iterate,context,count){
		if(iterate == null){
			return _.identity
		}
		if(_.isFunction(iterate)){
			return optimizeCb(iterate,context,count)
		}
	}
	//优化迭代器 返回需要不同参数的迭代器
	var optimizeCb = function(func,context,count){
		if(context == void 0){ //没有指定上下文则返回迭代函数本身
			return func
		}
		switch(count == null ?3:count){ //没有指定迭代器需要参数的个数的话，以三个要求，值，对应key,整个对象
			case 1:
				return function(value){
					return func.call(context,value)
				}
			case 3:
				return function(value,index,obj){
					return func.call(context,value,index,obj)
				}
			case 4:
				return function(memo,value,index,obj){
					return func.call(context,memo,value,index,obj)
				}
		}
	}

	root._ = _
})(this)