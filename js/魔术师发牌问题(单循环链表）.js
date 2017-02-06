//魔术师手中有A到K一共13张牌,魔术师将牌排好顺序，能够呈现以下效果：
//数n个数，将数到n之前的牌依次放在牌的最低端，
//将数到n的牌翻过来放在桌子上，这张牌上的数字正好为n
var list =[];
for(var i = 0;i<13;i++){
  list.push({
    next:i+1,
    data:0
  });
}
list[12].next = 0;
var p = 0;
list[p].data = 1;
var countnumber = 2;
while(1){
  for(var i =0;i<countnumber;i++){
    p=list[p].next;
    if(list[p].data!=0){
      i--;
    }

  }
  if(list[p].data === 0){
    list[p].data = countnumber;
    countnumber++;
    if(countnumber == 14){
      break;
    }
  }
}
var list1 =[];
for(var i = 0;i<13;i++){
  list1.push(list[i].data);
}
console.log(list1);