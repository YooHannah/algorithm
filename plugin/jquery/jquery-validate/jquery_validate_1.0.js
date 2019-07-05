(function ($) {
  $.fn.extend({
      "bold": function () {
          ///<summary>
          /// 加粗字体
          ///</summary>
          return this.css({ fontWeight: "bold" });
      },
      "validate":function (...rules){
        let items = this[0].children.length?this[0].children:this[0]
        let real_rules = []
        let rulesLength = rules.length
        let defaultCSS = "color:red;font-size:12px;padding-top: 5px;"
        let addInfo = (el,config,info)=>{
          let css = defaultCSS + (config.style?config.style:'')
          el.css({border:'1px solid red'})
          el.after("<div style='"+css+"'>"+config.label+info+"</div>")
        }
        let ruleFunc = {
          'max':(e)=>{
            let {rule,config} = e.data
            rule = Number(rule)
            if(isNaN(rule)){
              throw 'the format that your configuration about MAX was wrong!'
              return false
            }
            if(e.target.value.length>rule){
              addInfo($(e.target),config,'长度不能大于'+rule)
            }
          },
          'min':(e)=>{
            let {rule,config} = e.data
            rule = Number(rule)
            if(isNaN(rule)){
              throw 'the format that your configuration about MIN was wrong!'
              return false
            }
            if(e.target.value.length<rule){
              addInfo($(e.target),config,'长度不能少于'+rule)
            }
          },
          'required':(e)=>{
            let {rule,config} = e.data
            if(rule != 'true' &&  rule != 'false'){
              throw 'the format that your configuration about REQUIRED was wrong!'
              return false
            }
            if(!!rule && !e.target.value){
              addInfo($(e.target),config,'不能为空')
            }
          },
        }
        
        for(let i=0;i<rules.length;i++){
          let itemRules = rules[i].rule.split('|')
          let ruleLength = itemRules.length
          for(let j=0;j<ruleLength;j++){
            let [key,value] = itemRules[j].split(':')
            if(!ruleFunc[key]){
              throw "sorry,this plugin don't surpport this keyword :" + key+" now!" 
              return false
            }
            let el = $("input[name='" + rules[i].name+"']")
            // if(key === 'required' && (!!value || value === undefined)){ //给必填项加'*'
            //   el.after("<span style='color:red;margin-left: 5px;'>*</span>")
            // }
            let event = rules[i].defaultEvent || 'blur'//默认失焦事件
            el.bind(event,{rule:value,config:rules[i]},ruleFunc[key]) //绑定事件
          }
        }
      }
  });
})(jQuery);