/**
 * 贪心算法
 * 在一个标准下，优先考虑最满足标准的样本，最后考虑最不满足标准的样本，
 * 最终得到一个答案的算法，叫做贪心算法
 * 
 * 也就是，一开始不以整体最优上加以考虑，所做出的是在某种意义上的局部最优解
 * 由局部最优解推导出整体最优解
 * 
 * 解题思路
 * 1. 实现一个不依靠贪心策略的解法X，可以用最暴力的方式尝试实现
 * 2.脑补出贪心策略A,B,C
 * 3.用解法X和对数器，去验证每一个贪心策略，用实验的方式证明那个贪心策略正确
 * 4.不用太纠结贪心策略的证明
 * 
 * 实现技巧
 * 1.根据某个标准建立一个比较器来排序
 * 2.根据某个标准建立一个比较器来组成堆
 */

/**
 * 题目：
 * 一些项目要占用一个会议室进行宣讲，会议室不能同时容纳两个项目的宣讲
 * 给定所有项目的开始和结束时间，如何安排会议可以使得会议室进行的宣讲场次最多
 * 返回这个最多的宣讲场次
 * 
 */
// 假设programs = [{start:xxxx, end: ccc}];
const bestArrange = (programs) => {
  const list = programs.sort((a,b) => a.end -b.end);
  let timePoint = list[0].start;
  let count = 0;
  for(let i = 0;i<list.length;i++) {
    const { end , start } = list[i];
    if (timePoint <= list[i].start) {
      count++;
      timePoint = end;
    }
  }
  return count;
}


/***
 * 题目：
 * 将一块金条切成两半，需要花费和金条长度一样数值的铜板
 * 比如长度为20的金条，不管切成长度多大的两半，都要花费20个铜板
 * 
 * 现在有一群人想整分整块金条，怎么分最省铜板？
 * 
 * 例如，给定一个数组[10,20,30]代表一共三个人，整块金条长度为10+20+30 = 60
 * 金条要分成10,20,30的三个长度，
 * 如果先把长度60的金条分成10和50，花费60，
 * 再把50分为20和30，又花费50，一共将花费110；
 * 但是如果先将60金块切成30+30，花费60，
 * 再将30切成10 + 20，花费30，一共将花费90，
 * 
 * 现在输入一个数字组成的数组，返回最小的分割金条需要的铜板数
 * 
 */

const lessMoney = (arr) => {
  const list = arr.sort((a,b) => b-a);
  let count = 0;
  while (list.length >1) {
    const curr = list.pop() + list.pop();
    count += curr;
    list.push(curr);
  }
  return count;
}

/***
 * 题目：
 * 输入
 * 正数数组costs,costs[i] 表示i号项目的花费，
 * 正数数组profits,profits[i] 表示i号项目在扣除花费之后还能挣到的钱(利润)
 * 正数K, 表示只能串行的最多做K个项目
 * 正数M，表示初始的资金
 * 每做完一个项目，马上可以获得收益，可以支持做下一个项目
 * 
 * 输出：最后可以获得的最大钱数
 * 
 */

 const getMaxProfit = (costs, profits, K, W) => {
  const originList = costs.map((c, i) => ({
    c,
    p: profits[i]
  }));
  const minCosts = originList.sort((a,b) => b.c-a.c);
  let maxProfits = [];
  for(let i = 0; i< K; i++) {
    while(minCosts.length && minCosts[minCosts.length - 1].c <= W) {
      maxProfits.push(minCosts.pop());
    }
    maxProfits = maxProfits.sort((a,b) => a.p - b.p);
    if (!maxProfits.length) {
      return W
    }
    W += maxProfits.pop().p; 
  }
  return W;
}



/**
 * 题目：
 * 一个数组流中，随时可以取得中位数
 * 
 */

 const getMid = () => {
  const maxList = []; // 始终拿最大的值，但存的是偏小的值
  const minList = []; // 始终拿最小的值，但存的是偏大的值
  return curr => {
    if (!maxList.length && !minList.length) {
      maxList.push(curr)
      return curr;
    }
    const maxInMazList = maxList.sort((a,b)=>b-a)[0];
    if (curr<=maxInMazList) {
      maxList.push(curr);
    } else {
      minList.push(curr);
    }
    const minInMinList = minList.sort((a,b)=>a-b)[0];
    if (Math.abs(maxList.length - minList.length)>= 2) { 
      // 如果一个比另外一个多了两个数字，就把maxList的最大值或者minList最小值移到对方数组中
      if (maxList.length > minList.length) {
        minList.push(maxInMazList);
        const pos = maxList.findIndex(e => e === maxInMazList);
        maxList.splice(pos, 1);
      } else {
        maxList.push(minInMinList);
        const pos = minList.findIndex(e=> e === minInMinList);
        minList.splice(pos, 1);
      }
    }
    return maxList.length > minList.length ? maxList.sort((a,b)=> b-a)[0] : minList.sort((a,b)=>a-b)[0];
  }
}

const getMidNumber = getMid();


/***
 * 题目：
 * N皇后问题
 * 在N*N的棋盘上要摆N个皇后，要求任何两个皇后不同行，不同列，也不再同一条斜线上
 * 给定一个整数N，返回N皇后的摆法有多少种
 * n = 1,返回1；
 * n = 2 或者3，无法实现，返回0；
 * n = 8,返回92
 */

/** 方法一 */

// record[0...i-1] 你需要看，record[i...]不需要看
// 返回i行皇后放在j列，是否有效
const isValid = (record, i, j) => {
  for(let k = 0; k < i; k++) {// i 之前的某个k行的皇后
    if(j == record[k] || Math.abs(record[k] -j) == Math.abs(i - k)) {
      return false;
    }
  }
  return true;  
}
/**
 * 潜台词：record[0...i-1]的皇后，任何两个皇后一定都不共行，不共列，不共斜线
 * @param {*} i 目前来到第i行，
 * @param {*} record record[0...i-1] 表示之前的行，放了皇后的位置
 * @param {*} n  一共有多少行
 * @returns 摆完所有皇后，合理的摆法有多少种
 */
const process1 = (i, record, n) {
  if ( i == n) {
    return 1;
  }
  let res = 0;
  for(let j = 0;j<n; j++) { // 当前在i行，尝试行所有列 --> j
    // 判断当前i行皇后，放在j列，会不会和之前(0...i-1)的皇后，共行，共列或者共斜线
    // 如果是，认为无效，如果不是，认为有效
    if(isValid(record, i, j)) {
      record[i] = j;
      res = process1(i+1, record, n);
    }
  }
  return res;
}
const num1 = n => {
  if (n < 1) {
    return 0;
  }
  const record = [];
  return process1(0, record, n);
}

/**方法二 适用于不超过32个皇后的情况 */

/**
 * 
 * @param {*} limit 
 * @param {*} colLim 列的限制，1的位置不能放皇后，0的位置可以
 * @param {*} leftDiaLim 左斜线的限制，1的位置不能放皇后，0的位置可以
 * @param {*} rightDaiLim 右斜线的限制，1的位置不能放皇后，0的位置可以
 */
const process2 = (limit,colLim,leftDiaLim,rightDaiLim) => {
  if (colLim == limit) { // base case
    return 1;
  }
  // 所有候选皇后的位置，都在pos上
  let pos = limit & (~(colLim | leftDiaLim | rightDaiLim));
  let mostRightOne = 0;
  let res = 0;
  while(pos != 0) {
    mostRightOne = pos & (~pos + 1);
    pos = pos - mostRightOne;
    res += process2(
      limit,
      colLim | mostRightOne,
      (leftDiaLim | mostRightOne) << 1,
      (rightDaiLim | mostRightOne) >> 1
    );
  }
  return res
}

const num2 = n => {
  if (n < 1 || n > 32) {
    return 0;
  }
  let limit = n == 32 ? -1 : (1<<n) - 1;
  return process2(limit, 0, 0, 0)
}