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
const root = generateBinaryTree(list, i);

const findEfficiencyPay = (activityCount, days, matrix) => {
  const moneyMap = {};
  for(let i = activityCount - 1; i >= 0; i--) {
    const line = matrix[i];
    const day = line[0];
    const money = line[1];
    const nodeMap = [];
    for(let j = 2; j < activityCount + 2; j++) {
      const node = line[j];
      if(node) {
        console.log(i,j)
        const lastline = moneyMap[j-2];
        lastline.forEach(path => {
          nodeMap.push({
            day: day + path.day,
            money: money + path.money,
            path: `${i}->${path.path}`
          })
        })
      }
    }
    if (!nodeMap.length) {
      nodeMap.push({
        day,
        money,
        path: i
      })
    }
    moneyMap[i] = nodeMap;
  }
  console.log(moneyMap, days);
  const nodeList = Object.values(moneyMap).map(list => {
    const sortedList = list.filter(e=> e.day <= days).sort((a,b)=> (b.money/b.day) - (a.money/a.day));
    return sortedList[0]
  })
  const path = nodeList.sort((a,b)=> (b.money/b.day) - (a.money/a.day))[0];
  return path;
}
console.log(findEfficiencyPay(
  8, 10,
  [
    [3, 2000, 0, 1, 1, 0, 0, 0, 0, 0],
    [3, 4000, 0, 0, 0, 1, 1, 0, 0, 0],
    [2, 2500, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1600, 0, 0, 0, 0, 1, 1, 1, 0],
    [4, 3800, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2600, 0, 0, 0, 0, 0, 0, 0, 1],
    [4, 4000, 0, 0, 0, 0, 0, 0, 0, 1],
    [3, 3500, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
))
