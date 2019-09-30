/**
* underscore 模板引擎template原理
* 应用
*<script type="text/template" id='tpl'>
*<ul class="list">
*  <%obj.forEach(function(e,i,a){%>
*    <% if(i===0){%>
*      <li class="last-item"><%=e.name%></li>
*    <% }else{%>
*      <li><%=e.name%></li>
*    <%}})%>
*</ul>
*</script>
* var data = [{name:'x1'},{name:'x2'},{name:'x3'}]
* var templateString = doucment.getElementById('tpl').innerHTML
* var compiled = _.template(templateString) //解析
* var renderString = compiled(data) //数据交互 render 渲染
* document.querySelector("div").innerHTML = renderString
*/
(function(root){
	var _= function(obj){}

  _.template = function(templateString,settings){
    //默认规则
    var RULES = {
      interpolate:/<%=([\s\S]+?)%>/g, //插入变量规则
      escape:/<%-([\s\S]+?)%>/g,      //插入HTML转义
      expression:/<%([\s\S]+?)%>/g,   //执行任意JS代码
    }
    settings = _.extend({},RULES,settings)//参数settings传入自定义插入规则
    
    //解析
    var matcher = new RegExp([
      settings.interpolate.source, //正则表达式source属性返回表示字符串形式
      settings.escape.source,
      settings.expression.source,
    ].join('|'),'g')

    //开始用字符串拼接渲染函数,因为拿到的模板中的Js部分是字符串
    var source = "_p+='"
    var index = 0
    templateString.replace(matcher,function(match,interpolate,escape,expression,offset){
      //matcher是匹配规则，match是匹配到的内容，interpolate,escape,expression是三个正则匹配到的内容，offset 是匹配到的内容的开始位置 
      source += templateString.slice(index,offset).replace(/\n/g,function(){
        return "\\n"
      })
      index = offset + match.length;
      if(interpolate){
        source += "'+\n ((_t=("+interpolate+")) == null?'':_t)+\n'"
      }else if(escape){

      }else if(expression){
        source +="';\n"+expression+"\n_p+='"
      }
    })
    source += "';"
    source = "\nwith(obj){\n" + source + "}\n"
    //渲染函数 字符串
    source = "var _t,_p='';" + source +"return _p;\n";
    console.log(source)
    //data 传参的问题 预编译
    var render = new Function('obj',source); //**********************生成编译函数 */
    console.log(render)
    var template = function(data){
      return render.call(null,data)
    }
    return template
  }
	root._ = _
})(this)