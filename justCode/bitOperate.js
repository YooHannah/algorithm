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

/**
 * 给定两个有符号的32位整数a和b, 不能使用算术运算符，分别实现二者的加减乘除运算
 * [要求] 
 * 如果给定的a,b执行加减乘除的结果会导致数据的溢出，那么你实现的函数不必对此负责
 * 除此之外保证计算过程不发生溢出
 */


/**
 * 判断一个32位正整数是不是2的幂，4的幂？
 */
