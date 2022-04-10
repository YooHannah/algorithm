/**
 * 由一个代表题目，引出一种结构
 * 
 * 【题目】
 * 
 * 有一个整型数组arr和一个大小为w的窗口从数组的最左边滑到最右边，
 * 窗口每次向右边滑动一个位置
 * 
 * 例如，数组[4,3,5,4,3,3,6,7],窗口大小为3时：
 * [4,3,5],4,3,3,6,7 最大值5
 * 4,[3,5,4],3,3,6,7 最大值5
 * 4,3,[5,4,3],3,6,7 最大值5
 * 4,3,5,[4,3,3],6,7 最大值4
 * 4,3,5,4,[3,3,6],7 最大值6
 * 4,3,5,4,3,[3,6,7] 最大值7
 * 
 * 如果数组长度为n, 窗口大小为w,那么将会产生n-w+1个窗口的最大值
 * 实现函数，输入为整型数组，窗口大小为w
 * 输出长度n-w+1的数组res，res[i] 代表第i个窗口里面的最大值
 * 
 * 思路：
 * 借助下标数组pmax，该数组存放当前窗口内大于等于当前值的数的下标，按值从大到小排序
 * 比如原数组[4,7,8,1,4,3,2,5],
 * 当i = 0 时，pmax = [0] 窗口未形成
 * i = 1 时， pmax = [1], 7>4 窗口未形成
 * i = 2 时， pmax = [2], 8>7, 窗口形成
 * i = 3 时， pmax = [2,3]
 * i = 4 时， pmax = [2,4]
 * i = 5 时， pmax = [4,5]
 * 当pmax的第一个值超出窗口范围时，从pmax移除
 * 这样i所在的窗口的最大值就始终是pmax的第一个值
 */

 const getMaxWindow = (arr, w) => {
  if (!arr || !w || arr.length < w) {
    return null;
  }
  const windowMax = [];
  let index = 0;
  const pmax = [];
  for(let i = 0; i<arr.length; i++) {
    // 将pmax中存放的下标对应值比当前值小的下标清除
    while (pmax.length && arr[pmax[pmax.length -1]] < arr[i] ) {
      pmax.pop();
    }
    pmax.push(i);
    if (pmax[0] <= i - w) { // 超出窗口移除
      pmax.shift();
    }
    if(i >= w-1) {
      windowMax[index++] = arr[pmax[0]];
    }
  }
  return windowMax;
}


/**
 * 单调栈结构
 * 
 */
/**
 * 在数组中相找到一个数，左边和右边比这个数小，且离这个数最近的位置
 * 如果对每个数都像求这样的信息，能不能整体代价达到O(N)
 * 
 * 思路：
 * 借助下标数组pmin,存放比当前值小的值的下标，对应值从小到大，
 * 当碰到比pmin最后一个下标对应数值小的值时，对pmin进行弹出处理，
 * 此时pmin最后一个下标对应值，
 * 离它最近的左边比他小的最近值是pmin的倒数第二个值
 * 离它最近的右边比他小的最近值时当前值
 */

const getMinPos = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const pmin = [];
  const minPos = [];
  for(let i = 0; i < arr.length; i++) {
    while (pmin.length && arr[pmin[pmin.length -1]] > arr[i]) {
     const lastpos = pmin.pop();
     minPos.push({
       pos: lastpos,
       value: arr[lastpos],
       left: pmin.length > 1 ? pmin[pmin.length - 1] : -1,
       right: i
     });
    }
    pmin.push(i);
  }
  while(pmin.length) {
    const lastpos = pmin.pop();
    minPos.push({
      pos: lastpos,
      value: arr[lastpos],
      left: pmin.length ? pmin[pmin.length - 1] : -1,
      right: -1 // 后面没有比自己小的数，都比自己大
    });
  }
  return minPos
}

/**
 * 定义数组中累计和与最小值的乘积，叫做指标A，
 * 给定一个数组，请返回子数组中，指标A最大的值
 * 
 * 思路：
 * 首先明白子数组定义：一个或连续多个数组中的元素组成一个子数组(子数组最少包含一个元素)
 * 指标A 的获取就是当前元素作为子数组最小值，尽可能获取到左右两边比他大的值
 * 那么左右两边只要遇到比它小的值，再往当前值挪一位就是累计和最大的子数组的边界
 * 
 */

 const getMaxIndexA = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const posInfoList = getMinPos(arr);
  const IndexAList = [];
  posInfoList.forEach(item => {
    const { pos, left, right } = item;
    // 配合slice运算找到合适位置
    const start = left === -1 ? pos : left + 1;
    const end = right === -1 ? arr.length: right; 
    const list = arr.slice(start, end);
    const sum = list.reduce((prev,curr) => prev + curr, 0)
    const IndexA = sum * arr[pos];
    IndexAList.push(IndexA);
  })
  return IndexAList.sort((a,b)=> b-a)[0];;
}