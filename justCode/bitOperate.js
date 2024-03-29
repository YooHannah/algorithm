/**
 * 位运算
 */
// 异或运算巧用

// 利用异或位运算进行交换，更快
// 异或运算的一些规则
// 任何数和0异或得到该数，0^N = N
// 任何数和自己异或得到0，N^N = 0
// 满足交换结合律 A^B = B^A ; (A^B)^C = A ^(B^C)
// 一堆数异或结果跟运算顺序无关，结果都是相同的

const swap = (arr, i, j) => {
  if(i === j){ // 相同位置处理后结果会变成0
    return;
  }
  arr[i] = arr[i] ^ arr[j]; 
  arr[j] = arr[i] ^ arr[j]; // 相当于 arr[i] ^ arr[j] ^ a[j] => arr[i] ^ 0 => arr[i] 
  arr[i] = arr[i] ^ arr[j];// 相当于 arr[i] ^ arr[j] ^ a[i] => arr[j]
}

// 应用
// 一个数组中，已知只有一种数字出现了奇数次，其他数出现了偶数次，请问如何找到这个数？

const oddTimesNum = arr => {
  let num = 0;
  arr.forEach(element => {
    num = num ^ element;
  });
  return num
}

// 一个数组中，已知只有两种种数字出现了奇数次，其他数出现了偶数次，请问如何找到这两个数？

const oddTimesNum2 = arr => {
  let num = 0;
  arr.forEach(element => {
    num = num ^ element;
  });
  // num = a ^ b;
  // num != 0; num 必然有一个位置上是1

  const rightOne = num & (~num + 1); // 提取一个数最右边的一个1
  let onlyOne = 0;
  arr.forEach(element => {
    // 找到 a 或者 b, 在最右边1的位置等于0或者等于1,相同结果为1，反之为0
    // 这里假如是0，onlyOne 异或结果，就是a 和 b 中在该位置不是1的那个数
    // 如果a 在最右侧1位的数字是0，那么b就是1，onlyOne就是a,num ^ a =>b 
    // 中间满足条件的其他数，因为出现偶数次，会被N^N = 0 抵消掉
    if((element & rightOne) == 0) {
      onlyOne ^= element
    }
  })

  return [onlyOne, num ^ onlyOne]
}

/**
 * 给定两个有符号的32位整数a和b,返回a和b中较大的
 * [要求] 不能做任何比较判断
 */
// n = 1 => 0; n = 0 => 1
const flip = n => n^1;

// n 是负数返回 0,n 是非负数返回1
const sign = n => flip((n >> 31) & 1);
//a,b 均是正数情况下
const getMax = (a,b) => {
  const c = a-b;
  const scA  = sign(c); // 如果a>b, c是正数，scA是1，
  const scB = flip(scA); // scB 是scA相反，所以肯定一个是1一个是0
  return scA * a + scB * b;
}
// a,b有符号时
const getMax2 = (a,b) => {
  const c = a - b;
  const sa = sign(a);
  const sb = sign(b);
  const sc = sign(c);
  const difSab = sa ^ sb; // a和b符号不一样为1；一样为0
  const sameSab = flip(difSab); // // a和b符号不一样为0；一样为1
  const returnA = difSab * sa + sameSab *b;
  const returnB = flip(returnA);
  return a * returnA + b * returnB;
}

/**
 * 给定两个有符号的32位整数a和b, 不能使用算术运算符，分别实现二者的加减乘除运算
 * [要求] 
 * 如果给定的a,b执行加减乘除的结果会导致数据的溢出，那么你实现的函数不必对此负责
 * 除此之外保证计算过程不发生溢出
 */
// 加法
// 原始两个数相加结果等于二者无进位相加结果加上进位信息结果
// 无进位相加 = a ^b
// 进位信息 = (a & b) << 1
const add = (a,b) => {
  let sum = a;
  while(b) {
    sum = a ^ b;
    b = (a & b) << 1;
    a = sum;
  }
  return sum;
}
// 取相反数反
const negNum = n => add(~n, 1);
// 减法
const minus = (a,b) => add(a, negNum(b))
// 乘法
const multi = (a,b) => {
  let res = 0;
  while(b) {
    if(b & 1) {
      res = add(res, a);
    }
    a <<=1;
    b >>>=1;
  }
  return res;
}
const isNeg = n => n < 0;
// 除法 , 乘法逆序
const div = (a,b) => {
  let x = isNeg(a) ? negNum(a) : a;
  let y = isNeg(b) ? negNum(b) : a;
  let res = 0;
  for(let i = 31; i > -1;i = minus(i,1)) {
    if((x >> i) > y) {
      res |=(1<<i);
      x = minus(x,y<<i);
    }
  }
  return isNeg(a) ^ isNeg(b) ? negNum(res) : res; 
}
/**
 * 判断一个32位正整数是不是2的幂，4的幂？
 */

const is2Power = n => n & (n -1)  === 0;
const is4Power = n => n & (n-1) === 0 && (n & 0x55555555) != 0;


 /**
  * 给定一个字符串，如果一个字符串符合人们日常书写一个整数的形式，
  * 返回数字类型的这个数，如果不符合，返回-1 或者报错
  * 
  * 思路：
  * 
  * 符合人们书写习惯的判断
  * 1. 如果是负数，则只会含有一个‘-’号，且在开头位置，且后面不能跟0
  * 2. 如果是正数，则不能以0开头
  * 3. 仅包含数字字符
  * 
  * 转换成数字类型
  * 将每一位累加，但要检测是否越界
  */

 const verify = strList => {
  const first = strList[0];
  const second = strList[1];
  if(first === '-' && second === '0' || first === '-' && strList.length === 1 || first === '0') {
    return false
  }
  return strList.slice(1).every(str => /^\d$/.test(str));
}

const transferNumber = str => {
  const strList = str.split('');
  const valid = verify(strList);
  if (!valid) {
    return '-1'
  }
  const first = strList[0];
  let number = 0;
  const shang = Number.MAX_SAFE_INTEGER / 10;
  const yushu = Number.MAX_SAFE_INTEGER % 10;
  const reg = first === '-';
  strList.slice(reg ? 1 : 0).reverse().forEach((str, i) => {
    // 越界
    if(number > shang || number === shang && str > yushu) {
      return '-1'
    }
    number +=str*Math.pow(10,i)
  })
  return reg ? -number : number;
}
