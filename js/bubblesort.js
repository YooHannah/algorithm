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
  var flag = 1;//添加flag,当某个个元素在比较过程中两两之间没有发生交换，则说明之前的顺序已经被排好，不需要再比较，提前结束
  for(var i = 0;i<list.length-1 && flag;i++){
    for(var j= list.length-1;j>i;j--){//每一轮把位置i后面最小的滚到前面来,下一轮循环时,排除之前排好序的i+1个数
       flag = 0;
      if(list[j-1] >= list[j]){
        var temp = list[j-1];
        list[j-1] = list[j];
        list[j] = temp;
        flag = 1;
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