/**
 * 尝试相关
 */

/**
 * 现有一二维数组matrix,均为整数，正负都有，
 * 贪吃蛇可以从矩阵最左侧一列任意一个单元格当做起点进入矩阵
 * 每次只能到达当前位置进入右上相邻，右侧相邻，和右下相邻的单元格
 * 每到达一个单元格后，生命值累计单元格的值
 * 但可以在游戏开始前将矩阵内任意一个单元格转换成相反数，且只能转换一次
 * 当贪吃蛇的生命值小于0，则游戏结束
 * 问贪吃蛇游戏过程中能获得的最高生命值可以有多少？
 * 例如
 * 1 -4 10
 * 3 -2 -1
 * 2 -1 0
 * 0 5 -2
 * 最右路径是从最左侧3开始，3->-4(这里使用转换相反数) -> 10 ===> 返回17
 * 
 * 思路：
 * 尝试所有可能性
 * 找最大值
 * 
 */
const f = (matrix, row, col) => {
  const val = matrix[row][col];
  if (!col) {
    return {
      yes: -val,
      no: val
    }
  }
  let preNo = -1;
  let preYes = -1;
  if(row) {
    // 从左上角来到当前格子
    const {yes, no} = f(matrix, row-1, col-1);
    if(yes >=0) {
      preYes = yes;
    }
    if(no >=0) {
      preNo = no
    }
  }
   // 从左侧来到当前格子
  const {yes,no} = f(matrix, row, col-1);
  if(yes >=0) {
    preYes = Math.max(yes, preYes);
  }
  if(no >=0) {
    preNo = Math.max(no, preNo)
  }
   // 从左下角来到当前格子
  if(row < matrix.length -1) {
    const {yes,no} = f(matrix, row+1, col-1);
    if(yes >=0) {
      preYes = Math.max(yes, preYes);
    }
    if(no >=0) {
      preNo = Math.max(no, preNo)
    }
  }
  let y = -1;
  let n = -1;
  if (preNo >=0) {
    y = preNo + (-val);
    n = preNo + val;
  }

  if(preYes) {
    y = Math.max(preYes + val, y);
  }
  return {
    yes: y,
    no: n
  }
}
const getMaxLife = matrix => {
  const rowLength = matrix.length;
  const colLength = matrix[0].length;
  let life = Number.MIN_VALUE;
  for(let i = 0; i<rowLength; i++) {
    for(let j = 0; j<colLength;j++) {
      const cur = f(matrix, i,j);
      life = Math.max(life, cur.yes, cur.no);
    }
  }
  return life;
}

 /**
  * 给定一个数组，数组上每个位置的值，代表该位置气球的分数
  * 打爆气球得分规则如下
  * 1，如果被打气球左右两边还有气球，找到离他最近的气球，本次得分为三者分数乘积
  * 2. 如果左右两侧气球都没有了，则本次分数为被打气球分数
  * 3.如果左右两边任意一边气球被打完，另一边有气球，
  * 则本次得分为有气球一方离被打气球最近的气球分数与被打气球分数乘积
  * 4.打爆所有气球得分之和为总分数，所以打爆气球顺序可以决定不同总分数
  * 求能获得的最大分数
  * 
  * 思路：
  * 一定范围内尝试
  * 尝试的方式：每个气球都最后打爆
  */

  // 打爆l~r这个范围内气球可以获得的最大分数是多少
// 假设arr[l-1]和arr[r+1]一定没有被打爆
const process = (arr, l, r) => {
  // 范围内只有一个气球则直接打爆
  if (l == r) {
    return arr[l-1] * arr[l] * arr[r+1];
  }
  // 最后打爆arr[l] 和最后打爆arr[r]的方案先比较一下
  let max = Math.max(
    arr[l-1] * arr[l] * arr[r+1] + process(arr, l + 1, r),
    arr[l-1] * arr[r] * arr[r+1] + process(arr, l, r-1)
  )
  
  // 尝试中间位置的气球最后被打爆的每一种方案

  for (let i = l+1; i<r; i++) {
    max = Math.max(
      max,
      arr[l-1] * arr[i] * arr[r+1] + process(arr, l, i-1) + process(arr, i+1,r)
    );
  }
  return max;
}

const maxCoins = arr => {
  if (!arr || !arr.length) {
    return 0
  } 

  if (arr.length === 1) {
    return arr[0]
  }
  const help = [1, ...arr, 1]
  return process(help, 1, arr.length)
}