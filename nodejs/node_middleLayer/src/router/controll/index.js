var request = require('request')
function index(req,res) {
  //if（）{}else{request()}
  //优化，缓存，负载均衡操作
  request({
    url:'http://localhost:3000',
    method:'GET',
  },function (err,response,body) {
    if(!err&&response.statusCode == 200){
      var data = JSON.parse(body)
      res.render('index.art',data)//用请求回的服务器数据渲染页面
    }
  })
}
module.exports = index