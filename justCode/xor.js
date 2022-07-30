/**
 * 异或和相关的问题
 */

 /**
 * 给出n个数字，问最多有多少不重叠的非空区间，使得每个区间内数字的xor都等于0
 * 
 * 思路：
 * 假设答案法
 * 准备一个容器dp，每个位置存放从0到当前位置i的符合要求的空间个数
 * 即，dp[i] 是0-i范围内不重叠区间，且每个区间xor等于0的区间个数
 * 同时准备一个映射表map，
 * key表示遍历过程中xor出现的结果，
 * value 表示这个结果最近出现的位置
 * 先初始化一个数组{0： -1}，表示一开异或和结果是0的位置在-1，还没开始遍历数组
 * 准备一个变量eor，存放遍历到当前值和之前所有值的异或结果
 * 当遍历到i的时候
 * 如果0-i有最优划分，i肯定位于划分的空间的最后一个
 * 
 * 假如i所在的空间异或和不是0，
 * 说明i所在的空间不会计入dp[i]的个数，
 * 此时dp[i] 的值，跟是否有i位置的值无关，那么dp[i] = dp[i-1]
 * 
 * 假如i所在空间异或和是0，那么空间开始的位置到i位置异或和为0
 * 空间开始的位置应该是上一次出现相同xor位置的下一个位置
 * 从map表中找到上一次出现xor所在的位置pre，
 * 也就是说0-pre异或和是xor， 0-i异或和也是xor
 * 那么pre+1到i的异或和只能是0
 * 符合要求的区间增加1
 * dp[i] = dp[pre] + 1,
 * 
 * 比较两种可能性的大小取最大值，就是dp[i]最终的值
 * 遍历到最后一个值，dp[arr.length -1] 就是答案
 */

const finsMaxXorSpace = arr => {
  let xor = 0;
  let dp = [];
  let map = { 0: -1 };
  for(let i = 0; i<arr.length; i++) {
    xor ^= arr[i];
    // 最优解有i位置数据
    if(map[xor]) { // 可以从前面的位置中找一个位置到i异或和为0
      const pre = map[xor];
      dp[i] = pre === -1 ? 1 : dp[pre] +1;
    } else { // 找不到，空间个数为0
      dp[i] = 0;
    }
    if (i > 0) { // dp[i-1] 0-i范围内，满足的空间没有i位置数据
      dp[i] = Math.max(dp[i-1], dp[i])
    } 
    map[xor] = i;
  }
  return dp[dp.length -1]
}

/**
 * 数组异或和的定义： 将数组中所有的数异或起来得到的值
 * 给定一个整型数组arr, 其中可能有正数，负数，0，
 * 求其中子数组的最大异或和
 * 
 * 思路：
 * arr[i,...j]异或和= arr[0...j] 异或和 ^ arr[0...i]异或和
 * 使用前缀树寻找可以让arr[i..j] 异或和最大的 arr[0...i] 
 */
class Node {
  constructor() {
    this.nexts = {}
  }
}
class NumTrie {
  constructor() {
    this.head = new Node();
  }

  add(num) {
    let cur = this.head;
    for(let move = 31; move >= 0; move--) {
      const path = (num >> move) & 1;
      cur.nexts[path] = cur.nexts[path] ? cur.nexts[path] : new Node();
      cur = cur.nexts[path];
    }
  }

  maxXor(sum) {
    let cur = this.head;
    let res = 0;
    for(let move = 31; move >=0;move--) {
      const path = (sum >> move) & 1;
      let best = move === 31 ? path : (path ^ 1);
      best = cur.nexts[best] ? best : (best ^ 1);
      res |= (path ^ best) << move;
      cur = cur.nexts[best]
    }
    return res
  }
}
 const maxXorSubarry = arr => {
   if (!arr || !arr.length) {
    return 0
   }
   let max = Number.MIN_VALUE;
   let sum = 0;// 一个数没有时异或和为0
   const numTrie = new NumTrie();  // 前缀树，存储0~i的异或和
   numTrie.add(0)
   for( let i = 0; i<arr.length; i++) {
    sum ^=arr[i];
    max = Math.max(max, numTrie.maxXor(sum)); //  numTrie.maxXor在0-i-1里面找能使0~i 异或上去结果值最大，并返回最大值
    numTrie.add(sum)
   }
   return max
 }
 
/**
 * 给定一个非负数组，每个位置上代表有几枚铜板
 * a先手b后手，每次都可以拿任意数量铜板，但是不能不拿
 * 谁最先把铜板拿完谁赢，
 * 返回获胜者名字
 * 
 * 方法论： Nim 博弈论问题
 * 思路：
 * 数组所有数据异或和（所有数据无进位相加）为0，则后手肯定赢
 * 否则先手赢
 * 先手赢的操作就是每次拿完铜板，让后手面对的数组，异或和为0
 * 
 */

const getWinner = arr => {
  const xor = arr.reduce((curr,prev)=> curr ^ prev, 0);
  return xor ? '先手赢' : '后手赢'
}
