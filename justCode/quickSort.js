// 快排
// 选定一个基准数，将数组分成大于它和小于它的两拨
// 再在大于那一拨里找一个基准数，再分成小于小于两组
// 小于的那一拨也一样，找一基准，也分两拨
// 直到分到每一波只有一个数

// 时间复杂度O(N*log(N));
// 空间复杂度O(logN)


/**
 * 问题一
 * 给定一个数组arr,和一个数num,请把小于等于num的数放在数组的左边，大于num的数放在数组右边
 * 要求额外空间复杂度O(1), 时间复杂度0(N)
 */

/**
 * 分析： 
 * 
 * 假设拿到当前位于数组i位置的数据
 * 
 * 如果arr[i] < num, 那么就将arr[i]放到小于num的区域，
 * 就是将arr[i]和当前小于num数据区域的最后一个数据的下一个数据交换，
 * 使arr[i]成为小于区域的最后一个数，同时小于区域向右扩展一位
 * 
 * 如果arr [i] === num ，不需要操作，继续向后遍历，i++
 * 
 * 如果arr[i] > num, 那么就将arr[i]放到大于num的区域，
 * 就是将arr[i]和当前大于num数据区域的第一个数据的前一个数据交换，
 * 使arr[i]成为大于区域的第一个数，同时大于区域向左扩展一位
 */
 const quickSort = arr => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  process(arr, 0, arr.length -1)
}

const process = (arr, L, R) => {
  if(L < R) {
    // 随机选一个位置跟最右侧数做交换，相当于随机选一个数做基准数
    swap(arr, L+parseInt(Math.random() * (R-L+1)), R)
    const P = partition(arr, L, R); // 返回等于区域的左右边界
    process(arr, L, P[0] - 1); // 在<区递归
    process(arr,P[1]+1,R);// 在>区递归
  }
}
// partition 过程使快排失去稳定性 eg.[6,6,7,6,6,3,...]
// 处理L~R范围内的数据
const partition = (arr, L, R) => {
  const less = L-1; // 小于区域的右边界
  const more = R; // 大于区域左边界
  while(L < more) {
     if (arr[L] < arr[R]) { // 默认以arr[R]做划分，arr[R]就是num
       swap(arr, ++less, L++);
     } else if(arr[L] > arr[R]) {
      swap(arr, --more, L)
     } else {
       L++;
     }
  }
  // 基准数R的位置一直在最后，跟左边界数据交换，实现大于基准数的全在基准数右边
  swap(arr, more, R);
  return [less + 1, more] // 返回等于num值区域的左右边界位置，继续对大于区和小于区进行快排
}

/**
 * 问题二（荷兰国旗问题）
 * 给定一个数组arr,和一个数num,请把小于num的数放在数组左边，等于num的数放在数组中间，
 * 大于num的数放在数组右边
 * 要求额外空间复杂度O(1), 时间复杂度0(N)
 */
