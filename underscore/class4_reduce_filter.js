/**
*underscore reduce filter实现原理
*/
(function(root){
	var _= function(obj){}
	var createReduce = function(dir){
		var reducer = function(obj,iteratee,memo,init){
			var keys = !_.isArray(obj)&&Object.keys(obj),
			length = (keys || obj).length
			index = dir>0?0:length-1
			if(!init){//假如没有给初始值，则把待处理数据的第一个值当做初始值，从第二个数据开始累计计算
				memo = obj[keys?keys[index]:index]
				index +=dir
			}
			for(;index>=0&&index<length;index+=dir){
				var currentKey = keys?keys[index]:index //根据传入的数据类型不同，获取KEY值的方式不同
				memo = iteratee(memo,obj[currentKey],currentKey,obj)
			}
			return memo //memo中存放累计处理的结果
		}
		return function(obj,iteratee,memo,context){
			var init = arguments.length>=3
			return reducer(obj,optimizeCb(iteratee,context,4),memo,init)
		}
	}
		
	_.reduce = createReduce(1)
	_.reduceRight = createReduce(-1)

	_.filter = function(obj,predicate,context){
		var results = []
		predicate = cb(predicate,context)
		_.each(obj,function(value,index,list){
			if(predicate(value,index,list)) results.push(value)
		})
		return results
	}
	root._ = _
})(this)