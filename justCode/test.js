const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
let i = 0; 
const generateBinaryTree = (data, i) => {
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

const root = generateBinaryTree(list, 0);
const horizonBinaryTree = (head) => {
  const arr = [head];
  let currLevelEnd = head;
  let nextLevelEnd = null;
  let currLevelNumber = 0;
  let max = -1;
  while(arr.length) {
    const currNode = arr.shift();
    const { left, right } = currNode;
    if(left) {
      arr.push(left);
      nextLevelEnd = left;
    }
    if(right) {
      arr.push(right);
      nextLevelEnd = right;
    }
    currLevelNumber++;
    if (currNode === currLevelEnd) {
      max = Math.max(max, currLevelNumber);
      currLevelEnd = nextLevelEnd;
      nextLevelEnd = null;
      currLevelNumber = 0;
    }
  }
  console.log(max);
}

horizonBinaryTree(root);


