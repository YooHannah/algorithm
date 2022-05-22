/**
 * 打表法
 * 适用于一个整型输入返回一个整型输出的问题
 * 先用最笨的方法打印出一系列结果
 * 观察结果与输入值的关系，直接根据关系实现逻辑
 */

 /**
  * 【题目】
  * 现在只有能装6个或者8个苹果的袋子，顾客想买N个苹果，尽可能的使用少的袋子来装
  * 并且挣够把每个袋子装满，如果无论如何不能装满，返回-1，否则返回使用的最小袋子数
  * 
  * 思路：
  * 要想让袋子数越小，那就尽可能的使用能够装8个苹果的袋子
  * 一次计算用n/8个，n/8 -1个，n/8-2个...能够装8个苹果的袋子去装N个苹果，
  * 剩下的苹果能够用6个装的袋子装，那么最小的袋子数就是8个装袋子数加上6个装袋子数
  * 
  * 打印输入不同n值结果，发现规律
  */

 const minBags = n => {
  const allBigBag = Math.ceil(n/8);
  const countList = [];
  for(let i = allBigBag;i>=0;i--) {
    const rest = n - i * 8;
    if(rest < 0 || rest%6) {
      countList[i] = -1;
      continue;
    } 
    const smallBag = rest/6;
    countList[i] = i + smallBag;
  }
  return countList.filter(e => e != -1).sort((a,b) => a-b)[0] || -1;
}

// 通过执行100次计算结果发现规律

const minBags = n => {
  if(n & 1) { // 如果是奇数个苹果
    return -1
  }
  if(n < 18) {
    if (!n) {
      return 0;
    }
    if(n == 6 || n ==8) {
      return 1;
    }
    if([12,14,16].includes(n)) {
      return 2;
    }
    return -1
  }
  return Math.floor((n -18) /8) + 3
}

/**
 * 【题目】
 * 现在要给两头牛喂N份草，两头牛每次只能吃4的n次方份草，谁能够吃到最后一份谁赢，
 * 请问输入不同N值情况下，请问是先吃的牛能获胜，还是后吃的牛能获胜
 * 
 * 思路：
 * n < 5的时候，每次只能吃4的0次方= 1 份草
 * 那么n < 5时候的结果可以当做基本情况，
 * n == 0 || n == 2 时，后吃的牛能获胜
 * n >= 5时，可以根据n-1的结果推出n的结果
 * 就是加入n - 1结果是后吃的牛获胜，那么n的结果就是先吃的牛获胜 
 *
 */

const winner1 = n => {
  if(n < 5) {
    return [0,2].includes(n) ? '后手':'先手'
  }
  let base = 1;
  while (base <=n ) {
    if (winner1(n-base) === '后手') {
      return '先手'
    }
    if (base > n/4) {
      break;
    }
    base *=4;
  }
  return '后手'
}

// 打表后
const winner2 = n => {
  if([0,2].includes(n%5)) {
    return '后手'
  } else {
    return '先手'
  }
}