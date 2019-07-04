(function ($) {
  $.fn.extend({
      "bold": function () {
          ///<summary>
          /// 加粗字体
          ///</summary>
          console.log(this[0])
          return this.css({ fontWeight: "bold" });
      },
      "validate":function (...rules){
        let items = this[0].children.length?this[0].children:this[0]
        let real_rules = rules.map(item=>{
          let ruleArr = item.rule.split('|').map(str=>{
            let arr = str.split(':')
            if(arr[0]==='min' && !Number(arr[1])){
              throw '校验格式错误'
              return
            }
            console.log(1111)
            return arr
          })
          item.parseRule = ruleArr
          return item
        })
        console.log(real_rules)
      }
  });
})(jQuery);