/**
 * 字符串相关的问题
 */


/**
 * 给定一个计算式的字符串，返回计算式计算结果
 * 例如str = '48*(70-65)+8*1', 返回-1816
 * 
 * 思路：
 * 将数据和符号依次进栈
 * 如果栈顶是乘除号，从栈中pop出符号和数字，跟当前数字计算后再入栈
 * 如果是左括号，记录下当前位置，从当前位置往后计算，步骤同上
 * 直到遇到右括号，将所有值从栈中pop出，计算结果再返回继续计算
 * 
 */
const highCalculate = (num, stack) => {
  if(num) {
    const currLast = stack.pop();
    if(currLast == '*') {
      const preNum = stack.pop(); 
      stack.push(Number(num) * preNum);
    } else if(currLast == '/') {
      const preNum = stack.pop(); 
      stack.push(Number(num) / preNum);
    } else if(currLast) {
      stack.push(currLast);
      stack.push(Number(num));
    } else {
      stack.push(Number(num));
    }
  }
}
const calculate = (str, pos) => {
  const list = str.split('');
  const stack = [];
  let num = '';
  let i = -1;
  for(i= pos; i< list.length; i++) {
    const char = list[i];
    if(Number(char)) {
      num = `${num}${char}`;
      if ( i === list.length -1) {
        stack.push(Number(num));
      }
    } else {
      highCalculate(num, stack);
      if(char === '(') {
        const {result, currPos} = calculate(str, i+1);
        highCalculate(result, stack); // 括号前面可能是乘除
        i = currPos;
      } else if(char === ')') {
        break;
      } else {
        stack.push(char);
        num = '';
      }
    }
  }
  let count = stack[0];
  for(let m = 1; m < stack.length; m +=2) {
    const operator = stack[m] == '+';
    const next = stack[m+1];
    count = operator ? count +  next : count - next; 
  }
  return {
    result: count,
    currPos: i
  }
}

/**
  * 现有一个去重的字符数组
  * 例如 arr = ['a', 'b', ... 'z'];
  * 由arr中字符组成的字符串与数字形成这样的关系
  * a,b,...z,aa,ab,...az,ba,bb,...zz,aaa,...zzz,aaaa,...
  * 1,2,...26,27,28,...52,53,54,...702,703,...18278,18279,...
  * 求给定数组形成的字符串与数字的互转函数
  * 
  * 思路：
  * 使用伪x进制思想
  * 原来arr数组有多少字符使用几进制
  * 先把原数字转换成伪进制
  * 伪进制上每一位数字是几，代表取arr上哪个位置字符
  * 再转换成字符
  * 
  * 伪X进制思想：
  * 以伪7进制为例
  * 每一位上只能是1-7这个几个数字，每一位所带的幂次方跟二进制相同
  * 例如
  * 伪7进制的数673 转10进制的转换过程为：
  * 6 * 7^2 + 7 * 7 ^ 1 + 3 * 7 ^ 0
  */

 const generateTransformTool = arr => {
  const length = arr.length;
  const numToString = num => {
    if (num <= length) {
      return arr[num-1];
    }
    const list = [];
    num = num;
    let power = 0;
    while(num) {
      const nextlevel = Math.pow(length, power);
      if(num >= nextlevel) {
        list.push(1);
        num = num - nextlevel;
        power++
      } else {
        power--;
        const basic = Math.pow(length, power);
        const count = Math.floor(num / basic);
        list[power] += count;
        num = num - count*basic;
      }
    }
    return list.reverse().map(e => arr[e-1]).join('');
  }

  const stringToNum = str => {
    const list = str.split('').map(e => 1 + arr.findIndex(char => char === e)).reverse();
    let sum = 0;
    list.forEach((val, index) => {
      sum+=val * Math.pow(length, index);
    })
    return sum;
  }
  return {
    numToString,
    stringToNum
  }
}

/**
 * 给定两字符串str1和str2,求两个字符串的最长公共子串
 * 动态规划空间压缩应用
 * 
 * 思路：
 * 子串必须连续
 * 想想dp是一张str1.length * str2.length的表
 * dp[i][j]表示str1以str1[i]结尾，str2以str2[j]结尾时，最长公共子串长度
 * 整张表的最大值就是答案
 * 
 * 对于第一行第一列来说，str1[i]，str2[j]相等dp[i][j]就是1，不等dp[i][j]就是0
 * 其他位置上不等dp[i][j]肯定是0
 * 相等的位置上，等于左上角的值 + 1，dp[i-1][j-1]保障str1和str2都往前移一个的效果
 * 因为dp[i][j] 位置上两个 字符相同，所以就看前面的字符相同的长度是多少
 * 所以 dp[i][j] = dp[i-1][j-1] +1
 *  这样整张表就可算出来，然后找最大值
 * 
 * 优化：
 * 因为第一行的值可以确定，dp[0][str2.length -1], dp[0][str2.length -2]，...dp[0][0]
 * 那么根据dp[i][j] = dp[i-1][j-1] +1
 * 利用dp[0][str2.length -2]就可以算出dp[1][str2.length -1],
 * 利用dp[0][str2.length -3]就可以算出dp[1][str2.length -2]， dp[2][str2.length -1]
 * 以此类推，按从左上到右下方向的对角线可以一次计算出表中每个值
 * 我们在计算过程中只要存折最大值即可，其他值不用存
 * 所以就可以实现一个变量代替一张表的效果
 * 
 * 
 * 
 */
// 实现1
 const getMaxChild = (str1, str2) => {
   const len1 = str1.length;
   const len2 = str2.length;
   let maxLen = -1;
   for (let i = len2 -1; i>=0; i--) {
      let currentValue =  str1[0] === str2[i] ? 1 : 0;
      maxLen = Math.max(maxLen, currentValue);
      const count = len2 -1 -i;
      for(let j = 1; j<=count && j<len1;j++){
        currentValue = str1[j] === str2[i+j]  ? currentValue + 1 : 0;
        maxLen = Math.max(maxLen, currentValue);
      }
   }

   for (let m = 1; m<len1; m++) {
    let currentValue =  str1[m] === str2[0] ? 1 : 0;
    maxLen = Math.max(maxLen, currentValue);
    const count = len1 -1 -m;
    for(let n = 1; n<= count && n< len2; n++){
      currentValue = str1[m+n] === str2[n]  ? currentValue + 1 : 0;
      maxLen = Math.max(maxLen, currentValue);
    }
   }
   return maxLen;
 }

// 实现2

const getMaxChild = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  let max = -1;
  let row = 0;
  let col = len2 - 1;
  let end = 0;
  while(row < len1) {
    let i = row;
    let j = col;
    let len = 0;
    while(i<len1 && j <len2) {
      if (str1[i] === str2[j]) {
        len++;
      } else {
        len = 0;
      }
      if(len > max) {
        end = i;
        max = len;
      }
      i++;
      j++;
    }
    if (col > 0) {
      col--
    } else {
      row++
    }
  }
  console.log(end,max)
  return str1.substring(end - max +1, end +1) // 返回最长子串
}

 /**
 * 给定两字符串str1和str2,求两个字符串的最长公共子序列
 * 动态规划空间压缩应用
 * 
 * 思路：
 * 公共子序列可以不连续
 * dp[i][j]表示str1以str1[i]结尾，str2以str2[j]结尾时，最长公共子序列长度
 * dp[i][j]的值来自一下四种可能性
 * 子序列
 * 1.既不以str1[i]也不以str2[j]，这种情况dp[i][j] = dp[i-1][j-1]
 * 2.以str1[i]但不以str2[j]，这种情况dp[i][j] = dp[i][j-1]
 * 3.不以str1[i]但以str2[j]，这种情况dp[i][j] = dp[i-1][j]
 * 4.既以str1[i]也以str2[j]，即str1[i] == str2[j]，这种情况dp[i][j] = dp[i-1][j-1] + 1
 * 
 * 四种可能性最大值就是dp[i][j]的值
 * 观察可发现每个格子会依赖自己左边，左上，和正上方的格子
 * 
 * 对于第一行第一列来说，str1[i]，str2[j]相等dp[i][j]就是1，不等dp[i][j]就是0
 * 剩下的每个格子，从dp[1][1]开始就都可以算出值
 * 在填表过成中可以寻找最大值
 * 
 */

const getMAXChildSorted = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = (new Array(len1).fill(null)).map(e => (new Array(len2).fill(0)));
  let row = 0;
  let max = 0
  while(row < len1) {
    let col = 0
    while(col<len2){
      const same = str1[row] === str2[col];
      if(col > 0 && row > 0) {
        dp[row][col] = Math.max(
          dp[row-1][col],
          dp[row][col-1],
          same ? dp[row-1][col-1] + 1 : dp[row-1][col-1]
        )
      } else {
        dp[row][col] = Number(same);
      }
      max = Math.max(max, dp[row][col])
      col++
    }
    row++
  }
  return max
 }

// 在范围上尝试模型，进行可能性分析

/**
 * 给定一个字符串str,求最长回文子序列，注意区分子序列和子串的不同
 * 
 * 思路：
 * 计算str[i,...j]范围内最长回文子序列
 * dp[i][j] 就表示str[i,...j]范围内最长回文子序列
 * dp[len-1][len-1]就是答案
 * dp会是一个len * len 的二维表，且对角线右上有效，左下角无效
 * 因为左下角i<j
 * 
 * basic场景
 * dp[i][i] = 1;
 * dp[i][i+1] = str[i] === str[i+1] ? 2: 1;
 * 
 * 其他dp[i][j] 最长回文子序列按可能性分析可能会有以下几种情况
 * 
 * 1. 以i开头，不以j结尾 dp[i][j] = dp[i][j-1]
 * 2. 不以i开头，以j结尾 dp[i][j] = dp[i+1][j]
 * 3. 不以i开头，不以j结尾 dp[i][j] = dp[i+1][j-1]
 * 4. 以i开头，以j结尾, 说明str[i] === str[j], dp[i][j] = dp[i+1][j-1] + 2;
 * 
 * 以上四种情况取最大值
 * 
 * dp[i][j]依赖左，左下，下三个值，表从右下开始填
 * 
 */

const getMaxHuiWen = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 1;
    dp[i][i+1] = str[i] === str[i+1] ? 2: 1;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = Math.max(
        dp[row][col -1],
        dp[row+1][col],
        str[row] === str[col] ? dp[row+1][col-1] + 2 :  dp[row+1][col-1]
      )
      col++
    }
    row--;
    col = row + 2;
  }
  console.log(dp)
  return dp[0][len-1]
}


/**
 * 给定一个字符串，可以在str任意位置添加字符使原字符变成回文字符串
 * 求需要添加最少字符数时生成的回文字符串
 * 
 * * 思路：
 * 计算str[i,...j]范围内至少添加的个数
 * dp[i][j] 就表示str[i,...j]范围内至少添加的个数
 * dp[len-1][len-1]就是答案
 * dp会是一个len * len 的二维表，且对角线右上有效，左下角无效
 * 因为左下角i<j
 * 
 * basic场景
 * dp[i][i] = 0;
 * dp[i][i+1] = str[i] === str[i+1] ? 0: 1;
 * 
 * 其他dp[i][j] 至少添加的个数按可能性分析可能会有以下几种情况
 * 
 * 1. str[i] != str[j] ,先把[i,...j-1] 范围上整成回文，最后加1把str[j] 加在开头 
 *    dp[i][j] = dp[i][j-1] + 1
 * 2. str[i] != str[j] ,先把[i+1,...j] 范围上整成回文，最后加1把str[i] 加在结尾 
 *    dp[i][j] = dp[i+1][j] + 1
 * 3. str[i] == str[j] ,先把[i+1,...j-1] 范围上整成回文 
 *    dp[i][j] = dp[i+1][j-1]
 * 
 * 以上情况取最小值
 * 
 */
const getMaxHuiWen = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 0;
    dp[i][i+1] = str[i] === str[i+1] ? 0 : 1;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = Math.min(
        dp[row][col -1] + 1,
        dp[row+1][col] + 1,
        str[row] === str[col] ? dp[row+1][col-1] : Number.MAX_VALUE
      )
      col++
    }
    row--;
    col = row + 2;
  }
  console.log(dp)
  return dp[0][len-1]
}

/**
 * 给定一个字符串str,通过去除字符串中的字符，使原字符串变成回文字符串
 * 请问有多少种不同的方案？
 * 如果移除的字符组成的序列不一样，归为不同的方案
 * 
 * 思路：
 * 范围内尝试
 * dp[i][j] 表示str[i...j] 范围内去除的方案数dp[0][str.len-1]就是答案
 * 
 * 对于str[i..j] 形成的回文字符串可以从以下几种情况分析
 * 
 * 1. 不以i开头，不以j结尾
 * 2. 不以i开头，以j结尾 
 * 3. 以i开头，不以j结尾
 * 4. 以i开头，以j结尾
 * 
 * 方案互斥数之和就是答案
 * 
 * dp[i][j -1] 包括1,3两种情况
 * dp[i+1][j] 包括1，2 两种情况
 * 
 * dp[i][j -1] + dp[i+1][j] - dp[i+1][j-1] 就是1,2,3情况之和
 * 
 * 第四情况说明str[i] === str[j], 
 * 把二者单独拿出来就可以组成一种方案
 * 剩下就是 dp[i+1][j-1]
 * 第四种情况的方案数就是dp[i+1][j-1] + 1
 * 
 * 加起来就是 dp[i][j -1] + dp[i+1][j] + 1
 * 
 * basic场景
 * dp[i][i] = 1;
 * dp[i][i+1] = str[i] === str[i+1] ? 3: 2;
 * 
 * 
 */

const getChangeHuiWenWays = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 1;
    dp[i][i+1] = str[i] === str[i+1] ? 3 : 2;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = str[row] === str[col] ? dp[row][col -1] + dp[row+1][col] + 1 : dp[row][col -1] + dp[row+1][col] - dp[row+1][col -1]
      col++
    }
    row--;
    col = row + 2;
  }
  return dp[0][len-1]
}

/**
 * 给定一个字符串str,返回把str全部切成回文子串的最小分割数
 * 例如：
 * aba 本身就是回文，不用切割返回0
 * acdcdcdad, 切两次变成3个回文子串， a , cdcdc, dad
 * 
 * 思路：
 * 从左往右尝试，[i...len-1]找最小值
 * 判断str[0,,,,i]是否是回文，
 * 
 * 是的话，把0-i当做分割的第一部分，
 * 计算剩下的str[i+1, ..len-1] 最小分割数然后+1 
 * 每轮结果跟当前最小值比较更新最小值
 * 
 * 不是的话，不参数比较，不符合切割要求
 * 
 * 优化，预处理字符串，获取0-i的字符串是否是回文字符串，
 * 将判断过程转为查表过程
 * 
 * dp[i] 表示从i到len -1 的 最小分割数,切几刀
 * 答案是dp[0]
 * 
 */

const getRecord = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = true;
    if(i<len -1) {
      dp[i][i+1] = str[i] === str[i+1];
    }
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = str[row] === str[col] && dp[row+1][col-1]
      col++
    }
    row--;
    col = row + 2;
  }
  return dp
}
const findMinCut = str => {
  const len = str.length;
  const record = getRecord(str);
  const dp = new Array(len + 1).fill(0);
  dp[len] = -1;
  dp[len - 1] = 0;
  dp[len - 2] = str[len - 1] === str[len-2] ? 0 : 1;
  for(let i = len - 3; i>=0; i--) {
    dp[i] = len - i;
    for(let j = i;j<len;j++) {
      if (record[i][j]) {
        dp[i] = Math.min(dp[i], dp[j + 1] + 1);
      }
    }
  }
  console.log(dp)
  return dp[0]
}

/**
 * 判断一个由[a-z]字符构成的字符串和一个包含'.'和'*'通配符的字符串是否匹配
 * '.'匹配任一单一字符，'*' 匹配0个或者多个'*'前面的字符
 * 输入的字符串长度不会超过100，且不为空
 * 
 * 思路：
 * 看当前ei下一个是不是*，
 * 不是*的话，当前匹配的位置si相同往下走，不同则返回true
 * 是*的话看 ei + 2之后能不能跟si之后匹配，继续判断比较
 */
// 方法一： 递归实现
// 检查是否是符合要求的字符串和校验字符串
const isValid = (str, exp) => {
  // 不能有匹配符
  if (str.includes('*') || str.includes('.')) {
    return false
  }
  // 开头不能是*，连续两个不能是*
  for(let i = 0; i<exp.length; i++) {
    if (exp[i] === '*' && (!i || exp[i+1] === '*')) {
      return false
    }
  }
  return true
}

const process = (str, exp, si, ei) => {
  // 比较到最后一个字符了看str是否也到了最后
  if (ei === exp.length) {
    return si === str.length
  }
  // ei 到了最后一个，或者exp下一字符不是*，当前位置相同后，一起往后移动继续比较
  if (ei + 1 === exp.length || exp[ei+1] != '*') {
    return si != str.length && (exp[ei] === str[si] || exp[ei] === '.') && process(str, exp, si+1,ei+1)
  }
  // exp当前字符下一个是*，依次判断*可以代表多少个字符，只要命中一种情况就匹配，返回true
  while(si != str.length && (exp[ei] === str[si] || exp[ei] === '.')) {
    if (process(str, exp, si, ei+2)) {
      return true
    }
    si++
  }
  return process(str, exp, si, ei+2);
}

const isMatch = (str, exp) => {
  if (!str || !exp) {
    return false;
  }
  return isValid(str, exp) && process(str, exp, 0, 0)
}

// 方法二： 递归改动态规划

const initDpMap = (s,e) => {
  const slen = s.length;
  const elen = e.length;
  const dp = (new Array(slen + 1).fill(null)).map(e => (new Array(elen + 1).fill(0)));
  dp[slen][elen] = true;
  for(let j = elen - 2; j > -1; j= j-2) {
    if (e[j] != '*' && e[j + 1] == '*') {
      dp[slen][j] = true
    } else {
      break;
    }
  }
  if (slen > 0 && elen > 0) {
    if (e[elen -1] === '.' || s[slen - 1] === e[elen - 1]) {
      dp[slen -1][elen -1] = true;
    }
  }
  return dp
}

const isMatchDpWay = (str, exp) => {
  if (!str || !exp || !isValid(str, exp)) {
    return false;
  }
  const dp = initDpMap(str,exp);
  for(let i = str.length -1; i > -1; i--) {
    for(let j = exp.length -2; j > -1; j--) {
      if (exp[j + 1] != '*') {
        dp[i][j] = (str[i] === exp[j] || exp[j] === '.') && dp[i + 1][j + 1];
      } else {
        let si = i;
        while(si != str.length && (exp[j] === str[si] || exp[j] === '.')) {
          if (dp[si][j + 2]) {
            dp[i][j] = true;
            break
          }
          si++
        }
        if(!dp[i][j]) {
          dp[i][j] = dp[si][j+2]
        }
      }
    }
  }
  return dp[0][0]
}

/**
 * 给定一个字符串str1和str2,求str1的子串中含有str2所有字符的最小字符长度
 * 
 * 例如str1 = 'abcde', str2 = 'ac'
 * str1子串中‘abc’ 满足，包含str2,且长度最短，返回3
 * str1 = '12345'， str2 = '344'
 * str1子串中没有包含str2的，所以返回0
 * 
 * 思路：
 * 题目只要求str1中包含str2中所有字符即可
 * 不用考虑str2字符顺序
 * 所以只需要计算在str1所有子串中包含str2所有字符的最短长度是多少
 * 利用双指针
 * 右指针一直往右直到找到str2所有字符
 * 当符合条件时，左指针右移，寻找最短子串
 * 当右移到不满足时，右指针继续右移
 */

const getMaxChild = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  let start = 0;
  let min = 0;
  let rest = len2;
  const str2Book = {}
  str2.split('').forEach(char => {
    str2Book[char] =  str2Book[char] ? str2Book[char] + 1 : 1
  })
 
  const keys = Object.keys(str2Book);
  for(let end = 0; end <len1; end++) {
    let cur = str1[end];
    if(keys.includes(cur)) {
     str2Book[cur]--;
     rest--
    }
    if (!rest) {
     let currentRest = Object.values(str2Book).reduce((prev, curr)=> prev + curr, 0);
     while(currentRest<=0) {
       min = Math.min(min, end - start + 1);
       const startcurr = str1[start];
       console.log(startcurr, min)
       if(keys.includes(startcurr)) {
        str2Book[startcurr]++;
        currentRest++;
       }
       start++;
     }
     rest = currentRest
    }
  }
  return min;
}