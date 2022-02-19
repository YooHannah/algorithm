/**
 * 二叉树的结构
 * 
 * class Node {
 *    V value;
 *    Node left;
 *    Node right
 * }
 */

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
 

/**
 * 假设一个二叉树结构为
 *          1
 *     2        3
 *  4    5    6    7
 * 
 */

/**
 * 递归序遍历一棵树
 * 
 * 思路： 遍历先上后下，先左后右，访问过左子树后回到根结点再访问右子树，每经过一个结点打印一次
 * 遇到叶子结点假设左右子节点都是null,也都访问一遍只是不打印
 * 
 */

 const recursionBinaryTree = (head) => {
  if (!head) {
    return;
  }
  console.log(head.value);
  recursionBinaryTree(head.left);
  console.log(head.value);
  recursionBinaryTree(head.right);
  console.log(head.value);
};

/**
 * 那么上面这颗二叉树的打印结果就会变成
 * 
 * 1 2 4 4 4 2 5 5 5 2 1 3 6 6 6 3 7 7 7 3 1
 * 
 * 会发现每个结点都会被访问3次，打印三次
 * 观察就会发现
 * 如果是每个结点仅在第一次访问时打印，那么得到的结果就是先序遍历的结果
 * 如果是每个结点仅在第二次访问时打印，那么得到的结果就是中序遍历的结果
 * 如果是每个结点仅在第三次访问时打印，那么得到的结果就是后序遍历的结果
 */

/**
 * 先序遍历: 头左右
 * 
 * 思路: 仅在第一次访问时打印 1 2 4 5 3 6 7
 */

const recursionBinaryTree = (head) => {
  if (!head) {
    return;
  }
  console.log(head.value);
  recursionBinaryTree(head.left);
  recursionBinaryTree(head.right);
};

/**
 * 中序遍历: 左头右
 * 
 * 思路: 仅在第二次访问时打印 4 2 5 1 6 3 7
 * 
 */

const recursionBinaryTree = (head) => {
  if (!head) {
    return;
  }
  recursionBinaryTree(head.left);
  console.log(head.value);
  recursionBinaryTree(head.right);
};

/**
 * 后序遍历: 左右头
 * 
 * 思路: 仅在第三次访问时打印 4 5 2 6 7 3 1
 *  
 */

 const recursionBinaryTree = (head) => {
  if (!head) {
    return;
  }
  recursionBinaryTree(head.left);
  recursionBinaryTree(head.right);
  console.log(head.value);
};

/** 非递归方法 */

/**
 * 先序遍历: 头左右
 * 
 * 思路: 
 * 先将根结点push 到栈中，
 * 栈中不为空的情况下pop出一个结点打印，
 * 然后按先右后左的顺序将叶子结点push到栈中
 * 循环处理
 * 
 */
const frontBinaryTree = (head) => {
  const arr = [head];
  while(arr.length) {
    const node = arr.pop();
    console.log(node.value);
    node.right && arr.push(node.right);
    node.left && arr.push(node.left)
  }
}

/**
 * 中序遍历: 左头右
 * 
 * 思路:
 * 想象一下将整颗树按左子树分片,
 * 没有左子树的话回到null对应的根结点(从栈里面pop出来)
 * 如果有右子树的话，继续以右子树为根结点，按左子树方向分片
 * 从而实现，相对于每一个结点，都是左子树，当前根结点，右子树的顺序
 * 
 */
 const middleBinaryTree = (head) => {
   const arr = [];
   let currNode = head;
   while (arr.length || currNode) {
     if (currNode) {
      arr.push(currNode);
      currNode = currNode.left;
     } else {
      currNode = arr.pop();
      console.log(currNode.value);
      currNode = currNode.right;
     }
   }
 }


/**
 * 后序遍历: 左右头
 * 
 * 思路:
 * 参考先序遍历的思想
 * 将需要打印的值先push到一个新栈中
 * 存入push的顺序改成先左后右，这样pop的顺序编程右左
 * 然后存入新栈的顺序又会变成先左后右
 * 最后将新栈中的结点依次pop出来
 * 
 */

 const endBinaryTree = (head) => {
  const arr = [head];
  const box = [];
  while(arr.length) {
    const node = arr.pop();
    box.push(node)
    node.left && arr.push(node.left)
    node.right && arr.push(node.right);
  }
  while(box.length) {
    const node = box.pop();
    console.log(node.value);
  }
}


/**
 * 求一颗二叉树的宽度
 * 
 *         1
 *     2        3
 *  4    5    6    7
 *    8     9
 * 
 * 如上面这颗树，每层的宽度分别是1,2,4,2，那么这颗树的宽度就是4
 * 
 */

/**
 * 如何宽度优先遍历一棵树
 * 思路： 根左右推入栈中，先进先出，打印
 */

const horizonBinaryTree = (head) => {
  const arr = [head];
  while(arr.length) {
    const currNode = arr.shift();
    console.log(currNode.value)
    const { left, right } = currNode;
    left && arr.push(left);
    right && arr.push(right);
  }
}

/**
 * 使用哈希表的概念求宽度
 * 思路：
 * 宽度优先遍历树的过程中push结点时借助哈希表记录结点所在层
 * 声明额外变量分别记录当前层数，当前层结点个数，以及宽度最大值max
 * 当pop出来的结点所在层等于当前层，则当前层结点个数加1
 * 否则，当前结点已经是下一层第一个节点，
 * 比较当前层结点个数和max大小， 更新max, 当前层数加1，当前层结点个数归为1
 * 
 * 
 */

 const maxWidthBinaryTree = (head) => {
  const arr = [head];
  let currLevel = 1;
  let currLevelNodesNumber = 0;
  // 借助当前树的value都具有唯一性，这里要使用结点唯一性的特征值当key
  const nodeLevelMirror = {[head.value]: 1}; 
  let max = -1;
  while(arr.length) {
    const currNode = arr.shift();
    const currNodeLevel = nodeLevelMirror[currNode.value];
    if(currNodeLevel === currLevel) {
      currLevelNodesNumber++
    } else {
      max = Math.max(max, currLevelNodesNumber);
      currLevel++;
      currLevelNodesNumber = 1;
    }
    const { left, right } = currNode;
    if(left) {
      arr.push(left);
      nodeLevelMirror[left.value] = currNodeLevel + 1;
    }
    if(right) {
      arr.push(right);
      nodeLevelMirror[right.value] = currNodeLevel + 1;
    }
  }
  return max;
}


/**
 * 不使用哈希表的概念求宽度
 * 
 * 思路：
 * 依靠一个结点只有左右两个子树，
 * 每次push完后，最新被push进去的更新为下一层最后一个结点
 * 如果当前结点即当前层最后一个结点, 那么最后被push进去的就是下一层最后一个结点
 * 更新max.更新计数，更新end结点指向
 * 如果不是当前层最后一个结点，那么计数加1
 */

 const maxWidthBinaryTree = (head) => {
  const arr = [head];
  let currLevelEnd = head; // 当前层最后一个结点
  let nextLevelEnd = null; // 下一层最后一个结点
  let currLevelNumber = 0; // 当前层结点个数
  let max = -1; // 最大宽度
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