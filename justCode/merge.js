// 归并排序
/**
 * 整体就是一个简单的递归，左右排好序后，再让整体有序
 * 
 */

const mergeSort = arr => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  process(arr, 0, arr.length -1)
}

const process = (arr, L, R) => {
  if ( L === R) {
    return arr[L];
  }

  const mid = L + ((R - L) >>1); // 计算中点位置，防止R+L越界
  process(arr, L, mid);
  process(arr, mid+1, R);
  merge(arr,L,mid,R);
}
// merge时，左右相等，先拷贝左边的可以实现稳定性
const merge = (arr, L, M, R) => {
  const help = new Array(R-L +1);
  let i = 0;
  let p1 = M;
  let p2 = M + 1;
  while(p1 <= M && p2 <= R) { 
    // 把两边排好序的按大小装进help => 谁小谁进help,然后右移一位 ！！！重点重点
    help[i++] = arr[p1] <= arr[p2] ? arr[p1++] : arr[p2++];
  }
  while(p1 <= M) {
    help[i++] = arr[p1++]
  }
  while(p2 <= R) {
    help[i++] = arr[p2++]
  }
  for(i = 0; i< help.length;i++) { // 将L~R范围内排好序的数据回填到arr
    arr[L+i] = help[i];
  }
}

// 应用
/**
 * 求小和问题
 * 一个数组中，每一个数左边的比当前小的数据累积起来，叫做这个数组的小和
 * 例：[1,3,4,2,5] 
 * 1左边比1小的数，没有；
 * 3左边比3小的数，1；
 * 4左边比4小的数：1,3；
 * 2左边比2小的数：1；
 * 5左边比5小的数：1,3,4,2；
 * 所以小和为1+1+3+1+1+3+4+2 = 16；
 */
const smallSum = arr => {
  if(arr === null || arr.length <2) {
    return 0;
  }
  process(arr, 0, arr.length -1)
}

const process = (arr, L, R) => {
  if ( L === R) {
    return 0;
  }

  const mid = L + ((R - L) >>1); 
  return process(arr, L, mid) +
  process(arr, mid+1, R) +
  merge(arr,L,mid,R);
}
// 虽然时O(NlogN),但是会丧失稳定性
const merge = (arr, L, M, R) => {
  const help = new Array(R-L +1);
  let i = 0;
  let p1 = M;
  let p2 = M + 1;
  let res = 0;
  while(p1 <= M && p2 <= R) { 
    // 当左边的数比右边的小，从p2开始，它后面的数都会比p1指的数大，所以要一起算上! 重点重点
    res += arr[p1] < arr[p2] ? (R - p2 + 1) * arr[p1] : 0; 
    help[i++] = arr[p1] <= arr[p2] ? arr[p1++] : arr[p2++];
  }
  while(p1 <= M) {
    help[i++] = arr[p1++]
  }
  while(p2 <= R) {
    help[i++] = arr[p2++]
  }
  for(i = 0; i< help.length;i++) { 
    arr[L+i] = help[i];
  }
  return res
}

/**
 * 逆序对问题
 * 在一个数组中，左边的数如果比右边的数大，则这两个数构成一个逆序对
 * 请打印所有的逆序对
 */

// 处理方式同小和问题，在merge过程中，将逆序对发现并返回