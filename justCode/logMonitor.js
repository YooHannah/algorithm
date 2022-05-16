// 对数器
/***
 * 概念和使用
 * 有一个想要测试的方法a和实现复杂度高但容易实现的方法b
 * 利用随机样本产生器
 * 把方法a和方法b跑相同的随机样本，看得到的结果是否一样
 * 如果有一个随机样本使得对比结果不一致，打印样本进行人工干预
 * 更改方法a或者方法b,使二者结果符合预期
 * 当样本数据很多时对比测试依然正确，可以确定方法a正确 
 */

// 下面是一个比较插入排序是否正确的例子

const comparator = arr => arr.sort(); // 跟数组本身的排序方法比较，即方法b
const generateRandomArray = (maxSize,maxValue) => {
  const arr = (parseInt((maxSize +1) * Math.random()));
  for(let i = 0; i< arr.length; i++) {
    arr[i] = parseInt((maxValue + 1) * Math.random()) - parseInt(maxValue * Math.random())
  }
  return arr;
}
cosnt main = args => {
  const testTimes = 500000;
  const maxSize = 100;
  const maxValue = 100;
  let sucessed = true;
  for(let i = 0;i< testTimes; i++) {
    const arr1 = generateRandomArray(maxSize,maxValue);
    const arr2 = arr1.slice();
    InsertSort(arr1);
    comparator(arr2);
    if(!isEqual(arr1,arr2)) {
      sucessed = false;
      break;
    }
  }
  console.log(sucessed? 'Nice': 'Fucking fucked');

  const arr = generateRandomArray(maxSize,maxValue);
  console.log(arr);
  InsertSort(arr);
  console.log(arr);
}