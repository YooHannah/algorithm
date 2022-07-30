// 桶排序
/**
 * 桶排序不是基于比较的排序， 应用范围有限，需要样本的数据状况满足桶的划分
 * 
 * 不基于比较的排序都是需要根据一定数据状况进行定制的
 * 
 * 桶排序思想下的排序有两种
 * 
 * 计数排序，需要数据是词频数组（多个数据相同出现多次），数量一定要有限，否则需要一定内存
 * 
 * 基数排序，使用分片思想进行排序
 * 
 */



// 找到数组里面最大数，并求其的位数

const maxbits = arr => {
  let max = Number.MIN_VALUE;
  for(let i = 0;i<arr.length;i++) {
    max = Math.max(max,arr[i]);
  }
  let res = 0;
  while(max!= 0) {
    res++;
     max = parseInt(max/10);
  }
  return res
}
// 获取x这个数上第d位上的数字
const getDigit = (x, d) =>  parseInt((x / Math.pow(10, d-1)) % 10);

// 排序过程

const process = (arr, L, R, digit) => {
  const radix = 10; // 每位上可能出现0~9 共10个数字
  let i = 0;
  let j = 0;
  const bucket = new Array(arr.length-1); // 用于存放每一次按d位分层处理后的数组
  for(let d = 1; d<=digit; d++) { // 有多少位，就进出多少次
   
    const count = new Array(10);
    i = radix;
    while(i--){
      count[i] = 0;
    }
     /**
     * count 在这里循环结束后
     * 用于存放d上0~9这几个数字出现了几次
     * 例如对数组[12,45,17,32],
     * d= 1时，2出现了2次(12,32)
     * count[2] = 2
     */
    for(i = L; i < arr.length;i++) {
      j = getDigit(arr[i], d);
      console.log('d', j);
      count[j]++;
    }
    console.log('count', count);
    /**
     * 这个循环结束后，count每一位（i）存放0~i有多少个数字
     * 即，当前位(d为)小于等于i的数组arr里面的数有几个
     */
    for(i = 1;i<radix;i++) {
      count[i] = count[i] + count[i-1]
    }
    /**
     * 从后往前把数组里面的数按照d位情况从小到大(0~9)排列好
     * bucket每次拿一个数据，count相应值减1，相同d为的数字
     * 会被依次连续排列在bucket中
     * 因为是从右向左开始放，所以相同d位的数，
     * 放置完后相对位置没有变化
     */
    for(i = R; i>=L;i--) {
      console.log('arr[i]', arr[i]);
      j = getDigit(arr[i],d);
      bucket[count[j] - 1] = arr[i];
      count[j]--
    }
    for(i = L,j = 0; i<=R;i++,j++) {
      arr[i] = bucket[j];
    }
     console.log('arr', arr);
  }
}

// 基数排序实现
const radixSort = arr => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  process(arr, 0, arr.length - 1, maxbits(arr));
  console.log(arr)
}

radixSort([15,35,7,6,23,11,34]);


/**
 * 给定一个数组，求排序之后，相邻两数的最大差值，
 * 要求时间复杂度O(N),且要求不能用基于比较的排序
 * 
 * 思路：
 * 找出最大最小值，涵盖这两值范围，均等10分，形成10个桶
 * 将所有数字放入10个桶中
 * 计算每个桶中最大最小值，
 * 让最大值和下一个桶的最小值求差，
 * 让最小值和上一个桶的最大值求差
 * 从里面找最大值即要求的最大差值
 * 
 * 原理
 * 一个桶里面的数字差肯定小于桶的范围大小，直接忽略不计
 * 从桶之间找最大值
 */

const findMaxMin = arr => {
  let max = Number.MIN_SAFE_INTEGER;
  let min = Number.MAX_VALUE;
  arr.forEach(e=> {
    max = Math.max(e, max);
    min = Math.min(e, min);
  })
  return [max, min];
}
const findMaxDistance = arr => {
  const [max, min] = findMaxMin(arr);
  const length = max - min + 1;
  const space = Math.floor(length / 10);
  const bottle = [];
  for(let i = 1; i < 11; i++) {
    bottle[i-1] = [];
  }
  const firstEnd = min + space - 1;
  for(let j = 0; j< arr.length; j++) {
    const curr = arr[j];
    let bottleMaxValue = firstEnd;
    let pos = 0;
    while(bottleMaxValue < curr) {
      bottleMaxValue += space;
      pos++;
    }
    bottle[pos].push(curr);
  }
  const validBottle = bottle.filter(item => item.length);
  const maxMin = validBottle.map(list => findMaxMin(list))
  const diffValue = [];
  for(let m = 0; m < maxMin.length; m++) {
    const [max, min] = maxMin[m];
    diffValue.push(max - min);
    if (m < maxMin.length -1) {
      const [nextMax, nextMIn] = maxMin[m + 1];
      diffValue.push(nextMIn - max);
    }
  }
  return findMaxMin(diffValue)[0];
}