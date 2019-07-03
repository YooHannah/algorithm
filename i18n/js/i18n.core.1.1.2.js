(function(global,factory,plug){
  return global[plug] = factory.call(global)
})(this, function () { 
  var __LOCATES__ ={}
  var __CORE__ = {
    setEl:function(selector){
      this.__el__ = document.querySelector(selector)
      this.__lang__ = this.__el__.dataset.i18nLocate || this.__lang__;
      return this
    },
    setLocate : function (locate) { 
      this.__lang__ = locate;
      return this
    },
    get : function (locate,key) {
      if(arguments.length === 1){
        locate = this.__lang__
        key = arguments[0]
      }else{
        locate = arguments[0]
        key = arguments[1]
      }
      return (__LOCATES__[locate] && __LOCATES__[locate][key]) || ''
    },
    register : function(locate,object){//注册方言
      __LOCATES__[locate] = object ||{}
    },
    render(){
      var __this__ = this;
      var eles = this.__el__.querySelectorAll('[data-i18n-config]')
      eles.forEach((e) => {
        e.innerText = __this__.get(e.dataset.i18nConfig)
      });
    }
  }
  return __CORE__
 },"I18N")