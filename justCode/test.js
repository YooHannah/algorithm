const getNextArray = str => {
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
  const list1 = str1.split('');
  const list2 = str2.split('');
  const next = getNextArray(str2);
  console.log(next);
  let i1 = 0;
  let i2 = 0;
  while(i1 < list1.length && i2 < list2.length) {
    if (list1[i1] === list2[i2]) {
      i1++;
      i2++;
    } else if(i2 === 0) {
      i1++;
    } else {
      i2 = next[i2];
    }
  }
  return i2 === list2.length ? i1 - i2 : -1
}
console.log(kmp('568121212123489', '1212121234'))