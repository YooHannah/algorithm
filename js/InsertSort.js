//直接插入排序
//连续两个比较若后面的比前面的小，就将后面的值移到比它大的值的前面
var List = [2,8,6,9,1,3,5,7,4];
function InsertSort(val){
   if(val.constructor != Array){
    return "输入的参数不是数组";
  }
  if(val.length == 0){
    return [];
  }
  var list = val.slice();
  for(var i = 1;i<list.length;i++){
    if(list[i] <list[i-1]){
      temp = list[i];
      //寻找list[i]应该插入的位置，并将比它大的值后移
      for(j=i-1;list[j]>temp;j--){
        list[j+1] =list[j];
      }
      list[j+1] = temp;//插入
    }
  }
  return list;
}
console.log(InsertSort(List));