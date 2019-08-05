var net = require('net')
var client = net.Socket()
client.connect(3300,'127.0.0.1',function(){
  setInterval(function(){
    client.write('攻击BOSS')
  },1000)
})
client.on('data',function(data){
  console.log(data.toString())
})