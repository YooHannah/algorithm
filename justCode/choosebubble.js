// 选择冒泡排序 O(N^2)


// 冒泡排序
// 每次把最大值冒泡到最后面，然后冒泡的最大边界向前移一位
// 再从头往后，冒泡
const bubbleSort = (arr) => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  for (let a = arr.length - 1;a > 0; a--) {
    for(let i = 0;i<a; i++) {
      if((arr[i] > arr[i+1])){
        swap(arr, i, i+1);
      }
    }
  }
}

// 选择排序
// 每轮从当前值开始，往后找到最小值下标，然后交换到当前值
// 相当于，一轮一轮的找最小值，然后普把每轮最小值依次放到前面
const selectionSort = (arr) => {
  if(arr === null || arr.length <2) {
    return arr;
  }

  for(let i= 0; i<arr.length-1; i++) {
    let minIndex = i;
    for(let j = i+1;j < arr.length;j++) { // i ~ N-1 上找最小值下标
      minIndex = arr[j] < arr[minIndex] ? j : minIndex;
    }
    swap(arr, i, minIndex);
  }
}
// 利用异或位运算进行交换，更快
const swap = (arr, i, j) => {
  arr[i] = arr[i] ^ arr[j];
  arr[j] = arr[i] ^ arr[j];
  arr[i] = arr[i] ^ arr[j];
}