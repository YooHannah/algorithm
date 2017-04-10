//冒泡排序
var List = [2,8,6,9,1,3,5,7,4];
function BubbleSort(val){
  if(val.constructor != Array){
    return "输入的参数不是数组";
  }
  if(val.length == 0){
    return [];
  }
  var list = val.slice();
  for(var i = 0;i<list.length;i++){
    for(var j= list.length-1;j>i;j--){
      if(list[j-1] >= list[j]){
        var temp = list[j-1];
        list[j-1] = list[j];
        list[j] = temp;
      }
    }
  }
  return list;
}
var pp = [];
var soredlist = BubbleSort(List);
console.log(soredlist);
console.log([].constructor == Array);
console.log({}.constructor == Object);
console.log("string".constructor == String);
console.log((123).constructor == Number);
console.log(true.constructor == Boolean);