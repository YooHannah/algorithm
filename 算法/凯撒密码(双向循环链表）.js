var twowaylinkedlist =[];
var i
for(i =0;i<26;i++){
  var pre = 0;
  var nextt = 0;
  if(i==0){
    pre = 26;
  }else{
    pre = i;
  }
  if(i==25){
    nextt = 1;
  }else{
    nextt = i+2;
  }
  twowaylinkedlist.push({
    prior:pre,
    data:String.fromCharCode(i+65),
    next:nextt
  })
//   console.log(twowaylinkedlist[i].prior+','+twowaylinkedlist[i].next);
}

function output(list,num){
  var p = 0;
  if(num>0){
    for(var i = 0;i<num;i++){
      p = list[i].next;
    }
  }
  if(num<0){
      p = list[list.length-1+num].next;
  }
  var string = "";
    for(var j=0;j<26;j++){
      string +=list[p-1].data;
      p=list[p-1].next;
    }
  console.log(string);
}
output(twowaylinkedlist,-3);