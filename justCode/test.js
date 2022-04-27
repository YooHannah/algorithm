const process = (i,j,m,n, arr) => {
  if ( i > m || j > n) {
    return Number.MAX_SAFE_INTEGER;
  }
  if(i + 1 === m && j === n || i === m && j + 1 === n) {
    return arr[i][j];
  }
  return arr[i][j] + Math.min(process(i+1, j, m,n,arr), process(i,j+1,m,n,arr));
}
console.log(process(0,0,3,2,[[0,1,99],[2,10,84], [100,3,5],[80,2,7]]));
