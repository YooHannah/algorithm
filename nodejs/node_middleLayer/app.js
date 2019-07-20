const express = require('express')
const app = express()
const router = require('./src/router/router.js')
const BodyParse= require('body-parse')
/***设置静态目录***/
app.use(express.static('./static'))
/***设置模板引擎***/
// app.engine('myviews',function(){
// 自定义模板引擎
// })
app.use(BodyParse.urlencoded({extended:true}))
app.use(BodyParse.json()) //将请求体转成对象
app.engine('art',require('express-art-template'))
app.set('views',"./src/views")
app.use('/',router)
app.listen(3300)