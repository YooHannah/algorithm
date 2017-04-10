 //希尔排序法结合直接插入排序法
 var List = [2,8,6,9,1,3,5,7,4];
function ShellSort(val){
   if(val.constructor != Array){
    return "输入的参数不是数组";
  }
  if(val.length == 0){
    return [];
  }
  var list = val.slice();
  var gap = list.length;
  while(gap>1){
    gap = parseInt(gap/3)+1;
     for(var i = gap;i<list.length;i++){
      if(list[i] <list[i-gap]){
        temp = list[i];
        for(j=i-gap;list[j]>temp;j -=gap){
          list[j+gap] =list[j];
        }
        list[j+gap] = temp;//插入
      }
     }
  }
  return list;
}
console.log(ShellSort(List));