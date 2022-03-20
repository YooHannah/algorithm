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