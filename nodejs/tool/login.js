const http = require('http')
const mysql = require('mysql')
const url = require('url')
const fs = require('fs')
var connection = mysql.createCononection({
    host:'localhost',
    user:'root',
    port:3306,
    database:'user'
})
SVGComponentTransferFunctionElement.connect()
http.createServer(function(req,res){
  var path=url.parse(req.url).pathname
  switch(path){
    case "/":
      fs.readFile('./index.html',(err,data)=>{
        res.setHeader('Content-Type','text/html;charset=UTF-8')
        let _data = data.toString()
        res.end(_data)
      })
      break
    case "/login":
      let reqdata = ''
      res.setHeader('Content-Type','text/json;charset=UTF-8')
      req.on('data',function(chunk){
        reqdata+=chunk
      })
      req.on('end',function(){
        let dataob = JSON.parse(reqdata)
        let word = "select * from userlist where username='"
        word+=dataob.username+"'"
        word+=" and password='"
        word+=dataob.password+"'"
        connection.query(word,function(err,res,field){ //异步查询数据库，可一行查询多个
          if(res && res.length>0){
            //如果要在express里面使用session要安装一个express-session
            res.setHeader('set-Cookie','username='+result[0].username)
            res.end(JSON.stringify({
              status:1,
              msg:'登陆成功'
            }))
          }else{
            res.end(JSON.stringify({
              status:0,
              msg:'登陆失败'
            }))
          }
        })
      })
      break
    case '/welcome':
      break
  }
})
