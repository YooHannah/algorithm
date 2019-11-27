let fs = require('fs')
let arguments = process.argv.splice(2);
let path = arguments[0] //通过命令行获取要统计的目录 例："E:/vue/web/src"
let fileType = arguments[1]//过滤具体文件类型
function getFileList(path){
  let files = fs.readdirSync(path) //同步读取文件夹目录,返回该级目录数组，按照字母排序
  let filesObjs = []
  for(let i = 0;i<files.length;i++){
    let childrenPath = path+'/'+files[i]
    let states = fs.statSync(childrenPath) //获取该路径对应文件/文件夹信息
    if(states.isDirectory()){
      filesObjs = filesObjs.concat(getFileList(childrenPath))
    }else{
      let index = files[i].lastIndexOf('.')
      let suffix = files[i].substr(index+1)
      if(!fileType || fileType === suffix){
        filesObjs.push({
          name:files[i],
          size:+((states.size / 1024).toFixed(2)), //转成KB大小
          path:childrenPath
        })
      } 
    }
  }
  return filesObjs.sort(function(a,b){ //对读到的文件进行排序
    return a.size>b.size?-1:(a.size<b.size?1:0)
  })
}
function writeToTxt(fileName,data){
  let str = ''
  let SIZE = 0
  data.map(item=>{
    var desc = "文件名:" + item.name + " "
        + "大小:" + item.size + "/kb" + " "
        + "路径:" + item.path;
    str += desc + "\n"
    SIZE += item.size
  })
  fs.writeFile(fileName, str, 'utf-8', function(){
    console.log('统计完毕，文件总数为：'+data.length,'整体大小为：'+SIZE+'KB')
  });
}

writeToTxt('result.txt',getFileList(path))
