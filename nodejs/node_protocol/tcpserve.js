const net = require('net')
var server = net.createServer(function(Socket){
  //此回调连接建立时调用
  console.log('someone connect')
})
//设置监听--connection
server.on('connection',function(Socket){
  //Socket端口，后面与客户端的交互都是通过Socket
  Socket.write('游戏登陆成功') //向客户端发消息
  Socket.on('data',function () {//接收客户端消息
    Socket.write('打掉了BOSS'+Math.random()*100+'点血');
  })
})
server.on('close',function(){

})
server.on('error',function(){

})
server.listen(3300)