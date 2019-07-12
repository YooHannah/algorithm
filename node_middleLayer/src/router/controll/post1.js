function index(req,res) {
  res.json({
    status:200,
    mes:'this a is'+req.body.a
  })
}
module.exports= index