const infect = (arr, i, j, lines, columns) => {
  if(i<0 || i>=lines || j <0 || j>=columns || arr[i][j] !=1) {
    return;
  }
  arr[i][j] = 2;
  infect(arr,i-1,j,lines, columns);
  infect(arr,i+1,j,lines, columns);
  infect(arr,i,j-1,lines, columns);
  infect(arr,i,j+1,lines, columns);
}
const countIslands = arr => {
  const lines = arr.length;
  const columns = arr[0].length;
  if (!arr || !lines || !columns) {
    return 0;
  }
  let j = 0;
  let count = 0;
  for(let i=0; i<lines; i++) {
    const line = arr[i];
    for(let j = 0;j < columns; j++) {
      const value = line[j];
      if(value === 1) {
        count++;
        infect(arr, i, j, lines, columns);
      }
    }
  }
  return count;
}
console.log(countIslands([
  [0,0,1,0,1,0],
  [1,1,1,0,1,0],
  [1,0,0,1,0,0],
  [0,0,0,0,0,0]
]))