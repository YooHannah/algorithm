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
  // console.log(twowaylinkedlist[i].prior+','+twowaylinkedlist[i].next);
}
List = ['A','B','C','H','V','L'];//明文
console.log(List);
function vigenere(list){
  var keys = [];//随机密钥
  var codelist = [];//密码
  var keystemp=[];//移动位数
  for(var i = 0;i<list.length;i++){
    var temp1 = parseInt(Math.random()*100);
    keys.push(temp1);
    var temp2 = temp1%26;
    keystemp.push(temp2);
    for(var k = 0;k<26;k++){
      if(twowaylinkedlist[k].data == list[i]){
        if(temp2 == 0){
          codelist.push(twowaylinkedlist[k].data);
        }else{
          var p = twowaylinkedlist[k].next;
          for(var j= 0;j<temp2-1;j++){
            p = twowaylinkedlist[p-1].next;
          }
          codelist.push(twowaylinkedlist[p-1].data);
        }
      }
    }
  }
  console.log(keys);
  console.log(keystemp);
  console.log(codelist);
}
vigenere(List);
