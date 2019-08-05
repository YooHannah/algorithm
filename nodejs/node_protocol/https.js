/**
 * 生成私有证书
 * 新建keys文件夹
 * cmd 执行命令
 * openssl genrsa 1024 >./keys/private.pem  //生成私钥
 * openssl req -new -key /path/to/private.pem -out csr.pem //根据私钥生成公钥
 * openssl x509 -days 365 -in csr.pem -signkey private.pem -out file.crt //根据公钥和私钥生成证书
 */
const https=require('https')
const fs = require('fs')
var option={
  key:fs.readlinkSync('./keys/private.pem'),
  cert:fs.readlinkSync('./keys/file.crt'),
}
https.createServer(option,function(req,res){
  res.end('Hello world')
}).listen(3000)