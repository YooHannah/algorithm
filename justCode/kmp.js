/**
 * kmp 算法
 * 解决的问题：
 * 字符串str1和str2,str1是否包含str2,如果包含返回str2在str1 中开始的位置
 * 如何做到时间复杂度O(N)完成
 * 
 * 思路：借助辅助结构next,实现快速移动
 * next 结构标识子串str2 当前字符之前首尾按顺序重复字符串的最大个数
 * 例如 1203120 对应的next 结构为[-1,0,0,0,0,1,2]
 * 默认第0和1位置字符next结构中的值是-1和0
 * 3前面是120,0和1不一样，所以next该位置是0
 * 往后走，1 前面是1203,3和1也不一样故该位置是0
 * 2前面是12031，开始两个1相同，故该位置是1
 * 0前面是120312，开头12和最后12相同，两位,故该位置是2
 * 比较时，从当前最大的位数开始比较，相同部分的最后一位，即代表前面的值都相同，
 * 如果最后一位和当前位置前一位不同，则最后一位需要往前移继续比较
 */

 const getNextArray = str => {
  if(str.length === 1) {
    return [-1]
  }
  const list = str.split('');
  const next = [-1, 0];
  let cn = 0;
  let i = 2;
  while(i<list.length) {
    if (list[i -1] === list[cn]) {
      next[i++] = ++cn;
    } else if (cn > 0) {
      cn = next[cn];
    } else {
      next[i++] = 0;
    }
  }
  return next;
}

const kmp = (str1, str2) => {
  if(!str1 || !str2 || str1.length <str2.length) {
    return -1
  }
  const list1 = str1.split('');
  const list2 = str2.split('');
  const next = getNextArray(str2);
  console.log(next);
  let i1 = 0;
  let i2 = 0;
  while(i1 < list1.length && i2 < list2.length) {
    if (list1[i1] === list2[i2]) { // 一样的话继续往下走
      i1++;
      i2++;
    } else if(i2 === 0) { // next[i2] === -1 // 如果一开始就不一样str1往后走
      i1++;
    } else {
      i2 = next[i2]; // 如果中间出现不一样，快速移动到相同的位置继续比较
    }
  }
  return i2 === list2.length ? i1 - i2 : -1
}