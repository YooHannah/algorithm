

 const list = [1,2,3,4,5,6,7];
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
 const head = generateBinaryTree(list, i);
 console.log(head);
 const reverseEdge = from => {
  let pre = null;
  let next = null;
  while(from) {
    next = from.right;
    from.right = pre;
    pre = from;
    from = next;
  }
  return pre;
}
const printEdge = x => {
  const tail = reverseEdge(x); // 先把右边界逆序指向 1->3->7 变成7->3->1
  let cur = tail;
  while(cur) {
    console.log(cur.value); // 打印
    cur = cur.right;
  }
  reverseEdge(tail) // 再恢复回来
}

const Morris = head => {
  if(!head) {
   return;
  }
  let cur = head;
  let mostRight = null;
  while(cur) {
    mostRight = cur.left; 
    if (mostRight) {
     while(mostRight.right && mostRight.right != cur) {
       mostRight = mostRight.right;
     }
     if (!mostRight.right) {
       mostRight.right = cur;
       cur = cur.left;
       continue;
     } else {
       mostRight.right = null;
       printEdge(cur.left); // 遍历到第二次cur时，逆序打印左子树的右边界
     }
    }
    cur = cur.right;
  }
  printEdge(head);
}
console.log(Morris(head));
