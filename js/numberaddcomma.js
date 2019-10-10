/* 数字格式化，整数部分，每三位加一个逗号 */
str= '11100011.31';
str1 = str.split('.')
console.log(str1);
str2 = '';
length = str1[0].length;
count = parseInt(length/3);
console.log(count)
if(length%3){
  count++
}
console.log(count)
for(var i=0;i<count;i++){
    if(i!==count-1){
       str2 = ','+ str1[0].slice(-3)+str2;
       str1[0] = str1[0].slice(0,str1[0].length-3);
    }else{
      str2 = str1[0].slice(-3)+str2;
    }

}
console.log(str2+'.'+str1[1])
/**不考虑小数情况下可以直接用正则处理
 * '12345678'.replace(/(?=(\B\d{3})+$)/g,',')
 * \bxxxx 匹配项xxxx 前面不能是 字母数字下划线
 * \Bxxxx 匹配项xxxx 前面只能是 字母数字下划线
 */

/* 数组随机排序 */
var array = [1,2,3,4,5,6,7];
function randsort(arr){
  let len = arr.length;
  for(let i=0;i<len;i++){
    let index = parseInt(Math.random()*len);
    let temp = arr[index];
    arr[index] = arr[i];
    arr[i] = temp;
  }
  return arr;
}
console.log(randsort(array))

/* 寻找出现次数最多字符和它的个数*/
var str = 'aashjkdnlosavropehjkknlp';
function findmore(str){
 let letters={};
  for(let i=0;i<str.length;i++){
    if(!letters[str[i]]){
      letters[str[i]] =1;
    }else{
      letters[str[i]]++;
    }
  }
  let maxcount = 0;
  let letter = [];
  for(let k in letters){
    if(letters[k]>maxcount){
      maxcount = letters[k];
      letter = [];
      letter.push(k)
    }else if(letters[k] == maxcount){
      letter.push(k)
    }
  }
  return {
    letters:letters,
    maxcount:maxcount,
    letter:letter
  }
}
console.log(findmore(str));

/* 数组去重 */
function unique(arr){
  let temp=[];
  let obj={};
  for(let i=0;i<arr.length;i++){
    if(!obj[arr[i]]){
      temp.push(arr[i]);
      obj[arr[i]]=1;
    }
  }
  return temp;
}
var arr=[1,2,3,4,2,2,3,7,8,9,4,5];
console.log(unique(arr))

/*little test*/
var a = 5;
function test(){
  a=0;
  console.log(a);
  console.log(this.a);
  var a;//如果给a赋初始值，则不会继续找全局里面的a
  console.log(a)
}
test() //0 5 0
new test()//0 undefined 0

/*二分查找*/
var arr = [1,2,3,4,5,6,7,8,9];
function sort(arr,val){
   if(val == undefined){
     return 'nothing to search'
   }
  if(val>arr[arr.length-1]||val<arr[0]){
    return 'beyond range';
  }
  var start = 0;
  var end = arr.length-1;
  while(start < end){
    var middle = Math.round((start+end)/2);
    console.log(middle);
      if(arr[middle]>val){
        end= middle;
      }
      if(arr[middle]<val){
        start = middle;
      }
      if(arr[middle] == val){
        break
      }
  }
  return middle;
}
console.log(sort(arr,10));


/*事件监听*/
class EventEmitter {
  /* TODO */
  constructor() {
    this.listeners = [];
  }
  on(eventName, func){ //建立监听事件，有的话，就把关联函数push进去,没有的话就新建监听事件
    for(let i=0;i<this.listeners.length;i++){
      if(this.listeners[i].name === eventName){
          this.listeners[i].funcs.push(func);
          return
      }
    }
    this.listeners.push({
      name:eventName,
      funcs:[]
    })
    if(func){
      this.listeners[this.listeners.length-1].funcs.push(func)
    }
  }
  emit(eventName, ...args){ //触发监听事件
    for(let j=0;j<this.listeners.length;j++){
        if(this.listeners[j].name === eventName){
            for(let k =0;k<this.listeners[j].funcs.length;k++){
              this.listeners[j].funcs[k](args)
            }
        }
    }
  }
  off(eventName, func){ //取消监听
      for(let j=0;j<this.listeners.length;j++){
        if(this.listeners[j].name === eventName){
          if(func == undefined){ //整个事件不再监听
            this.listeners.splice(j,1);
           }
          for(let k =0;k<this.listeners[j].funcs.length;k++){ //取消监听事件的指定关联函数
                if(func === this.listeners[j].funcs[k]){
                  this.listeners[j].funcs.splice(k,1);
                  return
                }
            }
        }
      }
  }
}