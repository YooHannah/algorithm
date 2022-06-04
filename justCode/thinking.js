
 /**
  * 假设s和m初始化 s = 'a', m = s
  * 在定义两种操作，第一种操作
  * m = s;
  * s = s + s;
  * 第二种操作 
  * s = s+m
  * 求最小的操作步骤数，可以将s拼接到长度等于n
  * 
  * 思路：
  * 1. 假如n 是质数，也就不是2的倍数，只能一个劲的执行第二种操作，N-1
  * 2. 假如n不是质数，那他就可以由多个质数因子组成，那单个质数因子操作数根据推测1得到n-1
  * 所有的质数因子就是指数因子和减去质数个数
  */
// 因子不包含1
const divSumAndCount = n => {
  let sum = 0;
  let count = 0;
  for(let i = 2; i<=n; i++) {
    while(n % i == 0) {
      sum +=i;
      count++;
      n /= i;
    }
  }
  return [sum, count];
}
// 是否是质数
const isPrim = n => {
  for(let i = 2; i<=n; i++) {
    if(n % i == 0) {
      return false
    }
  }
  return true;
}
const minOps = n => {
  if (n < 2) {
    return 0;
  }
  if (isPrim(n)) {
    return n - 1;
  }
  const [sum, count] = divSumAndCount(n);
  return sum - count;
}

/**
 * 给定一个数组arr,如果通过调整，
 * 可以做到arr中任意两个相邻的数字相乘都是4的倍数
 * 返回true, 如果不能返回false
 * 
 * 思路：
 * 
 * 分析数组中数据的情况
 * 假设有奇数a个，只有一个2因子的数有b个，含有4因子的数有c个
 * b如果等于0，
 * 组成==>奇4奇4奇4的结构可以保证相邻相乘是4的倍数
 * 那么c >= a-1才能保证相邻乘积都是4的倍数
 * 如果b不等于0，
 * 2后面跟的肯定是一个4因子的数，不能接奇数
 * a = 0, c >=0
 * a =1,c>=1
 * a > 1, c >= a
 * 所以 c >= a 可以保证所有这种情况
 * 
 */
const and4 = arr => {
  let odd = 0;
  let time2 = 0;
  let time4 = 0;
  arr.forEach(item => {
    const res = item % 4;
    if (res === 2) {
      time2++;
    } else if(!res) {
      time4++
    } else {
      odd++
    }
  })
  if (time2) {
    return time4 >= odd;
  } else {
    return time4 >= odd-1;
  }
}

/**
 * 给定一个数组arr长度为N，你可以把任意长度大于0且小于N的前缀作为左部分
 * 剩下的作为右部分，但是每种划分下都有左部分的最大值和右部分的最大值，
 * 请返回最大的，左部分最大值减去右部分最大值的绝对值，
 * 假设没有重复，都是正数
 * 
 * 思路：
 * 整个数组会有一个最大值，这个最大值被划分到哪部分就是哪部分的最大值
 * 假如最大值划到左部分
 * 右部分必须要至少有一个值，那个最右边的那个值无论什么时候都要被划分到右部分
 * 假如右部分的其他值有比最右值大的数，那么他就不是右部分最大值
 * 但是要求的差值绝对值会变小
 * 如果右部分没有比最右值大的，那么最右值就是右部分最大值
 * 所以结果就是让数组总体最大值减去最右值
 * 划到右部分同理
 * 
 */
const maxAbs = arr => {
  const left = arr[0];
  const right = arr[arr.length -1];
  const max = arr.sort((a,b) => b-a)[0];
  return Math.max(Math.abs(max-right), Math.abs(max-left));
}

/**
 * 如果一个字符串为str,把字符串的前面任意部分挪到后面形成的字符叫做str的旋转词
 * 比如
 * str = '12345',
 * 它的旋转词有‘23451’， ‘34512’，‘45123’ 和‘51234’
 * 
 * 现给定两个字符串a和b，请判断a和b是否互为旋转词
 * 例
 * a = 'cdab', b = 'abcd' 返回true
 * a = '1ab2', b = 'ab12' 返回false
 * a = '2ab1', b = 'ab12' 返回true
 * 
 * 思路：
 * 将原字符串拼接一个自己形成自己的两倍串，那它所有的旋转词都是他两倍串的子串
 */
const judge = (a,b) => {
  const doubleA = a + a;
  const doubleB = b + b;
  return doubleA.includes(b) && doubleB.includes(a);
}

/**
 * 给定一个数组arr,已知其中所有的值都是非负的，
 * 将这个数组看作一个容器，请返回容器能装多少水
 * 
 * 例如：
 * arr = [3,1,2,5,2,4],根据值画出的直方图就是容器形状，
 * 该容器可以装下5格水
 *            ____
 *            |5 |  _____
 *  ___       |  |  | 4 |         
 *  |3 |   ___|  |__|   |
 *  |  |___|2 |  |2 |   |
 *  |  | 1 |
 * 
 * 3125组成的凹陷处可储存3格水
 * 524组成的凹陷处可储存2格水
 * arr = [4,5,1,3,2],根据值画出的直方图就是容器形状，
 * 该容器可以装下2格水
 * 
 * 思路：
 * 求解每个柱子上方可容纳水的体积然后求和
 * 每个柱子上方可容纳水的体积等于其min(左柱子max, 右柱子max) - 当前柱子值
 * 假设结果是负值，说明当前柱子比左右两边所有柱子都高，那他上方无法存储水分，就是0
 */

const getVolumnOfWater = (arr) => {
  let volumn = 0;
  arr.forEach((col, index) => {
    if (index === 0 || index === arr.length -1) {
      volumn += 0;
    } else {
      const leftMax = arr.slice(0, index).sort((a,b) => b-a)[0];
      const rightMax = arr.slice(index+1).sort((a,b) => b-a)[0];
      volumn += Math.max(Math.min(leftMax, rightMax) - col, 0);
    }
  });
  return volumn
}

/**
 * 现在有咖啡机arr=[3,4,5], 每一项代表该咖啡机煮一杯咖啡需要的时间
 * 咖啡杯可以选择可重复利用的和一次性的，
 * 重复利用的咖啡杯需要清洗，洗咖啡杯的机器，只能一次洗一杯，洗一杯的时间是a,
 * 一次性咖啡杯可以自然降解，降解完成的时间是b
 * 先在有N个人需要喝咖啡并需要等咖啡杯清洗完或者降解完,才算完成喝咖啡的事
 * 请算出这帮人全都完成喝咖啡需要的最小用时
 * 假设喝咖啡不需要时间
 * 
 * 思路： 
 * 利用小根堆算出每个人煮完咖啡的时间
 * 然后分别计算洗咖啡杯用时和降解用时那个更快
 */

/**
 * 
 * @param {* 每个人煮咖啡喝完的时间N长的数组} drinks 
 * @param {* 轮到计算第几个人洗咖啡完最少用时} i 
 * @param {* 洗一只咖啡杯用时 } washtime 
 * @param {* 降解一只咖啡杯用时} dissolvetime 
 * @param {* 洗咖啡杯需要等待的时间，前面有人也在洗} washWattingTime 
 */
const washProcess = (drinks, i, washtime, dissolvetime, washWattingTime) => {
  if (i === drinks.length -1) {
    const wash = Math.max(drinks[i], washWattingTime) + washtime;
    const dissolve = drinks[i] + dissolvetime;
    return Math.min(wash,dissolve);
  }
  // 如果选择洗咖啡杯，用时
  const wash = Math.max(drinks[i], washWattingTime) + washtime;
  // 选择洗咖啡杯的话，
  // 剩下的人因此造成的完成时间最少和我完成的过程用时的最大值是整体最少用时
  const restTime = washProcess(drinks, i+1,washtime, dissolvetime, wash);
  const washAllTime = Math.max(wash, restTime);
  const dissolve = drinks[i] + dissolvetime;
  const dissolveAlltime = Math.max(dissolve, washProcess(drinks, i+1, washtime, dissolvetime, washWattingTime));
  return Math.min(washAllTime, dissolveAlltime);
 }
 /**
  * 
  */
 const enjoyCoffee = (machine, count,washtime, dissolvetime) => {
   // 存放咖啡机在什么时间可用，
   // key值为咖啡机煮咖啡时间，value为要等的时间
   // 二者相加表示用户喝完咖啡的时间
   // 整体里面每组相加和最小，就是该用户当前最少喝完咖啡要用的时间
   const machineAvaliableTime = new Map();
   machine.forEach(time => {
     machineAvaliableTime.set(time, 0);
   });
   const drinks = [];
   for(let i = 0;i<count;i++) {
     let mintime = Number.MAX_SAFE_INTEGER;
     let minKey = -1;
     machineAvaliableTime.forEach((value, key) => {
       const makeCoffeTime = key + value;
       if (makeCoffeTime < mintime) {
         mintime = makeCoffeTime;
         minKey = key;
       }
     })
     machineAvaliableTime.set(minKey, mintime);
     drinks[i] = mintime;
   }
   return washProcess(drinks, 0, washtime, dissolvetime, 0);
 }

 /**
 * 现在每台洗衣机上有不同数量的衣服需要洗
 * 需要将衣服平均分到每台洗衣机上才可以开始清洗
 * 每次只能从一台洗衣机上移走一件衣服
 * 例如
 * [1,0,5]表示3台洗衣机上现有衣服数量
 * 经过这些轮之后
 * 第一轮： 1    0 <- 5 ==> 1 1 4
 * 第二轮： 1 <- 1 <- 4 ==> 2 1 3
 * 第三轮： 2    1 <- 3 ==> 2 2 2
 * 一共移动了3轮，使得每台洗衣机上衣服数量相等
 * [2,3,2] 无论怎么移动都无法使洗衣机上衣服数量都相等，所以返回-1
 * 
 * 思路：
 * 因为每次只能挨个的移动衣服，
 * 所以每台洗衣机在完成平均数过程中都会产生需要移动衣服的次数
 * 这些次数里面的最大值，就是整个过程完成的轮数
 * 
 * 假设来到某个位置i，总衣服数目是sum, 最终洗衣机需要达到的平均数是avg
 * 
 * 如果i位置左边所有的洗衣机上衣服数量是leftSum
 * 最终需要达到的衣服数量是(i-1) * avg =>leftFinal
 * leftNeed = leftFinal - leftSum
 * leftNeed < 0,说明需要i位置洗衣机把衣服经过位置i洗衣机移到右边Math.abs(leftNeed)件
 * leftNeed > 0,说明需要i位置洗衣机把衣服经过位置i洗衣机移到左边leftNeed件
 * 移动多少件衣服意味着需要多少轮
 * 
 * 右边同样
 * 原来衣服数量rightSum = sum - leftSum -arr[i]
 * 最终需要达到的衣服数量 (arr.length - i -1) * avg => rightFinal
 * rightNeed = rightFinal - rightSum;
 * rightNeed < 0 ,需要经过洗衣机i从右边移动Math.abs(rightNeed)移动走
 * rightNeed > 0, 需要经过洗衣机i从左边移动rightNeed轮
 * 
 * 
 * 假设 
 * leftNeed > 0 && rightNeed > 0,  说明i位置上衣服有很多需要往左右分
 * 那么需要移走的次数就是 leftNeed + rightNeed
 * 
 * leftNeed < 0 && rightNeed < 0, 说明需要左右两端都往i位置洗衣机移动衣服
 * 因为没有说接收衣服每次只能一件，就是左右两边向位置移动可以同时在一轮里面进行
 * 所以每轮可以接收多件
 * 那么i位置至少需要接收max(Math.abs(rightNeed), Math.abs(leftNeed))
 * 
 * 同理 leftNeed > 0 && rightNeed < 0 或者leftNeed < 0 && rightNeed > 0
 * 位置接收衣服和移走衣服的数量最大值应该为移动的轮数
 * 
 * 
 */
const minOps = arr => {
  const sum = arr.reduce((prev,curr)=> prev + curr, 0);
  const { length } = arr;
  if (sum % length) {
    return -1;
  }
  const avg = sum / length;
  let leftSum = 0;
  let times = 0;
  for( let i = 0; i< length; i++) {
    const leftRest = leftSum - i * avg;
    const rightSum = sum - leftSum - arr[i];
    const rightRest = rightSum - (length - i - 1) * avg;
    if (rightRest < 0 && leftRest < 0) {
      times = Math.max(times, Math.abs(rightRest) + Math.abs(leftRest));
    } else {
      times = Math.max(times, Math.max(Math.abs(leftRest),Math.abs(rightRest)));
    }
    leftSum += arr[i]
  }
  return times;
}

/**
 * 一个完整的括号字符串定义如下
 * 1.空字符串是完整的，
 * 2.如果s是完整的字符串，那么（s）也是完整的
 * 3.如果s和t是完整字符串，那么他们拼接起来st也是完整的
 * 例如： ‘(()())’ 和‘(())()’是完整的字符串
 * ‘（））’， ‘（）（’ 和‘）’ 是不完整的括号字符串
 * 现在想要将不完整的任意一个括号字符串转化成一个完整的括号字符串，请问至少要添加多少个括号
 * 
 * 思路：
 * 分别统计当前字符'(' 和')' 个数，统计过程去掉可以配对的个数，二者之和就是需要添加的左右括号之和
 * 
 * 
 */
const needParenthese = str => {
  let leftCount = 0;
  let rightCount = 0;
  const length = str.length;
  for(let i = 0; i<length; i++) {
    if(str[i] === '(') {
      leftCount++
    } else {
      if (!leftCount) {
        rightCount++
      } else {
        leftCount--
      }
    }
  }
  return leftCount + rightCount
}

 /**
  * 对于上面的括号字符串定义深度
  * 1. 空字符串深度是0
  * 2. 如果X字符串深度是x,Y的深度是y,那么二者合起来的字符串'XY'的深度为max(x,y)
  * 3. 如果X字符串深度是x,那么‘（X）’的深度是x+1
  * 例如‘（）（）（）’ 深度是1，‘（（（）））’ 深度是3
  * 请算出合法括号字符串的深度
  * 
  * 思路： 声明计数count,遇到左括号加1，遇到有括号减1，count能够达到的最大值就是深度
  */
 const getStringCount = str => {
   let count = 0;
   let max = 0;
   for(let i = 0; i<str.length;i++) {
     if (str[i] === '(') {
      count++
      max = Math.max(max, count);
     } else {
       count && count--;
     }
   }
   return max
 }

 /**
  * 给定由左右括号形成的字符串，请找出最长的有效括号子串的长度
  * 子串意味着连续
  * 有效括号子串定义为在这段子串中，
  * 任何右括号都有对应左括号
  * 任何左括号都有对应右括号
  * 例如，str = '))((()))()())))()()'
  * 最长子串是((()))()()，长度为8
  * 
  * 思路：
  * 以每个位置上的字符当做有效字符串的最后一个字符计算长度
  * 当前位置上
  * 如果是(,即最后一个字符是（，那么绝对不能形成有效字符串，长度为0
  * 如果是），
  * 通过前一个字符的有效长度dp[i-1]，
  * 找到配对的位置j，
  * 如果是（，那么至少是dp[i-1] + 2,再看j前面是），看是否能连上，连上的话就是再加上dp[j-1]
  * 如果不是（，那么当前位置就无法形成有效子串，长度为0
  * 
  */

const validLength = str => {
  const dp = (new Array(str.length)).fill(0);
  let matchPos = 0;
  let maxLength = 0;
  for(let i = 1; i < str.length; i++) {
    if (str[i] === ')') {
      matchPos = i - dp[i-1] -1;
      if(matchPos >=0 && str[matchPos] === '(') {
        dp[i] = dp[i-1] + 2 + (matchPos ? dp[matchPos -1] : 0);
      }
    }
    maxLength = Math.max(maxLength, dp[i]);
  }
  return maxLength;
}

/**
 * 给定一个只由数字0和1，逻辑符号 & (与) | (或) 和 ^ (异或) 五种字符组成的字符串express
 * 再给定一个bool类型期待值desired，返回express能有多少种组合方式可以达到desired的结果
 * 举例：
 * express = "1^0|0|1".desired = false
 * 只有"1^（（0|0）|1）" 和 "1^（0|（0|1））" 两种组合可以得到false,返回2
 * express = "1".desired = false
 * 无组合，返回0
 * 
 */
const invalid = list => {
  const length = list.length;
 if(!(length & 1)) {// 字符数量是奇数
   return true;
 }
 // 该是数字的位置应该是数字
 for(let i = 0; i<length; i = i+2) {
   if (!['1', '0'].includes(list[i])) {
     return true;
   }
 }
 // 该是符号的位置应该是符号
 for(i = 1; i<length; i = i+2) {
   if (!['&', '|', '^'].includes(list[i])) {
     return true;
   }
 }
 return false;
} 
const process = (list, desired, L, R) => {
  if( L === R) {
    const char = list[L];
    let result = false;
    if(char === '1') {
     result = desired ? 1: 0;
    }
    if(char === '0') {
     result = desired ? 0: 1;
    }
    return result;
  }
  let count = 0;
  for(let i = L+1; i < R; i+=2) {
   let sign = list[i];
   if (sign === '*') {
     if(desired) {
       count += process(list, desired, L, i - 1) * process(list,desired, i + 1, R ); 
     } else {
       count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
       count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
       count += process(list, false, L, i - 1) * process(list,false, i + 1, R );   
     }
   }
   if(sign === '|') {
     if(desired) {
       count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
       count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
       count += process(list, true, L, i - 1) * process(list,true, i + 1, R );  
     } else {
       count += process(list, false, L, i - 1) * process(list,false, i + 1, R );
     }
   }
   if(sign === '^') {
     if(desired) {
       count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
       count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
     } else {
       count += process(list, true, L, i - 1) * process(list,true, i + 1, R );
       count += process(list, false, L, i - 1) * process(list,false, i + 1, R ); 
     }
   }
  }
  return count;
}
const methods = (express, desired) => {
  if(!express) {
   return 0;
  }
  const list = express.split('');
  if (invalid(list)) {
   return 0;
  }
  return process(list, desired, 0, list.length -1)
}

// 优化

const dpLive = (express, desired) => {
  const list = express.split('');
  const length = list.length;
  const tMap = new Array(length).fill(null).map(e => new Array(length).fill(0));
  const fMap = new Array(length).fill(null).map(e => new Array(length).fill(0));
  for(let i = 0; i< length; i+=2) {
    tMap[i][i] = list[i] === '1' ? 1:0;
    fMap[i][i] = list[i] === '1' ? 0:1;
  }
  for( let row = length - 3; row >= 0; row -=2) {
    for(let col = row + 2; col < length; col +=2) {
      for(let i = row + 1; i<col;i +=2) {
        const char = list[i];
        if (char === '&') {
          tMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '|') {
          tMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          tMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
          tMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '^') {
          tMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          tMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '&') {
          fMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
          fMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
        if (char === '|') {
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
        if (char === '^') {
          fMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
      }
    }
  }
  return desired ? tMap[0][length-1] : fMap[0][length-1];
}

/**
 * 给定两个集合a和b,分别包含整数元素个数 n 和 m 个
 * 定义magic 操作，】
 * 从一个集合中取出一个元素，放到另一个集合中，
 * 且操作过后，两个集合的平均值大于操作前
 * 注意：
 * 1. 不可以把一个集合的元素取空，这样就没有平均值了
 * 2. 值为x 的元素从集合b取出放入集合a.但集合a中已经有值为x的元素，则a的平均值不变
 *    因为集合元素不会重复，b的平均值可能会改变，因为x被取出了
 * 问最多可以进行多少次magic操作
 * 
 * 思路： 
 * 把平均值大的数组里面的
 * 小于其自己平均值
 * 但大于
 * 平均值小的数组的平均值
 * 的数移到平均值小的数组中
 */
const avg = arr => {
  const sum = arr.reduce((curr,prev) => curr + prev, 0);
  return sum / arr.length;
}
const maxOpt = (arr1, arr2) => {
  if (!arr1 || !arr1.length || !arr2 || !arr2.length) {
   return 0;
  }
  const arr1IsMore = avg(arr1) > avg(arr2)
  const moreArr = arr1IsMore ? arr1 : arr2;
  const lessArr = arr1IsMore ? arr2 : arr1;
  moreArr.sort((a,b) => a -b);
  let runTime = moreArr.length;
  let opt = 0;
  for(let i = 0; i< runTime;i++) {
    const cur = moreArr[i];
    if(cur < avg(moreArr) && cur>avg(lessArr) && !lessArr.includes(cur)) {
     moreArr.splice(i,1);
     runTime--;
     lessArr.push(cur);
     opt++;
     i--
    }
  }
  return opt
}

  /**
   * 将数字转化成中英文表达
   * 例如，
   * 17 => 十七，
   * 117 =>一百一十七
   * 21,230,123,456 => 21 Billion 230Million 123 Thousand 456
   */
// 转英文
const numTo19 = num => {
  if(num < 1 || num > 19) {
    return ''
  }
  const names = [
    'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Tweleve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'
  ];
  return names[num - 1];
}
const numTo99 = num => {
  if (num < 1 || num > 99) {
    return '';
  }
  if(num < 20) {
    return numTo19(num);
  }
  const high = Math.floor(num / 10);
  const tyName = [
    "Twenty", 'Thirsty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ]
  return `${tyName[high - 2]} ${numTo99(num % 10)}`;
}
const numTo999 = num => {
  if (num < 1 || num > 999) {
    return '';
  }
  if(num < 100) {
    return numTo99(num);
  }
  const high = Math.floor(num / 100);
  return `${numTo99(high)} Hundred ${numTo99(num % 100)}`;
}
const getNumberEngExp = num => {
  if (!num) {
    return 'Zero';
  }
  let res = '';
  if(num < 0) {
    res = 'Negative, ';
  }
  if( num === Number.MIN_SAFE_INTEGER) {
    res += 'Two Billion, ';
    num %= -2000000000
  }
  num = Math.abs(num);
  let high = 1000000000;
  let hightIndex = 0;
  const names = ['Billion', 'Millon', 'Thousand', ''];
  while(num != 0) {
    const cur = Math.floor(num / high);
    num %=high;
    if(cur) {
      res += numTo999(cur);
      res +=' ' + names[hightIndex] + (num == 0 ? ' ' : ', ');
    }
    high = Math.floor(high/1000);
    hightIndex++;
  }
  return res;
}
// 转中文
const numTo9 = num => {
  if(num < 1 || num > 9) {
    return ''
  }
  const names = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return names[num-1];
}
const numTo99 = (num, hasBai) => {
  if (num < 1 || num > 99) {
    return '';
  }
  if(num < 10) {
    return numTo9(num);
  }
  const shi = Math.floor(num / 10);
  if (shi === 1 && !hasBai) {
    return `十${numTo9(num % 10)}`;
  } else {
    return `${numTo9(shi)}十${numTo9(num % 10)}`;
  }
}
const numTo999 = num => {
  if (num < 1 || num > 999) {
    return '';
  }
  if(num < 100) {
    return numTo99(num,false);
  }
  let res = `${numTo9(Math.floor(num / 100))}百`;
  const rest = num % 100;
  if (!rest) {
    return res;
  } else if(rest >= 10) {
    res += numTo99(rest, true);
  } else {
    res +=`零${numTo9(rest)}`
  }
  return res;
}
const numTo9999 = num => {
  if (num < 1 || num > 9999) {
    return '';
  }
  if(num < 1000) {
    return numTo999(num);
  }
  let res = `${numTo9(Math.floor(num / 1000))}千`;
  const rest = num % 1000;
  if (!rest) {
    return res;
  } else if(rest >= 100) {
    res += numTo999(rest);
  } else {
    res +=`零${num1To99(rest, false)}`
  }
  return res;
}
const numTo99999999 = num => {
  if (num < 1 || num > 99999999) {
    return '';
  }
  const wan = Math.floor(num / 10000);
  const rest = num % 10000;
  if(!wan) {
    return numTo9999(rest);
  }
  let res = `${numTo9(wan)}万`;
  if (!rest) {
    return res;
  } else if(rest >= 1000) {
    res += numTo9999(rest);
  } else {
    res +=`零${numTo999(rest)}`
  }
  return res;
}

const getNumberChiExp = num => {
  if (!num) {
    return '零';
  }
  let res = '';
  if(num < 0) {
    res = '负';
  }
  num = Math.abs(num);
  const yi = Math.floor(num / 100000000);
  const rest = num % 100000000;
  if(!yi) {
    return `${res}${numTo99999999(rest)}`;
  }
  res += `${numTo9999(yi)}亿`;
  if (!rest) {
    return res;
  } else if(rest >= 10000000) {
    res += numTo99999999(rest);
  } else {
    res +=`零${num99999999(rest)}`
  }
  return res;
}

  /**
   * 现在有一这样规律的数组
   * [1,12,123,1234,...12345678910,1234567891011,...]
   * 求问从第i个元素到第r个元素中有多少个数能够被3整除
   * 
   * 思路：
   * 考虑到可以使用的最大数字，所以不能单纯的用相应位置上的数据直接去对3取余
   * 一个数能不能被3整除，等价于一个数上的每位之和能否被3整除
   * 假如当前元素位于n位置，那么这个数能否被整除可以这样计算
   * (n*(n+1)/2)%3
   */
  const specialCase = (i,r) => {
    let count = 0;
    for(let n = i; n<r +1; n++) {
      const can = (n*(n+1)/2)%3;
      if (!can) {
        count++
      }
    }
    return count;
  }

  
  /**
   * 现有一个数组arr，表示一条路需要照明的情况，
   * 每个元素不是'.' 就是'x', '.' 表示需要照明的地方，'X' 表示不需要，灯也照不到
   * 假如一个路灯放在poi位置，那么它可以照亮poi -1 ,poi, poi+1三个袁元素
   * 如果他们三个都是‘.’的话
   * 
   * 求问这条路需要多少路灯
   * 
   * 思路：
   * 判断当前元素是‘.’ 还是‘x’
   * 如果是x, 继续往后遍历
   * 如果是.，路灯数加1
   * 判断往后一个有没有越界
   * 越界的话，停止
   * 
   * 如果没有越界
   * 判断是x还是.
   * 假如现在位于curr
   * 如果是x,越过x 继续遍历, 相当于从curr + 2继续
   * 如果是., 连续越过两个，继续遍历 相当于从curr + 3继续
   * 因为如果是.,说明现在有两个. 连续，第三个元素无论是x还是. 
   * 都会需要一盏灯，然后从这组需要灯的位置继续往后
   * 
   * 
   */
  let needLamb = road => {
    const count = 0;
    for(let i = 0; i< road.length; i++) {
      if(road[i] === '.') {
        count++;
        const next = i + 1;
        if (next === road.length) {
          break
        }
        if (road[next] === '.') {
          i = i+2;
        } else {
          i = i + 1
        }
      }
    }
    return count;
  }


  /**
   * 给定一个数组A，长度n,有1<=A[i]<=n,且位于[1,n]的整数，
   * 其中部分整数会重复出现而部分不会出现
   * 找出[1,n]中所有未出现在A中的整数
   * 
   * 思路：
   * 尽可能的让i位置上的数据等于i+1,那么i位置上不等于i+1的数据就是没有出现过的数据
   */
  const findUnShowNumber = arr => {
    for(let i = 0; i < arr.length; i++) {
      while(arr[i] != i+1) {
        let pos = arr[i] -1;
        let temp = arr[pos];
        if(temp === pos + 1) {
          break;
        }
        arr[pos] = arr[i];
        arr[i] = temp;
      }
    }
    let count = 0;
    for(let i = 0; i < arr.length; i++) {
      if (arr[i] != i+1) {
        count++
      }
    }
    return count
  }

  /**
   * 现有一土豪想给主播冲人气从start刚好到达end,
   * 冲人气的方式有一下三种
   * a.点赞 花费x 个C币， 人气 +2
   * b.送礼 花费y 个C币，人气 * 2
   * c.私聊 花费z 个C币，人气 - 2
   * 其中end远大于start,且二者均为偶数
   * 求出土豪至少要花多少C币实现目的
   * 
   * 思路：
   * 递归
   * 分别用三种方式增加一次人气值后剩下的人气值如何增加的方式相加
   * 但是要注意边界条件
   * 从start到end过程，人气和花费C币数量都会递增，
   * 很有可能不会刚刚好到达end,
   * 那么要限制一下增加到多少不再尝试
   * 
   */
  /**
   * 
   * @param {之前用了多少C币} preMoney 
   * @param {当前人气值} curr 
   * @param {目标人气值} aim 
   * @param {增加2人气需要C币数量} add 
   * @param {翻倍人气需要C币数量} double 
   * @param {私聊花费C币数量} del 
   * @param {人气最高限制} limitAim 
   * @param {C币最多使用限制} limitCoin 
   */
  const process = (
    preMoney, curr, aim, add, double, del, limitAim, limitCoin
  ) => {
    if(
      curr > limitAim ||
      preMoney > limitCoin ||
      curr < 0
    ) {
      return Number.MAX_VALUE;
    }
    if(curr === preMoney) {
      return preMoney
    }
    let min = Number.MAX_VALUE;
    const p1 = process(preMoney+add, curr + 2, aim,  double, del, limitAim, limitCoin);
    if (p1 != Number.MAX_VALUE) {
      min = Math.min(p1, min);
    }

    const p2 = process(preMoney+double, curr * 2, aim,  double, del, limitAim, limitCoin);
    if (p2 != Number.MAX_VALUE) {
      min = Math.min(p2, min);
    }

    const p3 = process(preMoney+del, curr - 2, aim,  double, del, limitAim, limitCoin);
    if (p3 != Number.MAX_VALUE) {
      min = Math.min(p3, min);
    }
    return min;
  }
  const needC = (start, end, add, double, del) => {
    if(end - start < 0) {
      return -1
    }

    return process(preMoney, start, end, add, double, del, end*2, ((end-start)/2)*add);
  }


/***
* 现在输入一些数据，表示运营活动的相关情况
* 主播可以从任意活动开始，但是一定要将关联的后续活动参加完
* 
* 例如
* 
* 8 10
* 3 2000 0 1 1 0 0 0 0 0
* 3 4000 0 0 0 1 1 0 0 0
* 2 2500 0 0 0 1 0 0 0 0
* 1 1600 0 0 0 0 1 1 1 0
* 4 3800 0 0 0 0 0 0 0 1
* 2 2600 0 0 0 0 0 0 0 1
* 4 4000 0 0 0 0 0 0 0 1
* 3 3500 0 0 0 0 0 0 0 0
* 
* 第一行N和D，表示一共有N项活动，D表示活动周时长
* 0 < N <= 1000, 0 < D <= 10000
* 第1 ~ N + 1行描述每一个活动的信息
* 第一项表示参加活动需要时间
* 第二项表示将来可得报酬
* 之后的每一项表示和活动周内活动的关联关系
* 1表示有关联，0 表示没有关联
* 
* 例子中表示的活动从上到下标记为1 - 8
* 活动间关系如下
*       2  -       5
*    /      \    /    \
* 1            4 - 6  - 8
*    \      /    \    /
*       3          7
* 
* 互动由标记数字少的的指向数字大的
* 问一个主播从哪个活动开始直到完成最后一个活动，也就是活动8
* 能够获得最多报酬，且最少用时
* 
* 思路：
* 反正都要完成最后一个任务，那就从最后一个任务往回走开始计算
* 在每个活动结点维持一个天数-报酬Map结构
* 表示通过不同路径过来的情况下，累计活动天数可以拿到的报酬
* 全都遍历完后，计算每个结点下面Map表中找到天数最少报酬最多的一条数据
* 每个结点拿到后再做一次比较，找天数最少报酬最多的
* 
* 同级结点不在计算过程中仅保留天数少报酬多的情况是防止在遍历过程中出现
* 在当前路径累计报酬少，但是再往上面一个报酬多的情况，
* 因为移除报酬少的数据意味着不再继续一条路线的探索
*/

const findEfficiencyPay = (activityCount, days, matrix) => {
  const moneyMap = {};
  for(let i = activityCount - 1; i >= 0; i--) {
    const line = matrix[i];
    const day = line[0];
    const money = line[1];
    const nodeMap = [];
    for(let j = 2; j < activityCount + 2; j++) {
      const node = line[j];
      if(node) {
        console.log(i,j)
        const lastline = moneyMap[j-2];
        lastline.forEach(path => {
          nodeMap.push({
            day: day + path.day,
            money: money + path.money,
            path: `${i}->${path.path}`
          })
        })
      }
    }
    if (!nodeMap.length) {
      nodeMap.push({
        day,
        money,
        path: i
      })
    }
    moneyMap[i] = nodeMap;
  }
  console.log(moneyMap, days);
  const nodeList = Object.values(moneyMap).map(list => {
    const sortedList = list.filter(e=> e.day <= days).sort((a,b)=> (b.money/b.day) - (a.money/a.day));
    return sortedList[0]
  })
  const path = nodeList.sort((a,b)=> (b.money/b.day) - (a.money/a.day))[0];
  return path;
}
console.log(findEfficiencyPay(
  8, 10,
  [
    [3, 2000, 0, 1, 1, 0, 0, 0, 0, 0],
    [3, 4000, 0, 0, 0, 1, 1, 0, 0, 0],
    [2, 2500, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1600, 0, 0, 0, 0, 1, 1, 1, 0],
    [4, 3800, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2600, 0, 0, 0, 0, 0, 0, 0, 1],
    [4, 4000, 0, 0, 0, 0, 0, 0, 0, 1],
    [3, 3500, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
))

/**
* 在一个字符串中找到没有重复字符子串中最长的长度
* 
* 例如
* abcabccbb 最长子串是abc,长度是3
* 
* 思路：
* 子串要连续
* 遍历每个字符，当前字符位置是i,找
* 到0 - i-1范围内离i最近的和i位置字符相同的字符位置
* 而二者之间的距离就是不重复子串的长度
* 每个字符都得到后找最大的长度
* 注意：利用i-1位置长度，看位置i字符是否在该范围内
*/
const findMaxNoRepeatLength = str => {
  const result = [1];
  for(let i = 1; i< str.length; i++) {
    const temp = str.slice(0, i).split('');
    const pos = temp.findLastIndex(e => e === str[i]);
    let length = i - pos;
    length = length > result[i-1] ? result[i-1] + 1 : length;
    result.push(length);
  }
  return result.sort((a, b) => b-a)[0]
}


/**
 * 给定一个全是小写字母的字符串str
 * 删除多余字符，使得每个字符只保留一个
 * 并让最终结果字符串的字典序最小
 * 例如
 * str = ‘acbc’,删除掉第一个c,得到‘abc’是所有结果字符串中最小的
 * str = 'dbcacbca',删除第一个b和c,第二个c和a,得到'dabc'
 * 是所有结果字符串中字典序最小的
 * 
 * 思路：
 * 优先保证每个字符都在，
 * 同时记录当前字符串中字典序中排列靠前的字符的位置pos
 * 每次找到一个只有一个字符的时候
 * 从pos开始切割字符串继续处理剩下字符
 */

const remove = str => {
  if (str.length === 1) {
    return str;
  }
  const list = str.split('');
  const count = {};
  for(let i = 0;i<list.length; i++) {
    const char = list[i];
    if (!count[char]) {
      count[char] = 0;
    }
    count[char]++
  }
  let minACSIndex = 0;
  for (let j = 0; j < list.length; j++) {
    const currMin = list[minACSIndex].charCodeAt();
    const curr = list[j].charCodeAt();
    minACSIndex = currMin > curr ? j : minACSIndex;
   if (--count[list[j]] === 0) {
     break
   } 
  }
  const start = list[minACSIndex];
  const subStr = list.slice(minACSIndex + 1).filter(e => e != start).join('');
  return start + remove(subStr);
}

/**
 * 对26个字母进行升序排列组合最终达到的长度，
 * [a,b,c,...z,ab,ac,ad,...az,bc,bd...bz,...abc,....bcd,...xyz...]
 * 随便输入一个升序组合，求位于该数组的位置
 */
const base = 'abcdefghijklmnopqrstuvwxyz'.split('');
// 以base[charpos]开头，长度为length的字符串有多少个
const renderCustome = (charPos, length) => {
  if(length === 1) {
    return 1;
  }
  let count = 0;
  for(let i = charPos+1; i< 26; i++) {
    count += renderCustome(i, length - 1);
  }
  return count;
}
// 长度为length的字符串有多少个
const render = length => {
  let count = 0;
  for(let j = 1; j<=26;j++) {
    count += renderCustome(j-1, length)
  }
  return count
}
 const findPos = str => {
   const length = str.length;
   const first = str[0];
   let count = 0;
   const firstPos = base.findIndex(e => e === first);
   // 长度小于length的升序字符串有多少
   for(let i = 1; i< length; i++) {
     count += render(i);
   }
   //排在首字母前面的字母形成的长度为length的字符串有多少
   for(let m = 0; m < firstPos; m++) {
     count +=  renderCustome(m, length);
   }
   let pre = firstPos;
   for(let j = 1; j<length; j++) {
     const curr = str[j];
     const currPos = base.findIndex(e=> e === curr);
     // 升序，第二个字母肯定位于上一个字母的后面，所以 k = pre + 1
     for(let k = pre + 1; k< currPos; k++) {
      count += renderCustome(k, length - j);
     }
     pre = currPos;
   }
   return count;
 }