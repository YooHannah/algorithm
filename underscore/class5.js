/**
*underscore indexOf lastindexOf实现原理
* 封装 通过将类似功能包括到工厂函数里，通过不同参数实现不同功能，优化代码
*/
(function(root){
	var _= function(obj){}
	function createIndexFinder(dir,predicateFind,sortedIndex){
		//API调用形式：_.indexOf(array,value,[isSorted])
		return function(array,item,idx){
			var i=0,
				length = array.length
			//第三个参数true用二分查找优化，否则 遍历查找
			if(sortedIndex && _.isBoolean(idx)&& length){
				//能用二分查找加速的条件
				//用_.sortedIndex 找到有序数组中 item 正好插入的位置
				idx = sortedIndex(array,item)
				return array[idx] === item?idx：-1
			}
			//特殊情况 如果查找的元素是NAN类型 NAN != NAN 应该放到上一个判断条件前，否则只会输出-1
			if(item != item){
				idx = predicateFind(slice.call(array,i,length),_.isNaN)
				return idx >=0? idx+i:-1
			}
			//非上述情况正常遍历
			for(idx = dir>0?i:length-1;idx>=0 && idx<length;idx+=dir){
				if(array[idx] === item) return idx
			}
			return -1

		}
	}
	//dir决定查找方向
	function createPredicateIndexFinder(dir){
		return function(array,predicate,context){
			predicate = cb(predicate,context)
			var length = array.length
			var index = dir>0?0:length-1
			for(;index>=0&&index<length;index+=dir){
				//找到第一个符合条件的元素，并返回下标值
				if(predicate(array[index],index,array))
					retrun index
			}
			return -1	
		}
	}
	_.isNaN = function(obj){
		return _.isNumber(obj) && obj !== obj
	}
	_.sortedIndex=function(array,obj,iteratee,context){
		iteratee = cb(iteratee,context,1)
		var value = iteratee(obj)
		var low = 0
		    high = array.length
		while(low<high){
			var mid = Math.floor((low+high)/2)
			if(iteratee(array[mid])<value)
				low = mid+1
			else
				high = mid
		}

		return low
	}

	_.findIndex = createPredicateIndexFinder(1)
	_.findLastIndex = createPredicateIndexFinder(-1)
	//_.findIndex 特殊情况下的处理方案
	//_.sortedIndex 针对排序的数组做二分查找，优化性能
	_.indexOf = createIndexFinder(1,_.findIndex,_.sortedIndex)
	_.lastIndexOf = createIndexFinder(-1,_.findLastIndex)
	root._ = _
})(this)