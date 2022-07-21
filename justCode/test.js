// const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
// const list = [10,6,20,5,7,4,23,null, null, 12,15,null, null, 21,27];
const list = [1,2,3,4,5,6,7,null, 8];
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

console.log(getMAXChildSorted('jkl12345k6k9kooo', 'llo12345jd69e'))
