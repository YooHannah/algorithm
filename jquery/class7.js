/**
 * 字符串来源
 * 1：用户的输入（校验手机号码 邮箱 密码） 正则模式 固定
 * 2：定义代码块（模块 模板） 批量的替换||查找||检测扫描 正则规则会变化
 * 3：cookie || url 正则规则会变化
 * 
 * \b 边界符 【字母 数字 下划线】
 * [] 字符的范围
 * \1 反向引用 以子表达式开始，以子表达式结束
 * 例 /\brequire\((["'])(.+)\1\)/g.exec("var b = require('./a.js')")
 */

/** vue 模板字符串扫描*/
var template = '<div>{{name}}</div>'
//标签规则
var ncname = '[a-zA-Z]'
var qnamecapture = '('+ncname+')'
//匹配开始标签
var startTagOpen = new RegExp('^<'+qnamecapture)
//匹配结束标签
//vue 编译器 词法分析 parseHTML
function parseHTML(html){
  var index = 0 //切割起点
  while(html){//死循环 html 切割 直到
    var startTagMatch = parseStartTag() //开始标签 父标签
    console.log(html) //>{{name}}</div>
    break
  }
  parseStartTag()
  function parseStartTag(){
    var start = html.match(startTagOpen) //token 词 单元
    if(start){
      var match={
        tagName:start[1],//名称
        attrs:[],//属性+指令
        start:index//子标签
      }
      advance(start[0].length)
    }
    return match
  }
  function advance(n){
    index +=n
    html = html.substring(n)
  }
  //继续扫描 属性 指令 ui结构 检测是否标签完整闭合 是否是组件
  parseHTML(template)
}