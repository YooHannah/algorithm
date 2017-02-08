//折中查找(递归）法
//定义3个变量，两个确定查找起止位置，二者中间值做比较对象，
//中间值大于查找对象，中间值位置减1赋值为止位置
//中间值小于查找对象，中间值位置加1赋值为起位置
//相等或找不到退出查找
var list=[1,4,5,12,15,22,34,37,55,65,78,89];
console.log(list);
var low =0;
var high = list.length-1;
var mid = parseInt((low+high)/2);
function compromisefind(num){

  if(num == list[mid]){
    mid++
    console.log(num+"是数组第"+mid+"个数");
    return 1;
  }
  if(num<list[mid]){
    high=mid-1;
  }
  if(num>list[mid]){
    low =mid+1;
  }
  if(low<=high){
    mid = parseInt((low+high)/2);
    compromisefind(num);
  }else{
    console.log("该值不存在数组中！");
    return
  }

}
compromisefind(79)