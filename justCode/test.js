const getMinPos = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const pmin = [];
  const minPos = [];
  for(let i = 0; i < arr.length; i++) {
    while (pmin.length && arr[pmin[pmin.length -1]] > arr[i]) {
     const lastpos = pmin.pop();
     minPos.push({
       pos: lastpos,
       value: arr[lastpos],
       left: pmin.length > 1 ? pmin[pmin.length - 1] : -1,
       right: i
     });
    }
    pmin.push(i);
  }
  while(pmin.length) {
    const lastpos = pmin.pop();
    minPos.push({
      pos: lastpos,
      value: arr[lastpos],
      left: pmin.length ? pmin[pmin.length - 1] : -1,
      right: -1
    });
  }
  return minPos
}
const getMaxIndexA = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const posInfoList = getMinPos(arr);
  const IndexAList = [];
  posInfoList.forEach(item => {
    const { pos, left, right } = item;
    const start = left === -1 ? pos : left + 1;
    const end = right === -1 ? arr.length: right; 
    const list = arr.slice(start, end);
    const sum = list.reduce((prev,curr) => prev + curr, 0)
    const IndexA = sum * arr[pos];
    console.log(item.value, list)
    IndexAList.push(IndexA);
  })
  return IndexAList.sort((a,b)=> b-a)[0];
}
console.log(getMaxIndexA([10,1,2,3,7,8,6,5,4,9]))