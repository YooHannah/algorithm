// const list = [1,2,3,4,5,6,7, 10, 8, null, null, null, null, null,null,11,12];
const list = [1,2,3,4,5,6,7];
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
    right,
    parent: null
  } : null;
  return node
}
// const addParent= head => {
//   if(!head) {
//     return
//   }
//   if (head.left) {
//     head.left.parent = head;
//   } 
//   if (head.right) {
//     head.right.parent = head;
//   }
//   addParent(head.left);
//   addParent(head.right);
// }
const root = generateBinaryTree(list, 0);
console.log(root);
const serialByPre = head => {
  if (!head) {
    return '#_';
  }
  let res = head.value + '_';
  res +=  serialByPre(head.left);
  res +=  serialByPre(head.right);
  return res;
}
const str = serialByPre(root);
console.log('vvvv', str);
const reconPreOrder = list => {
  const value = list.shift();
  if(value === '#') {
    return null;
  }
  const head = {
    value,
    left: reconPreOrder(list),
    right: reconPreOrder(list),
  }
  return head;
}

const reconBySerialString = str => {
  const list = str.split('_');
  return reconPreOrder(list)
}

console.log(reconBySerialString(str));


