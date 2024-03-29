// 递归
/**
 * 包含递归逻辑的算法时间复杂度可以用满足Master公式条件的Master公式来求
 *
 * Master公式： T(N) = a*T(N/b) + O(N ^ d)
 * 即主程序由几个均分的子程序组成，子程序必须是一样的时间复杂度
 * 满足这种关系的递归过程可以这样计算时间复杂度： 
 * （log以b为底a的对数表示为log(b,a))
 *  如果log(b,a) < d => O(N^d)
 *  如果log(b,a) > d => O(N^log(b,a))
 *  如果log(b,a) = d => O(N^d * logN)
 */
// 以下面这个例子解释
const getMax = arr => {
  return process(arr, 0, arr.length-1);
}

// arr[L...R]范围上最大值

const process = (arr, L, R) => {
  if ( L === R) {
    return arr[L];
  }

  const mid = L + ((R - L) >>1); // 计算中点位置，防止R+L越界
  const leftMax = process(arr, L, mid);
  const rightMax = process(arr, mid+1, R);
  return Math.max(leftMax, rightMax);
}

/**
 * process的Master公式就是
 * T(N) = 2T(N/2) + O(N ^ 0) // 只有1句计算中点的语句所以是O(1) => O(N ^ 0)
 * a = 2, b = 2, d = 0
 * log(b, a) = 1 > d
 * 这个递归的时间复杂度就是 O(N^log(b,a)) => O(N)
 */


/***
 * 暴力递归
 * 就是尝试
 * 1. 把问题转化为规模小了的同类问题的子问题
 * 2. 有明确的不需要继续进行递归的条件(base case)
 * 3. 有当得到了子问题的结果之后的决策过程
 * 4. 不记录每一个子问题的解
 * 
 */

/**
 * 题目：
 * 汉诺塔问题
 * 有一种被称为汉诺塔(Hanoi)的游戏。
 * 该游戏是在一块铜板装置上，有三根杆(编号A、B、C)，
 * 在A杆自下而上、由大到小按顺序放置64个金盘。
 * 游戏的目标：把A杆上的金盘全部移到C杆上，并仍保持原有顺序叠好。
 * 操作规则：每次只能移动一个盘子，并且在移动过程中三根杆上都始终保持大盘在下，小盘在上，
 * 操作过程中盘子可以置于A、B、C任一杆上。
 */

const func = (i, start, end, other) => {
  if (i === 1) {
    console.log(`Move 1 from ${start} to ${end}`);
  } else {
    func(i - 1, start, other, end);
    console.log(`Move ${i} from ${start} to ${end}`);
    func(i - 1, other, end, start);
  }
}

const hani = (n) => {
  if( n > 0) {
    func(n, '左', '右', '中')
  }
}


/**
 * 汉诺塔要求把所有圆盘从左边移动到右边
 * 现给定一个数组arr表示各个圆盘当前在哪个柱子上
 * 1代表在左住上，2代表在中柱上，3代表在右柱上
 * 例如[3,3,2,1],表示现在有2个盘子在右柱上，1个在中柱上，1个在左柱上
 * 假如arr现在表示最优移动过程中的一个状态，返回是移动过程中的第几步
 * 如果不是游戏中的一个状态，返回-1
 * 
 */

 // 目标是把0-i的圆盘，从from全部挪到to上
 // 返回根据arr中的状态arr[0~i]，它是最优解第几步
 // 忽略掉左中右，只看每一步，该从那个柱子移到哪个柱子
 const process = (arr, i, from, other, to) => {
  if (i == -1) {
    return 0
  }
  if(arr[i] != from && arr[i] != to) {
    return -1
  }
  if (arr[i] === from) { // 第一大步没走完 现在from代表的柱子上一开始这里是左柱子
    return process(arr, i - 1, from, to, other);
  } else { // arr[i] == to
    const rest = process(arr, i - 1, other, from,to);
    if (rest == -1) {
      return -1
    }
    return (1 << i) + rest;
  }
}

const whichStep = arr => {
  if (!arr || !arr.length) {
    return -1
  }

  return process(arr, arr.length - 1, 1, 2, 3)
}


/**
 * 题目：
 * 打印一个字符串的全部子序列，包括空字符串
 * 
 */
// 方法一
const process1 = (strList, i, res) => {
  if ( i === strList.length) {
    console.log(res.join(''));
    return
  }
  const resKeep = res.slice();
  resKeep.push(strList[i])
  process1(strList, i+1, resKeep);
  const resNoInclude = res.slice();
  process1(strList, i+1, resNoInclude);
}
const printStrSubsequence1 = str => {
  const strList = str.split('');
  process1(strList, 0, []);
}

// 方法二
const process2 = (strList, i) => {
  if ( i === strList.length) {
    console.log(strList.filter(e=>e).join(''));
    return
  }
  process2(strList, i+1);
  const temp = strList[i];
  strList[i] = 0;
  process2(strList, i+1);
 strList[i] = temp
}
const printStrSubsequence2 = str => {
  const strList = str.split('');
  process2(strList, 0, []);
}

/**
 * 题目：
 * 打印一个字符串的全排列
 * 打印一个字符串的全部排列，要求不要出现重复的排列
 */

const process = (str, i, res) => {
  if (i === str.length) {
    res.push(str.join(''));
  }
  const visit = {}; // 防止有相同字符时产生相同的组合
  for(let j = i; j<str.length;j++) {
    const char = str[j];
    if(!visit[char]) {
      visit[char] = true;
      swap(str,i,j);
      process(str, i+1, res);
      swap(str, i, j);
    }
  }
}

const Permulatin = str => {
  const res = [];
  if (!str) {
    return res;
  }
  const list = str.split('');
  process(list, 0, res);
  return res;
}

/**
 * 题目：
 * 给定一个整型数组arr, 代表数值不同的纸牌排成一条线，玩家A和玩家B依次拿走每张纸牌
 * 规定玩家A先拿，玩家B后拿，但是玩家每次只能拿走最右边或者最左边的纸牌，
 * 玩家都很聪明，请返回最后获胜者的分数
 * 
 * 例如
 * arr = [1,2,100,4];
 * 开始时玩家A只能拿走1或者4，
 * 
 * 如果开始时玩家A拿走1，则数组变成[2,100,4],
 * 接下来玩家B可以拿走2或者4，然后玩家A继续拿牌...
 * 
 * 如果开始时玩家A拿走4，则数组变成[1,2,100],
 * 接下来玩家B可以拿走1或者100，然后玩家A继续拿牌...
 * 
 * 聪明的玩家A 不会先拿4，因为拿4之后，数组变成[1,2,100]
 * 玩家B 肯定会拿100，所以玩家A 会拿1，数组变成[2,100,4]
 * 玩家B不论怎么选，玩家A都会拿到100，然后获胜，分数为100 + 1 = 101
 * 
 * 若arr = [1,100,2]
 * 玩家A不管怎么拿，玩家B都会把100拿走，玩家B获胜，分数为100
 * 
 */

 function f(arr, i, j) {
  if(i === j) {
    return arr[i];
  }
  return Math.max(arr[i] + s(arr, i+1,j),arr[j] + s(arr, i, j-1))
}

function s(arr, i,j) {
  if(i == j) {
    return 0;
  }
  return Math.min(f(arr, i + 1, j), f(arr, i, j - 1))
}

const win1 = arr => {
  if(!arr || !arr.length) {
    return 0;
  }
  return Math.max(f(arr, 0, arr.length - 1), s(arr, 0, arr.length - 1));
}




/**
 * 题目：
 * 给你一个栈，请逆序这个栈，不能申请额外的数据结构，只能使用递归函数，如何实现
 */
const f = stack => {
  const result = stack.pop();
  if (!stack.length) {
    return result
  } else {
    const last = f(stack);
    stack.push(result);
    return last;
  }
}

const reverse = stack => {
  if(!stack.length) {
    return stack;
  }
  const i = f(stack);
  reverse(stack);
  stack.push(i);
  return stack;
}

/**
 * 题目：
 * 规定1和A对应， 2和B，3和C对应....
 * 那么一个数字字符串，比如“111”，就可以转化为“AAA”, "kA"和“AK”
 * 给定一个只有数字字符组成的字符串str,返回有多少种转化结果
 */

 const process = (str, i) => {
  if (i == str.length) {
    return 1;
  }
  if (str[i] === '0') {
    return 0;
  }
  if(str[i] == '1') {
    let res = process(str, i+1); // i 自己作为单独的部分后续有多少种方法
    if(i + 1 < str.length) {
      res += process(str, i + 2); // (i 和 i+1) 作为单独的部分，后续有多少种方法
    }
    return res;
  }
  if (str[i] === '2') {
    const res = process(str, i+1);// i 自己作为单独的部分后续有多少种方法
    // (i 和 i+1) 作为单独的部分并且没有超过26，后续有多少种方法
    if(i+1 < str.length && (str[i+1] >= '0' && str[i+1]<= '0')) {
      res += process(str, i+1);
    }
    return res;
  }
  // str[i] == '3' ~ '9'
  return process(str, i+1);
}

const generateCode = (str) => {
  const list = str.split('');
  return process(list, 0);
}


/***
 * 题目：
 * 给定两个长度都为N的数组weights和value,
 * weights[i] 和values[i] 分别代表i号物品的重量和价值
 * 给定一个正数bag,表示一个载重bag的袋子，你装的物品不能超过这个重量
 * 返回你能装下的最多的价值是多少？
 * 
 */
/**
 * 
 * @param {*} weights 所有重量
 * @param {*} values 所有价值
 * @param {*} i i...的货物自由选择， 形成最大的价值返回
 * @param {*} alreadyweight 之前做的决定，所达到的重量，alreadyweight
 * @param {*} bag 不能超过的重量
 * @returns 
 */
 const method1 = (weights, values, i, alreadyweight, bag) => {
  if(alreadyweight > bag) {
    return 0;
  }
  if(i == weights.length) {
    return 0;
  }
  return Math.max(
    method1(weights, values, i + 1, alreadyweight,bag),
    values[i] + method1(weights, values, i + 1, alreadyweight + weights[i],bag)
  );
}

const method2 = (weights, values, i, alreadyWeight,alreadyValue,bag) => {
  if (alreadyWeight > bag) {
    return 0;
  }
  if(i == values.length) {
    return alreadyValue;
  }
  return Math.max(
    method2(weights, values, i+1,alreadyWeight,alreadyValue,bag),
    method2(weights, values, i+1,alreadyWeight + weights[i], alreadyValue + values[i],bag)
  )
}

/**
 * 动态规划问题思路
 * 
 * 1. 尝试用递归方案解决
 * 2. 在递归实现基础上利用记忆化搜索(dp)进行优化，就是将递归过程计算得到的值缓存下来，减少重复计算
 * 3. 在记忆化搜索基础上，根据实现规律，建立严格表结构，根据结果的获取在表中位置的关系，进行二次优化
 * 4. 对严格表结构实现的逻辑再做进一步优化
 * 
 */

 /**
  * 题目：
  * N 代表 将会有1~N个位置，
  * 现在要想从S位置走到E位置，要求走K步，请问有多少种走法
  * 例如，
  * N = 5，位置情况就是 1 2 3 4 5
  * S = 2, E = 4， K = 4
  * 那么走的过程就可以是
  * 2 -> 3 -> 4 -> 5 -> 4
  * 2 -> 3 -> 4 -> 3 -> 4
  * ....
  * 问一共有多少种
  * 
  */

  // 递归实现
  const process = (n,cur,e,k) => {
    if (k == 0) {
      return cur === e ? 1 : 0;
    }
    if (cur === 1) {
      return process(n, 2, e, k-1);
    }
    if (cur === n) {
      return process(n, n-1, e, k-1);
    }
    return process(n, cur - 1, e, k-1) + process(n, cur + 1, e, k-1);
  }
  
  const walkWays = (n, s, e, k) => {
    return process(n,s,e,k)
  }

  // 可以发现process中n和e是不变的，cur和k是在变的，所以加入记录二者的缓存避免重复计算
  // 使用二维数组
  const process = (n,cur,e,k, cache) => {
    const val = cache[cur][k];
    if(val != -1) { 
      return val
    }
    if (k == 0) {
      cache[cur][k] = cur === e ? 1 : 0;
    } else if (cur == 1) {
      cache[cur][k] = process(n, 2, e, k-1, cache);
    } else if (cur == n) {
      cache[cur][k] = process(n, n-1, e, k-1, cache);
    } else {
      cache[cur][k] = process(n, cur - 1, e, k-1, cache) + process(n, cur + 1, e, k-1,cache);
    }
    return cache[cur][k]
  }
  
  const walkWays = (n, s, e, k) => {
    const cache = new Array(n+1).fill(null).map(e => new Array(k+1).fill(-1));
    return process(n,s,e,k, cache)
  }
  // 观察cache 二维数组形成的格子，以n为Y轴，k 为X轴,(0,0)在左下角，可以发现
  // cur = e, k = 0 的格子值 始终为1
  // cur != e, k = 0 的格子值 始终为0
  // cur = 1, 的格子值等于其左上方格子的值
  // cur = n. 的格子值等于其左下方格子的值
  // cur = 1~n, 的格子值等于其左下方格子的值 + 左上方格子的值
  // 进一步优化
  /**
   * 计算形成的矩阵
    [ [ 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 1, 0 ],
    [ 0, 0, 1, 0, 4 ],
    [ 0, 1, 0, 3, 0 ],
    [ 1, 0, 2, 0, 5 ],
    [ 0, 1, 0, 2, 0 ] ]
   */

  const walkWays = (n, s, e, k) => {
    const cache = new Array(n+1).fill(null).map(e => new Array(k+1).fill(0));
    cache[0]= new Array(k+1).fill(0);
    cache[e][0] = 1;
    for(let i = 1; i<k+1; i++) {
      for (let cur = 1; cur <n+1; cur++) {
        if (cur == 1) {
          cache[cur][i] = cache[2][i-1];
        } else if (cur == n) {
          cache[cur][i] = cache[n-1][i-1];
        } else {
          cache[cur][i] = cache[cur-1][i-1] + cache[cur+1][i-1];
        }
      }
    }
    return cache[s][k]
  }


  /**
   * 题目：
   * 有一个数组arr,数组中每一项的值代表该面值的硬币，不重复
   * 要想凑出aim大小的钱数，
   * 请问有多少种拼凑方法/最少需要的硬币个数
   * 
   * 例如，arr = [3,6,7,1,2], aim = 20
   * 可以用
   * 20个1块钱的硬币，
   * 10个2块钱的硬币，
   * 2个3块钱，2个7块钱 一共4个硬币实现
   * 最少的就是用4个硬币实现
   */
// 以下是求拼凑方法实现
const process = (arr, index, rest) => {
  if(index === arr.length) {
    return rest === 0 ? 1 : 0;
  }
  let ways = 0;
  for(let count = 0; arr[index] * count <= rest; count++) {
    ways += process(arr, index + 1, rest - arr[index] * count);
  }
  return ways;
}

const getWays = (arr, aim) => {
  return process(arr,0,aim);
}

// 优化
const getWays = (arr, aim) => {
  if(arr === null || !arr.length) {
    return 0;
  }
  let N = arr.length;
  const dp = new Array(N+1).fill(null).map(
    e => new Array(aim+1).fill(null)
  );
  dp[N][0] = 1;
  for(let index = N-1;index >=0; index--) {
    for(let rest = 0; rest <= aim;rest++) {
      let way = 0;
      for(let count = 0; arr[index] * count <= rest; count++) {
        ways += dp[index + 1][rest-arr[index] * count]
      }
      dp[index][rest] = ways;
    }
  }
  return dp[0][aim];
}

const getWays = (arr, aim) => {
  if(arr === null || !arr.length) {
    return 0;
  }
  let N = arr.length;
  const dp = new Array(N+1).fill(null).map(
    e => new Array(aim+1).fill(null)
  );
  dp[N][0] = 1;
  for(let index = N-1;index >=0; index--) {
    for(let rest = 0; rest <= aim;rest++) {
      dp[index][rest] =  dp[index + 1][rest];
      if(rest - arr[index] >= 0) {
        dp[index][rest] +=  dp[index][rest-arr[index]];
      }
    }
  }
  return dp[0][aim];
}

   /**
    * 题目：
    * 中国象棋马走日的走法，从(0,0)位置出发到(x,y)位置，只能走step步
    * 请问有多少种走法
    */

 /**
  * 
  * @param {目的地x轴} x 
  * @param {目的地y轴} y 
  * @param {棋盘x轴宽} n 
  * @param {棋盘y轴宽} m 
  * @param {步数} step 
  */
   const process = (x,y, n, m, step) => {
    if (x < 0 || x > n || y < 0 || y > m) {
      return 0;
    }
    if (step === 0) {
      return x === 0 && y === 0 ? 1 : 0;
    }
    const way1 = process(x-1, y+2, n,m, step - 1 );
    const way2 = process(x-1, y-2, n,m, step - 1 );
    const way3 = process(x-2, y+1, n,m, step - 1 );
    const way4 = process(x-2, y-1, n,m, step - 1 );
    const way5 = process(x+1, y-2, n,m, step - 1 );
    const way6 = process(x+1, y+2, n,m, step - 1 );
    const way7 = process(x+2, y+1, n,m, step - 1 );
    const way8 = process(x+2, y-1, n,m, step - 1 );
    return  way1 + way2 + way3 + way4 + way5 + way6 + way7 + way8;
  }
  
  const findWays = (x,y, n, m, step) => {
    return process(x,y, n, m, step);
  }
  // 增加缓存
  const process = (x,y, n, m, cache, step) => {
    if (x < 0 || x > n || y < 0 || y > m || step === 0 && (x != 0 || y !=0 )) {
      return 0;
    }
    if(cache[x][y][step] != -1) {
      return cache[x][y][step];
    }
    let count = 0;
    const nextStep = step - 1;
    const posInfo = [
      [x-1, y+2],
      [x-1, y-2],
      [x-2, y+1],
      [x-2, y-1],
      [x+1, y-2],
      [x+1, y+2],
      [x+2, y-1],
      [x+2, y-1]
    ]
    posInfo.forEach(item=> {
      const [nextX,nextY] = item;
      console.log(nextX,nextY);
      const way = process(nextX, nextY,n,m,cache,nextStep);
      if(nextX >= 0 && nextX <= n && nextY >= 0 && nextY <= m) {
        cache[nextX][nextY][nextStep] = way;
      }
      count +=way;
    })
    cache[x][y][step] = count;
    return cache[x][y][step];
  }
  
  const findWays = (x,y, n, m, step) => {
    const cache = new Array(n+1).fill(null).map(
      e => new Array(m+1).fill(null).map(
        item => new Array(step+1).fill(-1)
      )
    );
    cache[0][0][0] = 1;
    return process(x,y, n, m, cache, step);
  }

  // 观察cache 形成的3 维矩阵，以step为z轴，x, y 为平面xy轴
  // 可以发现，位于step层的点的值等于它下一层的相同位置的响应关系的8个点的值的和
  // 只有(0,0,0)=1,即只有原点到原点花费0步时是1，其他step = 0时，无论，x,y值是多少都是0
  const findWays = (x,y, n, m, step) => {
    const cache = new Array(n+1).fill(null).map(
      e => new Array(m+1).fill(null).map(
        item => new Array(step+1).fill(0)
      )
    );
    cache[0][0][0] = 1;
    for(let h = 1;h<step+1; h++) {
      for(let i = 0; i<= n; i++) {
        for(let j = 0; j <= m; j++) {
          let count = 0;
          const nextStep = h - 1;
          const posInfo = [
            [i-1, j+2],
            [i-1, j-2],
            [i-2, j+1],
            [i-2, j-1],
            [i+1, j-2],
            [i+1, j+2],
            [i+2, j-1],
            [i+2, j-1]
          ]
          posInfo.forEach(item=> {
            const [nextX,nextY] = item;
            let way = 0;
            if(nextX >= 0 && nextX <= n && nextY >= 0 && nextY <= m) {
              way = cache[nextX][nextY][nextStep]
            }
            count +=way;
          })
          cache[i][j][h] = count
        }
      }
    }
   return cache[x][y][step]
  }

/**
 * 题目：
 * Bob 存活问题，N * M 的区域，Bob从(row,col) 出发，走rest步之后，还能存活的方法数
 * 存活条件：不越界
 */

 const process = (n,m, row, col, rest) => {
  if (row < 0 || row === n || col < 0 || col === m) { // 走到边上或者m,n 以外都算越界
    return 0;
  }
  if((row === n || row === 0) && col<= m && col > -1 || (col === m || col === 0) && row > -1 && row <=n) {
    return 0;
  }
  if(rest === 0) { // 还在m,n 里面，且步数走完了
    return 1;
  }
  const posInfo = [
    [row-1, col],
    [row+1, col],
    [row, col+1],
    [row, col-1]
  ]
  let count = 0; // 还在m,n 里面，且步数还没走完，可以向上下左右走
  const nextRest = rest - 1;
  posInfo.forEach(item=> { // 
    const [nextRow, nextCol] = item;
    count += process(n,m,nextRow,nextCol,nextRest);
  })
  return count;
 }

 // 增加缓存
 const process = (n,m, row, col, rest, cache) => {
  if (row < 0 || row === n || col < 0 || col === m) { // 走到边上或者m,n 以外都算越界
    if(row === n && col<= m && col > -1 || col === m && row > -1 && row <=n) {
      cache[row][col][rest] = 0;
    }
    return 0;
  }
  if(cache[row][col][rest] != -1) {
    return cache[row][col][rest];
  }
  if(rest === 0) { // 还在m,n 里面，且步数走完了
    cache[row][col][rest] = 1;
    return 1;
  }
  
  const posInfo = [
    [row-1, col],
    [row+1, col],
    [row, col+1],
    [row, col-1]
  ]
  let count = 0; // 还在m,n 里面，且步数还没走完，可以向上下左右走
  const nextRest = rest - 1;
  posInfo.forEach(item=> { 
    const [nextRow, nextCol] = item;
    const result = process(n,m,nextRow,nextCol,nextRest, cache);
    if(nextRow >= 0 && nextRow <= n && nextCol >= 0 && nextCol <= m) {
      cache[nextRow][nextCol][nextRest] = result;
    }
    count += result;
  })
  cache[row][col][rest] = count
  return cache[row][col][rest];
 }

const findWays = (n,m,row, col, rest) => {
  const cache = new Array(n+1).fill(null).map(
    e => new Array(m+1).fill(null).map(
      item => new Array(rest+1).fill(-1)
    )
  );
  return process(n,m, row, col, rest, cache)
}

// 观察cache 3维矩阵 rest 当z轴
// rest = 0, 在n,m 范围内的点都是1
// 在n, m 边上的点都是0；
// rest > 1的点 等于其下一层对应点上下左右4点的值的和

const findWays = (n,m,row, col, rest) => {
  const cache = new Array(n+1).fill(null).map(
    e => new Array(m+1).fill(null).map(
      item => new Array(rest+1).fill(0)
    )
  );
  for(let h = 0;h<rest+1; h++) {
    for(let i = 0; i< n; i++) {
      for(let j = 0; j <= m; j++) {
        if(h === 0 && i != n && i > 0 && j != m && j > 0) {
          cache[i][j][h] = 1;
        } else if(i === 0 || i === n || j === 0 || j === m) {
          cache[i][j][h] = 0;
        } else {
          let count = 0;
          const nextStep = h - 1;
          const posInfo = [
            [row-1, col],
            [row+1, col],
            [row, col+1],
            [row, col-1]
          ]
          posInfo.forEach(item=> {
            const [nextX,nextY] = item;
            let way = 0;
            if(nextX >= 0 && nextX <= n && nextY >= 0 && nextY <= m) {
              way = cache[nextX][nextY][nextStep]
            }
            count +=way;
          })
          cache[i][j][h] = count
        }
       
      }
    }
  }
  return cache[row][col][rest]
}

/**
 * 假设背包容量为w
 * 现有N带零食，第i带零食体积为v[i]
 * 请问在不超过背包容量的情况下，一共有多少可以放零食的方法
 * 思路：
 * 遍历N带零食，每到一袋零食可以选择要还是不要，每一种都算一种方法
 * 
 */
const process = (w, rest, i, v) => {
  if (i === v.length -1 && rest >= v[i]) {
    return 1;
  } 
  if(i < v.length && rest < v[i]) {
    return 0;
  }
  const putin = process(w, rest - v[i], i+1, v);
  const notPutin = process(w, rest, i+1, v);
  return putin + notPutin + 1;
}

const bagpack = (w, v) => {
  // + 1是遍历到最后一项，不要的情况
  return process(w,w,0,v)+1;
}

/**
 * 给定一个非负整数N,代表二叉树的结点个数，返回能形成多少种不同的二叉树结构
 * 
 * 思路：
 * 总要有一个根结点，那剩下的左右子树只能使用n-1个结点
 * 左树用1个结点的话，右树只需要处理n-2个结点可以形成多少种不同的二叉树，
 * 左树用2个结点的话，右树只需要处理n-3个结点可以形成多少种不同的二叉树
 * ...
 * 左树用i个结点的话，右树只需要处理n-1-i个结点可以形成多少种不同的二叉树
 * 
 * 每种情况的结果和就是最终的种类数
 */

const findCount = n => {
  if (!n) {
    return 1
  }
  if ([1,2].includes(n)) {
   return n
  }
  let count = 0;
  for (let i = 0; i< n; i++) {
   const leftWays = findCount(i);
   const rightWays = findCount(n-1-i);
   count += leftWays * rightWays;
  }
  return count;
}

// 进一步使用动态规划的概念优化

const findCount = n => {
  if (n < 2) {
    return 1
  }
  const dp = (new Array(n+1)).fill(0);
  dp[0] = 1;
  console.log(dp);
  for (let i = 1; i< n + 1; i++) {
    for(let j = 1;j < i + 1; j++) {
      dp[i] += dp[j-1] * dp[i-j];
    }
  }
  return dp[n];
}


 /**
  * 将给定数转成字符串，原则如下，1对应a，2对应b, ...26对应z, 
  * 例如12258，可以转换成‘abbeh’, 'aveh', 'abyh', 'lbeh' 和‘lyh’ 个数为5
  * 现在给任一数字，返回可以转换成不同字符串的个数
  * 
  */

const transforNumberToString = (str, index) => {
  // if(str.length === 1 && str != '0') {
  //   return 1;
  // }
  if(str.length === index) {
    return 1;
  }
  if (str[index] === '0') {
    return 0;
  }
  // let result = transforNumberToString(str.slice(1), 0);
  // if (index + 1 < str.length -1 && Number(str.slice(0,2)) < 27) {
  //   result += transforNumberToString(str.slice(2), 0)
  // }
  let result = transforNumberToString(str, index + 1);
  if (index + 1 < str.length -1 && Number(str.slice(index,index + 2)) < 27) {
    result += transforNumberToString(str, index + 2)
  }
  return result;
}

// 优化
const dpWays = str => {
  const n = str.length;
  const dp = (new Array(n+1)).fill(0);
  dp[n] = 1;
  dp[n -1] = str[n-1] === '0' ? 0 : 1;
  for(let i = n-2; n>=0;i--) {
    if(str[i] === '0') {
      dp[i] = 0;
    } else {
      dp[i] = dp[i + 1] + (Number(str.slice(i, i+2)) < 27 ? dp[i+2] : 0)
    }
  }

  return dp[0];
}

/**
 * 给定两个字符str1和str2,
 * 再给定三个整数，ic,dc,rc、
 * 分别代表插入，删除，替换一个字符的代价
 * 返回将str1转换成str2的最小代价
 * 
 * 思路：
 * 直接用动态规划思想
 * 计算上空串，并且将空串作为str1和str2的第一个字符。
 * 那么dp【i】【j】就代表从str1【0…i】->（转变为）str2【0…j】需要的花费
 * 这个花费来自于三个路径
 * 第一个路径：由插入得到。str1【0…i】先编辑成str2【0…j-1】，再由str2【0…j-1】插入到str2【0…j】
 * 即 dp【i】【j-1 】+ ic
 * 第二个路径，由删除得到。str1【0…i】先编辑成str1【0…i-1】，再由str1【0…i-1】转变为str2【0…j】
 * 即dp【i-1】【j】+dc
 * 第三个路径，由替换得到。
 * 而替换又分为两种情况：
 * 第一种为当前字符串匹配的情况：那么就等于dp【i-1】【j-1】
 * 第二种为当前字符串不匹配的情况：那么久等于dp【i-1】【j-1】+rc
 * 那么，最后dp【i】【j】的值为这四种情况中的最小值。
 */
const minCount1 = (str1, str2, ic,dc,rc) => {
  const length1 = str1.length;
  const length2 = str2.length;
  let dp = new Array(length1+1).fill(null).map(e => new Array(length2+1).fill(0));
  // 长度为i 的str1 变成长度为0的str2 需要的花费，只能删除操作
  for(let i = 1; i< length1 + 1; i++) {
    dp[i][0] = i * dc;
  }
  // 长度为0的str1变成长度为j的str2 需要的花费，只能插入操作
  for(let j = 1; j< length2 + 1; j++) {
    dp[0][j] = j * ic;
  }
  // 长度为i的str1变成长度为j的str2需要的花费
  for (i = 1; i<length1+1; i++) {
    for( j = 1; j< length2 +1; j++) {
      if(str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = dp[i-1][j-1] + rc;
      }
      dp[i][j] = Math.min(dp[i][j], dp[i-1][j] + dc);
      dp[i][j] = Math.min(dp[i][j], dp[i][j - 1] + ic);
    }
  }
  return dp[length1][length2]
}

/**
 * 动态规划的空间压缩技巧
 * 
 * 主要思想就是尝试用数组动态存放矩阵形成的结果
 * 
 * 矩阵下一行的值如果只跟上一行或者下一行的值有关，那么可以准备一个数组依次存放原来矩阵数据
 * 如果不仅依赖挨着的行，还依赖往上或者往下多行，那要准备多个一维数组，存放依赖的每行数据，用于计算下一行数据
 * 如果矩阵是3维度的,xyz型的，那就准备一个二维矩阵表示当前层，由当前层数据算出下一层数据，道理一样
 * 
 */

/**
 * 给你一个二维数组，其中每个数都是正数，要求从左上角到右下角，
 * 每一步只能向右或者向下，沿途经过的数字要累加起来，
 * 最后请返回最小的路径和
 * 
 * 
 */

const process = (i,j,m,n, arr) => {
  if ( i > m || j > n) {
    return Number.MAX_SAFE_INTEGER;
  }
  if(i + 1 === m && j === n || i === m && j + 1 === n) {
    return arr[i][j];
  }
  return arr[i][j] + Math.min(process(i+1, j, m,n,arr), process(i,j+1,m,n,arr));
}


/**
 * 约瑟夫杀人算法变形
 * 每次数的要杀的人是从这一轮开始的那个人拿到的编号
 * 编号是几数几个人
 * 
 * 某公司招聘，有n 个人入围，HR在黑板上写下m个正整数
 * a1,a2,...am
 * 用作n个人循环领取的临时编号
 * n个人原始编号顺序依次是0, 1, ... n-1
 * 现在从原始编号0这个人开始领取临时编号
 * 0到n-1个人领到的临时编号依次是
 * a1,a2,...am, a1,a2,...am,...a(n%m)
 * 都领完后，看原始编号0这个人手上的临时编号a1, 
 * 从原始编号0这个人开始数，输到第a1个人，
 * 把第a1这个人淘汰，假设这个人原始编号是x
 * 下一轮从x+1开始
 * 看x+1手上的临时编号是几，数几个人，然后淘汰，
 * 以此多轮淘汰后，剩一个人，
 * 返回该人的原始编号
 * 
 * 方法论： 动态规划里面的斜率优化
 * 思路： 
 * 先实现约瑟夫杀人问题
 * 依赖剃刀函数 y = x % i
 * i是个固定值
 * 图像会是这样
 * |
 * |
 * |  /    /    /
 * | /    /    /
 * |/____/____/___________
 * 
 * 约瑟夫杀人问题每次数人的个数一致，假设为m
 * 杀到最后一个人的时候那个人当前轮的编号固定是1，
 * 如果有可以从最后一个人往前推原始编号的函数，那么一次往前推即可
 * 
 * y = f(len,x)
 * i表示该轮人数，x表示下一轮即人数为len-1时，最后那个人的该轮编号
 * y就是人数为len时最后一个人对应的结点编号
 * m会在该函数中用于数数
 * 
 * 例如y = f(2, 1)
 * y表示剩两个人时，最后那个人在这一轮里面的编号是几
 * 
 * 求该关系前，先看一下每一轮里面人的位置和数数编号的关系
 * 人位置从1-n,人数为len,循环数
 * 1-n 对应的编号关系就是1，2,3,...m,1,2,3,...m
 * 类似于剃刀函数，参考剃刀函数
 * 可以得到每个人位置=(当前轮的编号 - 1) % len + 1
 * 比如1个人该轮数数编号是k,那他的位置就是（k-1）%n + 1
 * 
 * 在看一下杀完一次人之后，新老编号的对应关系
 * 假设原来编号
 * 1,2,3,4,5,6,7, 3号被杀，那么下一轮编号变成
 * 5,6,-,1,2,3,4
 * 即1对应5,2对应6,4对应1,5对应2,6对应3,7对应4
 * 再联系剃刀函数
 * 可以得到式子1：
 * 老编号= （(新编号-1）+ 被杀被杀编号S（这里是3）) %len + 1
 * len表示老编号对应轮的长度
 * 
 * 根据上面编号和位置关系
 * 位置=(当前轮的编号 - 1) % n + 1
 * 现在计算当前轮数到m对应的1-n中的位置
 * 也就是是报数为m的那个人，也就是该轮要被杀的人
 * 带进去算出来的结果就是这个人在1-n中的位置x
 * 这个位置x就是老编号里面被杀人的位置，也就是s
 * s = (m -1) %len + 1,
 * 数到m就杀人
 * 
 * 代入式子1：
 * 老编号 = (新编号 + （m-1）%len)%len + 1;，继续化简
 * 老编号 = (新编号 + m-1)%len + 1;
 * 
 * 
 * 回到本题，相当于每轮在数的m的值在变
 * 
 */

 // 约瑟夫杀人长度为i个人，数到m就杀人，最终活下来的是几

 const getLive = (i, m) => {
  if(i === 1) {
   return 1;
  }
  return (getLive(i-1, m) + m -1)%i + 1;
}

// 公司招聘
const nextIndex = (size, index) => index == size -1 ? 0 : index + 1;
const no = (n, arr, index) => {
  if(n == 1) {
    return 1
  }
  // 老 = （新 + m -1）% i + 1
  return (no(n-1, arr, nextIndex(arr.length, index)) + arr[index] -1 ) % n + 1
}
// 0到n-1个人依次循环取用arr中数字杀n-1轮，返回的活的人编号
const getLive = (n, arr) => no(n, arr, 0)

 /**
  * 动态规划状态依赖技巧
  * 
  * 给定一个正整数，求裂开的的方式有多少种
  * 比如
  * 1 => (1) 1种
  * 2=> (1,1) (2) 2种
  * 3=>(1,1,1)(1,2),(3) 3种
  * 4=>(1,1,1,1)(1,1,2)(1,3)(2,2)(4) 5种
  * 
  */

  // 方法一
  /**
   * pre, 裂开的前一个部分
   * rest, 还剩多少值需要裂开，要求列出来的第一部分不能比pre小
   * 返回裂开方法数
   */
  const process = (pre, rest) => {
    if (rest === 0) {
      return 1; // 之前裂开的方案，构成了1中方法
    };

    if (rest < pre) {
      return 0
    }
    let ways = 0
    for(let i = pre; i<rest; i++) {
      ways +=process(i, rest - i);
    }
    return ways;
  }
  const ways1 = n => {
    if(n<1) {
      return 0;
    }
    return process(1, n);
  }
  
  // 方法二
  // 斜率优化: 当前格子值需要枚举行为时，自己附近几个格子的值能否代表枚举行为
  const ways2 = n => {
    if (n < 1) {
      return n
    }
    const dp = (new Array(n + 1).fill(null)).map(e => (new Array(n + 1).fill(0)));
    for(let pre = 1; pre<n+1;pre++) {
      dp[pre][0] = 1; // 第一列，rest = 0; 算一种方法
      dp[pre][pre] = 1; // 对角线上pre=== rest, 裂开方式就是当前rest他自己，1中方法
    }
    for(let pre = n - 1; pre>0; pre--) {
      for(let rest = pre + 1; rest <= n; rest++) {
        // 暴力递归转换后进行斜率优化
        // dp[pre + 1][rest] 代表了除 dp[pre][rest - pre] 以外其他枚举值之和
        dp[pre][rest] = dp[pre + 1][rest] + dp[pre][rest - pre]
      }
    }
    return dp[1][n]
  }
  
/**
 * 现有n1  + n2 种面值的硬币，
 * 其中n1种为普通币，可以取任意枚，
 * n2种为纪念币，每种最多只能取一枚
 * 每种硬币有一个面值，问能用多少种方法拼出m的面值？
 * 
 * 思路：
 * 预处理一下，先算出只用n1 类型的硬币和只用n2类型硬币，拼出0-m面值的方法数
 * 再用n1 硬币 拼出x面额，有a种方法，
 * 剩下m-x面额用n2硬币拼出有b种方法
 * 所有情况a*b累计和就是最终方法数
 */