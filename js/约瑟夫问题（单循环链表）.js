// 41个人围成一圈，依次报数，每次报到“3”数字的人自杀死亡，然后由下一个重新报数，直到所有人都自杀身亡
//用循环链表模拟约瑟夫问题，把41个人自杀的编号输出
var list =[];
var final=[];
for(var i = 0;i<10;i++){
  var nextt = 0;
  if(i ==9){
    nextt = 1;
  }else{
    nextt = i+2;
  }
  list.push({
    data:i+1,
    next:nextt
  })
}
temp = list[9].next;
for(var k=0;k<7;k++){
  for(var j = 0;j<2;j++){
  temp = list[temp].data;
}
final.push(temp);
console.log(final)
list[temp-2].next = list[temp-1].next;
// console.log(list[temp].data)
if(list[temp].data==10){
  temp = 0;
}else{
  temp = list[temp].data;
}
}