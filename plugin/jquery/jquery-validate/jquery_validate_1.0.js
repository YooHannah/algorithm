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
        let ruleFunc = {
          'max':(e)=>{
            let config = e.data.config
            if(isNaN(Number(config))){
              throw 'the format that your configuration about MAX was wrong!'
              return false
            }
            return true
          },
          'min':(e)=>{
            let config = e.data.config
            
            if(isNaN(Number(config))){
              throw 'the format that your configuration about MIN was wrong!'
              return false
            }
            return true
          },
          'required':(e)=>{
            let config = e.data.config
            console.log(e.target.value)
            if(config != 'true' &&  config != 'false'){
              throw 'the format that your configuration about REQUIRED was wrong!'
              return false
            }
          },
        }
        let addInfo = ()=>{

        }
        for(let i=0;i<rules.length;i++){
          let itemRules = rules[i].rule.split('|')
          let ruleLength = itemRules.length
          for(let j=0;j<ruleLength;j++){
            let [key,config] = itemRules[j].split(':')
            if(!ruleFunc[key]){
              throw "sorry,this plugin don't surpport this keyword :" + key+" now!" 
              return false
            }
            let el = $("input[name='" + rules[i].name+"']")
            let event = rules[i].defaultEvent || 'blur'
            el.bind(event,{config:config},ruleFunc[key])
          }
        }
      }
  });
})(jQuery);