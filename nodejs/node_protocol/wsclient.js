var ws = new WebSocket('ws://localhost:3000')
ws.onmessage= function(message){
  console.log(message)
}
setTimeout(function(){
  ws.send('hello')
},4000)