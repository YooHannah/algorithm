//斐波那契查找
var list=[1,4,5,12,15,22,34,37,55,65,78,89];
console.log(list);
function FibonacciSearch(num){
//建立一定长度斐波那契数列
var fiob = [];
fiob[0] = 0;
fiob[1] = 1;
for(var i = 2;i<15;i++){
    fiob[i] = fiob[i-1]+fiob[i-2]
}
console.log(fiob);
//寻找查询数组长度在斐波那契数列的位置k
var k = 0;
while(list.length>fiob[k]-1){
    ++k;
}
//借用新建数组，补齐数组长度fiob[k]-1
var temp = [];
temp = list.slice();
for(var i=list.length;i< fiob[k]-1;i++){
  temp[i]=list[list.length-1];
}
//开始查询
var low = 0;
var high = list.length-1;
while(low<=high){
  var mid = low+fiob[k-1]-1; 
  //将数组分为fiob[k-1]-1和fiob[k-2]-1两部分
  //原本fiob[k] = fiob[k-1] 和fiob[k-2]
  //fiob[k-1]-1+fiob[k-2]-1 = fiob[k]-2
  //temp.length = fiob[k]-1,剩一个,即给mid
  //因此 mid = low+fiob[k-1]-1;low一开始为0
  if(num < temp[mid]){
    high=mid-1;
    k-=1;//查询值在前半部分，将k-1取代k,重新按k-1分成两部分
  }
  if(num > temp[mid]){
    low =mid+1;
    k-=2;//查询值在后半部分，将k-2取代k,重新按k-2分成两部分
  }
  if(num == temp[mid]){
    if(mid< list.length){
       mid++
       console.log(num+"是数组第"+mid+"个数");
       return 1;
      }else{
       console.log("该值不存在数组中！");
       return 0;
      }
  }
}
 console.log("该值不存在数组中！");
 return 0;
}
FibonacciSearch(79);