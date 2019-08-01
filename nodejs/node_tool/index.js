#!/user/bin/env node
/** 
 * 告诉操作系统通过环境变量找到node工具，让node工具解析该文件 
 * 如果直接使用#!/user/bin/node 则是到指定目录查找工具解析该文件
*/
var cm = require('commander')
var inquirer = require('inquirer')
var getfile = require('./bin/getfile.js')
cm.version('1.0.0','-v --version') //快捷方式创建mytool -v 或者mytool --version命令，执行命令返回1.0.0
cm.command('init <name>').action(name=>{ //创建mytool init xxxxx命令 name参数就输入命令中的xxxxx
  inquirer.prompt({
    type:'input',//输入是否必填，还是选填
    name:'projectname',//输入内容的Key值
    message:'你项目的名字？'//问题内容
  }).then(function(answer) {
    console.log(answer)//如果输入23，这里则打印:{projectname:23}
    getfile(answer.projectname)
  })
})
//解析命令，保证命令可以执行
cm.parse(process.argv)