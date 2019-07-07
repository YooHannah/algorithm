(function ($) {
  $.fn.extend({
      "validate":function (...rules){
        let items = this[0].children.length?this[0].children:this[0] //可以单独给一个input配置，也可以给form中多个input配置
        let real_rules = []
        let rulesLength = rules.length
        let defaultCSS = "color:red;font-size:12px;padding-top: 5px;"
        //公共添加提示函数
        let addInfo = (el,config,info)=>{
          let classFlag = config.name+'_flag'
          if($('.'+classFlag).length){return}
          let css = defaultCSS + (config.style?config.style:'')
          el.css({border:'1px solid red'})
          let requiredClassFlag = config.name+'_required_flag'
          let requiredEl = $('.'+requiredClassFlag)
          if(requiredEl.length){//如果有必填*，则放在*后面，
            requiredEl.after("<div class='"+classFlag+"' style='"+css+"'>"+config.label+info+"</div>")
          }else{//否则直接放在input后面
            el.after("<div class='"+classFlag+"' style='"+css+"'>"+config.label+info+"</div>")
          }
          return false
        }
        let ruleFunc = {
          'required':(e)=>{
            let {rule,config} = e.data
            if(rule!= undefined && rule != 'true' &&  rule != 'false'){
              throw 'the format that your configuration about REQUIRED was wrong!'
              return false
            }
            if((rule === undefined || !!rule ) && !e.target.value){
              return addInfo($(e.target),config,'不能为空')
            }
            return true
          },
          'min':(e)=>{
            let {rule,config} = e.data
            rule = Number(rule)
            if(isNaN(rule)){
              throw 'the format that your configuration about MIN was wrong!'
              return false
            }
            if(e.target.value.length<rule){
              return addInfo($(e.target),config,'长度不能少于'+rule)
            }
             return true
          },
          'max':(e)=>{
            let {rule,config} = e.data
            rule = Number(rule)
            if(isNaN(rule)){
              throw 'the format that your configuration about MAX was wrong!'
              return false
            }
            if(e.target.value.length>rule){
              return addInfo($(e.target),config,'长度不能大于'+rule)
            }
             return true
          },
          'IDcard':(e)=>{
            let {rule,config} = e.data
            if(rule!= undefined && !/^\/.+\/ig?$/.test(rule)){
              throw 'the format that your configuration about IDcard was wrong!'
              return false
            }
            //不配置规则的话，使用默认规则
            rule = rule || /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
            if(e.target.value&&!rule.test(e.target.value)){
              return addInfo($(e.target),config,'不符合中国大陆现有身份证号码')
            }
             return true
          },
          'mobilePhone':(e)=>{
            let {rule,config} = e.data
            if(rule!= undefined && !/^\/.+\/ig?$/.test(rule)){
              throw 'the format that your configuration about MobilePhone was wrong!'
              return false
            }
            rule = rule || /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/
            if(e.target.value&&!rule.test(e.target.value)){
              return addInfo($(e.target),config,'不符合中国大陆现有手机号码')
            }
             return true
          },
          'email':(e)=>{
            let {rule,config} = e.data
            if(rule!= undefined && !/^\/.+\/ig?$/.test(rule)){
              throw 'the format that your configuration about MobilePhone was wrong!'
              return false
            }
            rule = rule || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            if(e.target.value && !rule.test(e.target.value)){
              return addInfo($(e.target),config,'不存在')
            }
             return true
          }
        }
        //循环绑定触发事件
        for(let i=0;i<rules.length;i++){ 
          let el = $("input[name='" + rules[i].name+"']")
          let event = rules[i].defaultEvent || 'blur'//默认失焦事件
          let classFlag = rules[i].name+'_flag'
          let itemRules = rules[i].rule.split('|')
          let ruleLength = itemRules.length
          el.bind('focus','',function(e){
             if($('.'+classFlag).length){
              $(e.target).css('outline','none')
             }
          })
          el.bind(event,'',function(e){//执行校验前，移除已存在提示
            $('.'+classFlag).remove()
            $(e.target).css('border','')
          })
          for(let j=0;j<ruleLength;j++){
            let [key,value] = itemRules[j].split(':')
            if(!ruleFunc[key]){
              throw "sorry,this plugin don't surpport this keyword :" + key+" now!" 
              return false
            }
            if(key === 'required' && (!!value || value === undefined)){ //给必填项加'*'
              let requiredClassFlag = rules[i].name+'_required_flag'
              el.after("<span style='color:red;margin-left: 5px;' class='"+requiredClassFlag+"'>*</span>")
            }
            el.bind(event,{rule:value,config:rules[i]},ruleFunc[key]) //绑定事件
          }
        }
        function validateFuc(){
          let arr = 0
          for(let i=0;i<rules.length;i++){
            let el = $("input[name='" + rules[i].name+"']")
            let event = rules[i].defaultEvent || 'blur'
            let classFlag = rules[i].name+'_flag'
            el.trigger(event)
            if($('.'+classFlag).length){
              arr++
            }
          }
          return !!arr
        }
        return validateFuc //返回手动校验函数，用于提交时校验
      }
  });
})(jQuery);