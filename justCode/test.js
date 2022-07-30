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

console.log(getMaxChild('12345', '334'));
