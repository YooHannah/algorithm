// const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
// const list = [10,6,20,5,7,4,23,null, null, 12,15,null, null, 21,27];
const list = [5,3,7,6,4,12,9];
let i = 0; 
const generateBinaryTree = (data, i) => { // 生成一颗二叉树
  if(i=== data.length) {
    return null
  }
  const value = data[i];
  const left = 2 * i + 1 < data.length ?  generateBinaryTree(data, 2 * i + 1) : null;
  const right =  2 * i + 2 < data.length ? generateBinaryTree(data, 2 * i + 2) : null;
  const node = value ? {
    value,
    left,
    right
  } : null; 
  return node
}
// const root = generateBinaryTree(list, i);
// console.log(root)
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
console.log(isMatchDpWay('abbbf', 'a*f'));
