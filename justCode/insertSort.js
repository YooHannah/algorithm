// 插入排序 最坏情况下的时间复杂度为O(N^2)

// 拿后面的数插入到前面排好的顺序中去
const insertionSort = arr => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  // 每次后移一位,将新拿到的值插入到前面已排好的位置中去
  for(let i= 1; i< arr.length; i++) {
    // 每次看前面的数是否比后面的数大，大的话换位置, 
    // 再往前挪一位，在看前一位是否比后一位大
    for(let j = i-1; j>= 0 && arr[j] > arr[j+1]; j--) {
      swap(arr, j, j+1);
    }
  }
}

const swap = (arr, i, j) => {
  arr[i] = arr[i] ^ arr[j];
  arr[j] = arr[i] ^ arr[j];
  arr[i] = arr[i] ^ arr[j];
}