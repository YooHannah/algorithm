/**
*underscore 乱序数组|洗牌算法实现原理
*/
(function(root){
	var _= function(obj){}
	
	//返回一个【min,max】范围内的任意整数
	_.random = function(min,max){
		if(max == null){
			max = min
			min = 0
		}
		return min +Math.floor(Math.random()*(max-min+1))
	}
	_.clone = function(obj){
		return _.isArray(obj)?obj.slice():_.extend({},obj)
	}
	//******抽样函数
	_.sample = function(array,n){
		if(n==null){
			return array[_random(array.length-1)]
		}
		var sample = _.clone(array)
		var length = sample.length
		var last = length-1
		n = Math.max(Math.min(n,length),0)
		for(var index = 0;index<n;index++){
			var rand = _random(index,last) //产生index以后的随机位，与index交换正常位，取出前n位
			var temp = sample[index]
			sample[index] = sample[rand]
			sample[rand] = temp
		}
		return sample.slice(0,n)
	}

	//******返回乱序之后的数组副本
	_.shuffle = function(array){
		return _.sample(array,Infinity) //Infinity,借助sample函数逻辑返回整个数组
	}
	root._ = _
})(this)