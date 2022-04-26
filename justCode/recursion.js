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
