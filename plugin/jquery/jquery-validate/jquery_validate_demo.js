(function(root,plug){
  var RULES = {
    'email':function () { return /^/.test(this.val())  }
  }
  $.fn[plug] = function (settings) { 
    if(!this.is("form")){return}
    //默认配置
    var __def__ ={
      initEvent:'input', //可以自定义触发事件
      sign:'dv',//可以自定义配置规则
      error:"* 输入不合法，请认真检查"//可以自定义提示语
    }
    //以默认为优先，以用户配置为覆盖
    var ret = $.extend({},__def__,settings)
    var keynote = this.find("input")
    var e
    keynote.on(ret.initEvent,function () { 
      var _this = $(this) //保存触发事件的DOM
      _this.next('span').remove()
      $.each(RULES,function(key,func){
        var configName = _this.data(__def__.sign+'-'+key) //通过在HTML标签上设置data-dv-email = true验证email规则 email 是RULES的KEY值
        if(configName){
          var result = func.call(_this)
          if(!result){
            e = _this.data(__def__.sign+"-"+key+"-error") ||__def__.error ////通过在HTML标签上设置data-dv-email-error = 'xxx'自定义提示语
            _this.after("<span style='color:red;line-height:30px'>"+e+"</span>")
          }
        }
      })
     })
   }
   //增强功能，自定义校验规则 $.fn.validate.expand({xx:function(){return '校验结果'}})
   $.fn[plug]['expand'] = function(options){
    $.extend(RULES,OPTIONS)
   }
})(this,'validate')