//模拟后台服务器，给与数据
const express = require('express')
const app = express()
app.get('/',function (req,res) {
  res.json({
    status:200,
    arr:[{title:1,content:'content1'},{title:2,content:'content2'}]
  })
})
app.listen(3000)