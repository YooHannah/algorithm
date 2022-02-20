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

/**
 * 二叉树一种常见的解题思路是树型DP
 * 简单来说就是根据左右子树的结果
 * 处理出来整个树的结果
 * 
 * 以下题目和概念均可以用来实践
 * 
 */

/***
 * 
 * 搜索二叉树：中序遍历的顺序，任一子树的左叶子结点< 根结点 < 右叶子结点
 * 
 * 如何判断一颗二叉树是否是搜索二叉树
 * 
 */

/**
 * 思路1： 借助递归中序遍历过程，打印逻辑替换为判断逻辑
 */

let preValue = -1; // 记录当前结点的上一个结点值
const checkBST1 = (head) => {
  if (!head) {
    return;
  }
  checkBST1(head.left);
  if (head.value <= preValue) { // 搜索二叉树是升序，所以，一旦上一个结点值大于当前节点值，那就不是搜索二叉树
    return false;
  } else {
    preValue = head.value;
  }
  checkBST1(head.right);
  return true;
};

/**
 * 思路2： 借助非递归中序遍历过程，打印逻辑替换为判断逻辑
 */
 let preValue = -1;
 const checkBST2 = (head) => {
  const arr = [];
  let currNode = head;
  while (arr.length || currNode) {
    if (currNode) {
     arr.push(currNode);
     currNode = currNode.left;
    } else {
     currNode = arr.pop();
     if (currNode.value <= preValue) { // 搜索二叉树是升序，所以，一旦上一个结点值大于当前节点值，那就不是搜索二叉树
      return false;
    } else {
      preValue = currNode.value;
    }
     currNode = currNode.right;
    }
  }
  return true;
}

/**
 * 思路3: 先拿到中序结果，再遍历
 */

 const processSort = (head, arr) => {
   if (!head) {
    return null;
   }
   processSort(head.left, arr);
   arr.push(head.value);
   processSort(head.right,arr);
 }
 const checkBST3 = (head) => {
   const arr = [];
   processSort(head, arr);
   let i = 1;
   while(i<arr.length-1) {
    if(arr[i-1] > arr[i] || arr[i+1] < arr[i]) {
      return false;
    }
    i++
   }
   return true;
 }
/***
 * 
 * 完全二叉树：宽度优先遍历的结果是连续的，没有中断的
 * 
 * 如何判断一颗二叉树是否是完全二叉树
 * 
 * 思路：根据完全二叉树定义，明确判断条件
 * 
 * 1. 任意一个节点，有右子树没有左子树的一定不是完全二叉树
 * 2. 在没有触发条件1，情况下，如果出现了左右子树不完全的情况
 *    即只有左树情况，那么接下来的结点，按照宽度优先遍历顺序只能是叶子结点
 *
 */
 
let onlyLeft = false; // 记录是否出现了只有左子树的结点
const isCBT = (head) => {
  const arr = [head];
  while(arr.length) {
    const currNode = arr.shift();
    const { left, right } = currNode;
    if(!left && right || onlyLeft && (left || right)) { // 判断条件
      return false
    }
    left && arr.push(left);
    right && arr.push(right);
    if(left && !right) {
      onlyLeft = true
    }
  }
  return true;
}

/***
 * 
 * 满二叉树：除深度最深的一层叶子结点以外，每个结点都有左右叶子结点
 * 
 * 满二叉树最大深度L和结点个数N存在这样的关系：N = 2^L -1
 * 
 * 如何判断一颗二叉树是否是满二叉树
 * 思路：算出二叉树的L和N，判断二者关系是否满足上述式子
 * 二叉树的最大深度 = max(左右子树深度) + 1;
 * 二叉树节点个数 = 左子树节点个数 + 右子树节点个数
 */
 const process = (head) => {
  if (!head) {
    return {
      level: 0,
      count: 0,
    }
  }
  const leftInfo = process(head.left);
  const rightInfo = process(head.right);
  const level = Math.max(leftInfo.level, rightInfo.level) + 1;
  const count = leftInfo.count + rightInfo.count + 1;
  return { level, count }
}

const isFBT = head => {
  const { level, count } = process(head);
  return count === (1<<level) - 1
}
/***
 * 
 * 平衡二叉树： 左右子树的深度<2
 * 
 * 如何判断一颗二叉树是否是平衡二叉树
 * 
 */
 const process = (head) => {
  if (!head) {
    return {
      isBBT: true,
      level: 0
    }
  }
  const leftInfo = process(head.left);
  const rightInfo = process(head.right);
  const level = Math.max(leftInfo.level, rightInfo.level) + 1;
  const isBBT = leftInfo.isBBT && rightInfo.isBBT && Math.abs(leftInfo.level - rightInfo.level) < 2;
  return { level, isBBT }
}

const isBBT = head => {
  const { level, isBBT } = process(head);
  return isBBT;
}

/**其他题目 */

/**
 * 给定一个二叉树的两个结点node1和node2找到他们最低公共祖先节点
 * 
 * 思路：分两种情况
 * 1. 两个节点其中一个结点是另外一个结点的祖先节点，那么其中一个节点遍历到root过程中肯定会经过另外一个节点
 * 2. 两个节点确实在不同子树上，那么二者遍历到root节点过程中，碰到的第一个公共结点，则是最低公共祖先节点
 */

/** 方法一 */
 const process = (head, fatherMap) => {
  if(!head) {
    return
  }
  fatherMap.set(head.left, head);
  fatherMap.set(head.right, head);
  process(head.left, fatherMap);
  process(head.right, fatherMap);
}

const LCA = (head, node1, node2) => {
  const fatherMap = new Map();
  process(head, fatherMap);
  fatherMap.set(head,head);
  let currNode = node1;
  const node1Parents = [];
  while(fatherMap.get(currNode) !== currNode) {
    node1Parents.push(currNode);
    currNode = fatherMap.get(currNode);
  }
  currNode = node2;
  while(fatherMap.get(currNode) !== currNode) {
    if(node1Parents.includes(currNode)) {
      return currNode;
    } else {
      currNode = fatherMap.get(currNode);
    }
  }
  return head;
}
/** 
 * 方法二 
 * 从上往下，分别从左右子树找o1,和o2，有谁返回谁，
 * 如果两个点分别在左右子树上，那当前节点就是二者最小公共祖先
 * 如果两个点一个点是另一个点的祖先，那作为祖先的这个点的左右子树遍历结果肯定其中一个为null
 * 有值的一边也就是最小公共祖先。
*/
const LowestAncestor = (head, o1, o2) => {
  if (!head || head === o1 || head === o2) {
    return head;
  }
  const left = LowestAncestor(head.left, o1, o2);
  const right = LowestAncestor(head.right,o1, o2);
  if(right && left) {
    return head;
  }
  return left ? left: right;
}
/**
 * 在二叉树中找到一个节点的后继结点
 * 后继节点：中序遍历顺序中，一个节点的后一个结点
 * 前驱节点：中序遍历顺序中，一个节点的前一个结点
 * 
 * 现有一种新的二叉树的节点类型如下
 * class Node {
 *  int value;
 *  Node left;
 *  Node right;
 *  Node parent;
 * }
 * 
 * 这个结构比普通二叉树节点多了一个指向父节点的parent指针，
 * 假设有一颗Node类型节点组成的二叉树，树中每个节点parent指向自己的父节点，头节点的parent指向null
 * 只给一个在二叉树的某个节点Node,请返回Node 的后继节点
 * 
 * 思路： 
 * 1. 如果结点有右子树，那后继结点就是右子树做左边的叶子节点
 * 2. 如果节点没有右子树，一直往上判断当前结点是不是父节点的左孩子，是的话，这个父节点就是这个节点的后继节点
 * 
 */
 const getSuccessorNode  = node => {
  if (node.right) {
   let currNode = node.right;
   while(currNode.left) {
     currNode = currNode.left;
   }
   return currNode;
  } else {
    let currNode = node;
    while(currNode.parent) {
      if(currNode = currNode.parent.left) {
       return currNode.parent;
      } else {
        currNode = currNode.parent;
      }
    }
    return currNode;
  }
}

/**
 * 二叉树的序列化和反序列化
 * 
 */

/**
 *  按先序遍历将二叉树序列化成字符串
 */
const serialByPre = head => {
  if (!head) {
    return '#_';
  }
  let res = head.value + '_';
  res +=  serialByPre(head.left);
  res +=  serialByPre(head.right);
  return res;
}

/**
 * 按先序将字符串恢复成二叉树
 */
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

/**
 * 折纸问题
 * 请把一段纸条竖着放在桌子上，然后从纸条的下边向上方对折1次，压出折痕后展开
 * 此时折痕是凹下去的，即折痕突起的方向指向纸条的背面
 * 如果从纸条的下边向上方连续对折2次，压出折痕后展开，此时有三条折痕，从上到下依次是
 * 下折痕，下折痕，上折痕
 * 给定一个输入参数N, 代表纸条从下往上连续对折N次
 * 请从上到下，打印所有折痕的方向
 * 例如N = 1时，打印 down, N = 2时，打印 down down up
 * 
 * 思路：对折结果用树表示就是
 *         down        第一次产生的折痕
 *     down      up    第二次产生的折痕
 *   down up  down up  第三次产生的折痕
 * 
 * 左子树都是down,右子树都是up;
 * 打印顺序顺序就是中序遍历的顺序;
 */
const printProcess = (i, N, down) => {
  if( i > N ) {
    return;
  }
  printProcess(i+1, N, true);
  console.log(down ? 'down' : 'up')
  printProcess(i+1, N, false);
}

const printAllFolders = N => {
  printProcess(1, N, true);
}