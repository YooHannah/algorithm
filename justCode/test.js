
const findWays1 = (n,m,row, col, rest) => {
  const cache = new Array(n+1).fill(null).map(
    e => new Array(m+1).fill(null).map(
      item => new Array(rest+1).fill(0)
    )
  );
  for(let h = 0;h<rest+1; h++) {
    for(let i = 0; i< n; i++) {
      for(let j = 0; j <= m; j++) {
        if(h === 0 && i != n && i > 0 && j != m && j > 0) {
          cache[i][j][h] = 1;
        } else if(i === 0 || i === n || j === 0 || j === m) {
          cache[i][j][h] = 0;
        } else {
          let count = 0;
          const nextStep = h - 1;
          const posInfo = [
            [row-1, col],
            [row+1, col],
            [row, col+1],
            [row, col-1]
          ]
          posInfo.forEach(item=> {
            const [nextX,nextY] = item;
            let way = 0;
            if(nextX >= 0 && nextX <= n && nextY >= 0 && nextY <= m) {
              way = cache[nextX][nextY][nextStep]
            }
            count +=way;
          })
          cache[i][j][h] = count
        }
       
      }
    }
  }
  return cache[row][col][rest]
}
const process = (n,m, row, col, rest, cache) => {
  if (row < 0 || row === n || col < 0 || col === m) { // 走到边上或者m,n 以外都算越界
    return 0;
  }
  if((row === n || row === 0) && col<= m && col > -1 || (col === m || col === 0) && row > -1 && row <=n) {
    cache[row][col][rest] = 0;
  }
  if(cache[row][col][rest] != -1) {
    return cache[row][col][rest];
  }
  if(rest === 0) { // 还在m,n 里面，且步数走完了
    cache[row][col][rest] = 1;
    return 1;
  }
  
  const posInfo = [
    [row-1, col],
    [row+1, col],
    [row, col+1],
    [row, col-1]
  ]
  let count = 0; // 还在m,n 里面，且步数还没走完，可以向上下左右走
  const nextRest = rest - 1;
  posInfo.forEach(item=> {
    const [nextRow, nextCol] = item;
    const result = process(n,m,nextRow,nextCol,nextRest, cache);
    if(nextRow >= 0 && nextRow <= n && nextCol >= 0 && nextCol <= m) {
      cache[nextRow][nextCol][nextRest] = result;
    }
    count += result;
  })
  cache[row][col][rest] = count
  return cache[row][col][rest];
 }

const findWays = (n,m,row, col, rest) => {
  const cache = new Array(n+1).fill(null).map(
    e => new Array(m+1).fill(null).map(
      item => new Array(rest+1).fill(-1)
    )
  );
  return process(n,m, row, col, rest, cache)
}
console.log(findWays1(8,9,2,1,1));
console.log(findWays(8,9,2,1,1));
