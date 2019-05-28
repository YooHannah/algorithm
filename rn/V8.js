function getMB(){
  var mem = process.memoryUsage()
  var format = function(bytes){
    return (bytes/1024/1024).toFixed(2)+'MB'
  }
  console.log('heapTotal:'+format(mem.heapTotal)+'      heapUsed:'+format(mem.heapUsed))
}
let b = []
  for (let index = 0; index < 1024*1024; index++) {
    b.push(index)
  }
let a = ()=>{
  // let b = new Array(1024*1024)
  // let b = 123
  let bb = b
  
  return bb
}
// a()
let w = a()
let d = a()
let e = a()
let f = a()
let g = a()
let h = a()
let i = a()
let j = a()
let k = a()
let l = a()
let m = a()
let n = a()
let o = a()
let p = a()
let q = a()
console.log(d===e)
getMB()