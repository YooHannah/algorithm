const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
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
console.log(root);
const treeToLink = head => {
  if (!head) {
    return null
  }
  if (!head.left && !head.right) {
    return {
      head: head,
      tail: head
    }
  }
  const leftLink = treeToLink(head.left);
  const rightLink = treeToLink(head.right);
  if(leftLink) {
    leftLink.tail.next = head;
    head.last = leftLink.tail;
  }
  if(rightLink) {
    rightLink.head.last = head;
    head.next = rightLink.head;
  }
  return {
    head: leftLink ? leftLink.head : head,
    tail: rightLink ? rightLink.tail : head
  }
}

let node = treeToLink(root).head;
while(node) {
  console.log(node.value);
  node = node.next
}

console.log()
