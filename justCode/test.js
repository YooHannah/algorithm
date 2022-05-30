// const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
const list = [10,6,20,5,7,4,23,null, null, 12,15,null, null, 21,27];
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
const root = generateBinaryTree(list, i);

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
console.log(dpLive('1', false))
