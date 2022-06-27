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

const getBuildingLine = matrix => {
  const list = matrix.map(item => {
    const [left, right, height] = item;
    return [
      [left,'up', height],
      [right, 'down', height]
    ]
  })
  .reduce((curr,prev) => [...curr, ...prev], [])
  .sort((a,b) => {
    const [pos1,flag1,height1] = a;
    const [pos2,flag2,height2] = b;
    if (pos1 === pos2) {
      if (flag2 === 'up') {
        return -1
      } else {
        return 1
      }
    } else {
      return pos1 - pos2
    }
  });
  const map1 = {};
  const map2 = {};
  let currMaxHeight = -1;
  list.forEach(item => {
    const [pos, flag, height] = item;
    if (!map1[height]) {
      map1[height] = 0;
    }
    if (flag === 'down') {
      map1[height]--
    } else {
      map1[height]++;
    }
    const max = Object.keys(map1).filter(key=>map1[key]).sort((a,b)=> b-a )[0];
    map2[pos]=max;
  })
 const lines = [];
 const poslist = Object.keys(map2);
 for(let i = 0; i< poslist.length;i++) {
  const height = map2[poslist[i]];
  if (!height ||  map1[height] > i) {
    continue;
  }
  let j = -1;
  for(j = i+1; j< poslist.length;j++) {
    if (map2[poslist[j]] != height) {
      break;
    }
  }
  map1[height] = j;
  lines.push([poslist[i],poslist[j],height]);
 }
 return lines
}

console.log(getBuildingLine(
   [
      [2,5,6],
      [1,7,4],
      [4,6,7],
      [3,6,5],
      [10,13,2],
      [9,11,3],
      [12,14,4],
      [10,12,5]
     ]
));
