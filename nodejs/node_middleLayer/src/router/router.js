var express = require('express')
var router = express.Router()
var index = require('./controll/index.js')
var post1 = require('./controll/post1.js')
router.get('/',index)
router.post("/post1",post1)
module.exports = router