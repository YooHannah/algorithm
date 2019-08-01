/**命令工具核心文件 */
var fs = require('fs')
module.exports = function(name){
  var output = "c:/Users/Administrator/Desktop/"+name;//项目创建的路径加名称
  fs.readdir('./project',function(err,files){ //从指定目录下载模板文件到项目文件夹，这里是本地文件复制
    fs.mkdir(output,function(){
      if(err){
        return console.log(err)
      }
      for(var i=0;i<files.length;i++){
        var stat = fs.lstatSync('./project/'+files[i])
        if(stat.isDirectory()){
          fs.mkdir(output+'/'+files[i],function(){})
        }else{
          //同步读取文件内容
          // var data = fs.readFileSync('./project/'+files[i])
          // fs.writeFileSync(output+'/'+files[i])
          //异步读取文件内容
          (function(filename){
            fs.readFile('./project/'+file[i],function(err,data){
              fs.writeFile(output+'/'+filename,data,function(){})
            })
          })(files[i])//闭包处理，保障异步回调获取到该轮循环到的文件名
        }
      }
    })
  })
}