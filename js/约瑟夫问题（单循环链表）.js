// 41个人围成一圈，依次报数，每次报到“3”数字的人自杀死亡，然后由下一个重新报数，直到所有人都自杀身亡
//用循环链表模拟约瑟夫问题，把41个人自杀的编号输出
//使用单循环链表
var list =[];
var final=[];
for(var i = 0;i<41;i++){
  var nextt = 0;
  if(i ==40){
    nextt = 0;
  }else{
    nextt = i+1;
  }
  list.push({
    data:i+1,
    next:nextt,
  })
}
temp = list[39].next;
for(var k=0;k<41;k++){
  for(var j = 0;j<2;j++){
  temp = list[temp].next;
}
final.push(list[list[temp].next].data);
list[temp].next = list[list[temp].next].next;
}
console.log(final)
// 使用双向循环链表
var list =[];
var final=[];
for(var i = 0;i<41;i++){
  var nextt = 0;
  if(i ==40){
    nextt = 0;
  }else{
    nextt = i+1;
  }
  if(i ==0){
    pree = 40;
  }else{
    pree = i-1;
  }
  list.push({
    data:i+1,
    next:nextt,
    pre:pree
  })
}
temp = list[40].next;
for(var k=0;k<41;k++){
  for(var j = 0;j<2;j++){
  temp = list[temp].next;
}
final.push(list[temp].data);

list[list[temp].pre].next = list[temp].next;
list[list[temp].next].pre = list[temp].pre;
temp = list[temp].next;
}
console.log(final)