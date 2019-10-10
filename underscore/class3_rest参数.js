/**
*underscore rest参数原理
*使用：test(count,rest){console.log(rest)}
* var restTest = _.restArguments(test)
* restTest(1,2,3,4)
*/
(function(root){
	var _= function(obj){}
	_.restArguments = function(func){
		var startIndex = func.length-1 //确定函数约定参数个数
		return function(){
			var length = argumets.length -startIndex, //需要存入rest数组的个数
			rest = Array(length),
			index = 0;
			for(;index<length;index++){
				rest[index] = argumets[index+startIndex] //把超出函数个数以后的参数全部放进rest数组中
			}
			var args = Array(startIndex+1)
			for(index = 0; index <startIndex;index++){ //重新整理函数参数供实际函数调用
				args[index] = argumets[index]
			}
			args[startIndex] = rest
			return func.apply(this,args)
		}
	}
	//Object.create 的polyfill处理
	var Ctor = function(){}
	var baseCreat = function(prototype){
		if(!_.isObject(prototype)) return {}
		if(Object.create) return Object.create(prototype)
		Ctor.prototype = prototype
		var result = new Ctor
		Ctor.prototype = null//每创建一次实例对象，把构造函数的原型对象清空掉
		return result
	}

	root._ = _
})(this)