const manacherString = str => `#${str.split('').join('#')}#`;

const maxLcpStringLength = str => {
  if (!str) {
    return '输入非法';
  }
  // 将字符串中插入#
  const list = manacherString(str);
  let c = -1;
  let r = -1;
  let max = Number.MIN_VALUE;
  let pArr = [];
  const { length } = list;
  for (let i = 0; i<length; i++) {
    pArr[i] = r > i ? Math.min(pArr[2 * c - i] || 1, r -i)  : 1;
    while (i + pArr[i] < length && i - pArr[i] > -1) {
      const distance = pArr[i];
      if (list[i - distance] === list[i + distance]) {
        pArr[i]++
      } else {
        break
      }
    }
    if(i + pArr[i] > r) {
      r = i + pArr[i];
      c = i;
    }
    console.log(list[i], pArr[i]);
    max = Math.max(max, pArr[i])
  }
  return max - 1;
}

console.log(maxLcpStringLength('65122189'))