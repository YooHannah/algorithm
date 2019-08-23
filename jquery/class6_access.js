/**
 * html-text-val 作用
 * html() 用于读取和修改元素的HTML标签
 * text() 用于读取或修改元素的纯文本内容
 * css()  用于设置或返回被选元素的一个或多个样式属性
 * 
 * text(),html(),css()都是通过【jQuery.access】提供底层支持
 * jQuery.access()是一个多功能方法，作为set和get值来使用
 * 
 * 使用：
 * $('.box').text('xxxxxxxxxxx') //set
 * console.log($('.box').text()) //get
 * 
 * $('.box').css('color','red')        //set
 * console.log($('.box').css('color')) //get
 * 
 * $('.box').css({color:'#abc',font-size:'18px'})     //批量set
 * console.log($('.box').css(['color','font-size']))  //批量get
 * 
 */
(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init()
  }
  jQuery.fn = jQuery.prototype = {
    init:function(){},
    css:function () {}
  }
  //extend
  jQuery.fn.extend = jQuery.extend = function(){}
  jQuery.extend({
    /**
     * 调用jQuery.access(this,function,key,value) 参数变化可能性
     * 
     * this     NO  实例对象
     * callback NO 回调函数
     * key      yes undefined null object Array
     * value    yes undefined string
     * 
     * set 返回实例对象
     * get 返回对应的值
     */
    //参数的判断 用户想要的结果 注意：返回值的传递
    //用最少的代码做更多的事情 缺点：违背程序设计单一原则
    access:function(elems,func,key,value){ //多个API 涉及set get
      var len = elems.length
      var testing = key === null//true
      var cache,chain,name
      if(jQuery.isPlainObject(key)){ //批量set
        chain = true
        for(name in key){
          jQuery.access(elems,func,name,key[name])
        }
      }
      if(value !== undefined){
        chain = true
        if(testing){
          cache = func //缓存回调
          func = function(key,value){//重构
            cache.call(this,value)//其他的事情 扩展性
          }
        }
        for(var i=0;i<len;i++){
          func.call(elems[i],key,value)
        }
      }
      return chain ? elems:testing?func.call(elem[0]):func.call(elems[0],key,value)
    },
    content:function(elem,value){
      var nodeType = elem.nodeType
      if(nodeType ===1 || nodeType === 9 || nodeType === 11){
        elem.textContent = value
      }
    },
    text:function(elem){
      var nodeType = elem.nodeType
      if(nodeType ===1 || nodeType === 9 || nodeType === 11){
        return elem.textContent
      }
    },
    style:function(elem,key,value){
      if(!elem || elem.nodeType ===3 || elem.nodeType === 8 || elem.style){
        return 
      }
      elem.style[key] = value
    }
  })
  jQuery.fn.extend({
    text:function(value){
      return jQuery.access(this,function(value){
        //value === undefined get
        return value === undefined?jQuery.text(this):jQuery.content(this,value)
      },null,value)
    },
    css:function(key,value){
      return jQuery.access(this,function(key,value){
        var styles,len
        var map = {}
        if(jQuery.isArray(key)){
          styles = window.getComputedStyle(this,null)
          len = key.length
          for(var i=0;i<len;i++){
            map[key[i]] = styles.getPropertyValue(key[i])||undefined
          }
          return map
        }
        return value !== undefined?jQuery.style(this,key,value):window.getComputedStyle(this).getPropertyValue(key)
      },key,value)
    },
    addClass:function(value){
      var len = this.length
      var classes,elem,cur,j,clazz,i=0
      var proceed = typeof value === 'string' && value
      if(proceed){
        classes = value.match(/\S+/g) || [] //大S匹配非空格字符
        for(;i<len;i++){
          elem=this[i]
          cur = elem.nodeType === 1 && (elem.className ? (' '+elem.className +' '):' ')
          if(cur){
            j=0
            while(clazz = (classes[j++])){
              if(cur.indexOf(' '+clazz+' ')<0){
                cur+=clazz +' '
              }
            }
            elem.className = cur.trim()
          }
        }
      }
    }
  })
  root.$ = root.jQuery = jQuery
})(this);