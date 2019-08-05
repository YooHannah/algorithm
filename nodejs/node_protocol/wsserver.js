/**
 * websocket node不自带
 * 可以在浏览器运行
 */
const websocket = require('ws')
const websocketServer = websocket.Server
const wss = new websocketServer({
  port:3000
})
wss.on('connection',function(ws){
  ws.send('connection')
  setTimeout(function () {
    ws.send('2秒啦')
    },2000)
  ws.on('message',function(msg){
    console.log(msg)
    ws.send('收到')
  })
})