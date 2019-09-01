/**
* underscore 链式调用原理
* 使用：_(obj).chain().unique().map().value()
*/
(function(root){
	//****** underscore 实例构造函数 
	var _= function(obj){
		if(obj instanceof _){ //本身是实例就返回本身
			return obj
		}
		if(!(this instanceof _)){ //本身不是实例（这时this 为window）以传入数据构造实例
			return new _(obj)
		}
		this._wrapped = obj//以传入数据构造 underscore实例是，将数据挂载在wrapped上面

	}
	//功能函数以静态方式直接挂载在构造函数上，只能构造函数自己调用, 会通过mixin方法挂到原型对象prototype上，供实例调用
	_.unique = function(){ 

	}
	_.map = function(obj){
		return obj
	}
	//****** 链式调用，先会调用该函数，返回重新构造的实例对象，添加chain标识
	_.chain = function(obj){
		var instance = _(obj)
		instance._chain = true
		return instance
	}
	//****** 统一处理，函数调用完是否延续链式调用，还是直接返回处理结果 
	var result = function(instance,obj){
		return instance._chain?_(obj).chain():obj
	}
	//链式调用取得最终结果
	_.prototype.value = function(){
		return this._wrapped
	}
	//获取对象key值集合
	_.function=function(obj){
		var result = []
		var key;
		for(key in obj){
			result.push(key)
		}
		return result
	}
	//
	_.isArray= function(array){
		return toString.call(array) === '[object Array]'
	}
	_.each=function(target,callback){
		var key,i=0;
		if(_.isAraay(target)){
			var length = target.length
			for(;i<length;i++){
				callback.call(target,target[i],i)
			}
		}else{
			for(key in target){
				callback.call(target,key,target[key])
			}
		}
	}
	//******** 将功能方法/API挂到原型上供实例调用
	_.mixin=function(obj){
		_.each(_.function(obj),function(name){
			var func = obj[name]
			_.prototype[name] = function(){ //挂载在原型上的方法在new创建后的对象上才能通过原型链被调用
				var args = [this._wrapped] 
				push.apply(args,arguments) //将指定数据和调用函数时传入的参数融合传入到真正的功能函数中
				return result(this,func.apply(this,args))
			}
		})
	}
	_.mixin(_)
	root._ = _
})(this)