/**
*underscore flatten算法实现原理
*/
(function(root){
	var _= function(obj){}

	//******摊平数组
	var flatten = function(array,shallow){
		var ret = []
		var index = 0
		for(var i = 0;i<array.length;i++){
			var value = array[i]
			if(_.isArray(value)||_.isArguments(value)){
				//递归全部展开
				if(！shallow){
					value = flatten(value,shallow)
				}
				var j=0,len = value.length
				ret.length +=len
				while(j<len){
					ret[index++]= value[j++]
				}
			}else{
				ret[index++] = value
			}
		}
		return ret
	}
	_.flatten = function(array,shallow){
		return flatten(array,shallow)
	}
	//******返回数组中，除了最后一个元素外的其他全部元素，在arguments对象上特别有用
	_.initial = function(array,n){
		return [].slice.call(array,0,Math.max(0,array.length-(n==null?1:n)))
	}

	//******返回数组中除了第一个元素外的其他全部元素，传递n参数将返回从n开始的剩余所有元素
	_.rest = function(array,n,guard){
		return [].slice.call(array,n==null?1:n)
	}
	root._ = _
})(this)