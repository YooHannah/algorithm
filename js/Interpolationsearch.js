//插值查找
var list=[1,4,5,12,15,22,34,37,55,65,78,89];
console.log(list);
var low =0;
var high = list.length-1;
function Interpolationsearch(num){
 var mid = Math.floor(low +(high-low)*(num-list[low])/(list[high]-list[low]));
  if(num == list[mid]){
    mid++
    console.log(num+"是数组第"+mid+"个数");
    return 1;
  }
  if(num < list[mid]){
    high = mid-1;
  }
  if(num>list[mid]){
    low =mid+1;
  }
  if(low < high){
    Interpolationsearch(num);
  }else if(low == high && num == list[high]){
  	console.log(num+"是数组第"+low+"个数");
    return 1;
  }else{
    console.log("该值不存在数组中！");
    return 0;
  }
}
Interpolationsearch(79)