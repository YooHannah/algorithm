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

const mostLeftLevel = (node, level) => {
  while(node) {
    level++;
    node = node.left;
  }
  return level - 1;
}
const bs = (node, level, h) => {
  if (level === h) {
    return 1;
  }
  const rightLevel = mostLeftLevel(node.right, level + 1)
  if (rightLevel === h) {
    return (1<< (h-level)) + bs(node.right,level +1, h);
  } else {
    return (1<< (h-level-1)) + bs(node.left,level +1, h);
  }
}
const nodeNum = head => {
  if(!head) {
    return 0;
  }
  return bs(head, 1, mostLeftLevel(head, 1))
}
console.log(nodeNum(root))
