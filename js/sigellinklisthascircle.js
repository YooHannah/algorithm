var list =[];
for(var i = 0;i<5;i++){
  list.push({
    next:i+1,
  });
}
list[4].next= 3;
//比较步数 for循环
function hascircle(list){
for( var p=0,count1=0;p!=null;count1++,p=list[p].next){
   for(var q=0,count2=0;q!=null;q=list[q].next,count2++){
      if(p==q){
        if(count1==count2){
          break;
        }else{
          console.log("环的位置:"+count2);
          return 1;//有环
        }
      }
    }
  }
  //比较步数 while循环
  var p=0,count1=0;
  while(p!=null){
    var q=0,count2=0;
    while(q!=null){
      if(p==q){
        if(count1==count2){
          break;
        }else{
          console.log("环的位置"+count2);
          return 1;//有环
        }
      }
      q=list[q].next;
      count2++;
    }
    p=list[p].next;
    count1++;
  }
  //快慢指针
  var p=0,q=0;
  while(p!=null&&q!=null&&list[q].next!=null){
    p=list[p].next;
    if(list[q].next!=null){
      q = list[list[q].next].next;
    }
    if(p==q)
      return 1;//有环
  }
   return 0;//无环
}
console.log(hascircle(list));