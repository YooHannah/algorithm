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
    * 已知一个二叉树的中序和先序遍历，求后序遍历顺序，二叉树没有重复的值
    * 
    *
    * 例如 
    * pre = [1,2,4,5,3,6,7]
    * in = [4,2,5,1,6,3,7]
    * 返回
    * [4.5,2,6,7,3,1]
    * 
    * 思路：
    * 根据pre[0]可以知道后序遍历的最后一个值
    * 根据pre[0]在in中的位置划分出左子树元素集合leftInList和右子树元素rightInList
    * 根据二者长度，在in中截出左右子树先序的结果leftPreList和rightPreList
    * 
    * 使用上述方法
    * 然后根据leftInList 和leftPreList 得出左树后序顺序
    * rightInList和rightPreList得出右树后序顺序
    * 
    * 最后进行拼接
    * 
    */

   const getEndSort = (preSort, midSort) => {
    if(preSort.length === 1) {
      return preSort;
    }
    const last = preSort[0];
    const poi = midSort.findIndex(e=> e === last);
    const midLeft = midSort.slice(0,poi);
    const minRight = midSort.slice(poi+1);
    const preLeft = preSort.slice(1,poi+1);
    const preRight = preSort.slice(poi+1)
    const endLeft = getEndSort(preLeft, midLeft);
    const endRight = getEndSort(preRight, minRight);
    return [...endLeft, ...endRight, last]
  }


/**
 * 【Morris 遍历】
 * 一种遍历二叉树的方式，并且时间复杂度O(N), 额外空间复杂度O(1)
 * 通过利用树中大量空闲的指针的方式，达到节省空间的目的
 * 
 * 细节/流程：假设来到当前节点cur,开始时cur来到头结点位置
 * 1. 如果cur没有左孩子，cur向右移动，cur = cur.right
 * 2. 如果cur有左孩子，找到左子树上最右的节点mostright
 *    如果mostright的右指针指向空，让其指向cur，然后cur向左移动 cur = cur.left
 *    如果mostright的右指针指向cur,让其指向null, 然后cur向右移动 cur = cur.right
 * 3. cur 为空时遍历停止
 * 
 * 对于下面这棵树，
 *         1
 *     2        3
 *   4   5    6    7
 * 
 * Morris的curr值的变化顺序是： 1，2，4，2，5，1，3，6，3，7
 * 
 * 可以发现相比递归形式各个节点访问次数明显减少，递归时每个节点访问三次
 * 
 * 可以发现
 * 如果对，只出现过一次的数字和出现两次只打印第一次的数字进行打印，得到的结果就是先序遍历顺序
 * 如果对，只出现过一次的数字和出现两次只打印第二次的数字进行打印，得到的结果就是后序遍历顺序
 * 
 * 对于后序遍历，我们可以发现没到第二次访问cur时，左子树最右孩子总是指向cur.所以
 * 每当遍历到第二次cur时，如果逆序打印左子树的右边界正好就是后序遍历顺序
 * 如，
 * 第一个第二次遍历到的点是2,2的左子树是4，打印
 * 第二个第二次遍历到的点是1,1的左子树是2，2的右边界是，2和5， 逆序打印就5,2
 * 第三个第二次遍历到的点是3,3的左子树是6，打印
 * 最后从头结1点开始打印其右边界
 */

 // 遍历顺序

 const Morris = head => {
   if(!head) {
    return;
   }
   let cur = head;
   let mostRight = null;
   while(cur) {
     mostRight = cur.left; // mostRight一开始 是cur左孩子
     if (mostRight) {
      while(mostRight.right && mostRight.right != cur) {
        mostRight = mostRight.right;
      }
      if (!mostRight.right) { // 第一次来到cur的时候
        mostRight.right = cur; // 左树最右结点指向当前节点
        cur = cur.left;// 当前节点移动到自己左树根结点，继续处理叶结点指向
        continue;
      } else { // 第二次来到cur的时候，取消左树最右结点指向当前节点
        mostRight.right = null
      }
     }
     cur = cur.right;
   }
 }

 //先序遍历
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
       console.log(cur.value); // 会出现两次的结点，只在第一次打印
       mostRight.right = cur;
       cur = cur.left;
       continue;
     } else {
       mostRight.right = null
     }
    } else {
      console.log(cur.value); // 只出现一次的结点，叶子结点
    }
    cur = cur.right;
  }
}

//中序遍历
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
        mostRight.right = null
        //console.log(cur.value); // 会出现两次的结点，只在第二次打印
      }
    } else {
      // console.log(cur.value); // 只出现一次的结点，叶子结点
    }
    console.log(cur.value); // 上面两次打印优化为一次
    cur = cur.right;
  }
}

// 后续遍历
// 以传入结点作为头结点，逆序打印这棵树的右边界
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

/**
 * 双向链表结构如果把last认为是left,next是right的话，可以看做是和二叉树一样的结构
 * 给定一个搜索二叉树的头结点head, 请转化成一条有序的双向链表，并返回双向链表的头结点
 * 
 * 思路：
 * 使用二叉树经典递归套路
 * 拿到左右子树的转化结果
 * 然后将左树next指向父节点，父节点last指向左树
 * 父节点next指向右树，右树last指向父节点
 */
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

/**
 * 找到一颗二叉树中最大的搜索二叉子树，返回最大搜索二叉子树的节点个数和头结点
 * 
 * 思路：
 * 同样递归套路
 * 根据左右子树返回结果
 * 返回结果包含是否是搜索树，最大搜索树头结点head和结点个数size，节点最大最小值
 * 判断是否能跟父节点形成搜索树
 * 同时更新返回结果
 * 
 * 如果左右子树都不是null
 * 则拿二者中size较大的更新head和size
 * 
 * 如果二者中有null或者是可以形成搜索树的情况
 * 则判断是都能跟父node形成搜素树，如果能，更新返回值
 * 
 */
const maxBST = root => {
  if (!root) {
    return null
  }
  const leftResult = maxBST(root.left);
  const rightResult = maxBST(root.right);
  let max = root.value;
  let min = root.value;
  if (leftResult) {
    max = Math.max(max, leftResult.max)
    min = Math.min(min, leftResult.min)
  }
  if (rightResult) {
    max = Math.max(max, rightResult.max);
    min = Math.min(min, rightResult.min);
  }
  let head = null;
  let size = 0;
  if(leftResult) {
    heade =leftResult.head;
    size =leftResult.size;
  }
  if (rightResult && rightResult.size > size) {
    head = rightResult.head;
    size = rightResult.size;
  }
  let isBST = false;
  if (
    (!leftResult || leftResult.isBST) &&
    (!rightResult || rightResult.isBST) &&
    (
      (!leftResult || leftResult.max < root.value) &&
      (!rightResult || rightResult.min > root.value)
    )
  ) {
    isBST = true;
    head = root;
    const leftsize = leftResult ? leftResult.size : 0;
    const rightsize = rightResult?rightResult.size : 0;
    size = leftsize + 1 + rightsize;
  }
  return {
    head,
    size,
    isBST,
    min,
    max
  }
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


/**
 * 求完全二叉树节点个数
 */
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

/***
 * 前缀树
 * 
 * 用于描述一个由字符串组成的数组
 * 假如现在有一个数组List长这样：['acb','bdf', 'ace']
 * 将数组中每个字符串中的每个字母当做树的edge的weight
 * 每个节点包含两个属性
 * {
 *    pass: 有多少字符串经过
 *    end: 当前节点是否是字符串最后一个字母
 *    nexts: 用0-25的下标位置表示是否有a-z26个字母为权重的边，有的话，把边的to节点存入
 * }
 * 数组List 表示成前缀树会成为这样子
 * 
 *                     {pass: 3, end: 0}
 *                    a/                 \b
 *           {pass: 2, end: 0}     {pass: 1, end: 0}
 *                 c/                      \d
 *          {pass: 2, end: 0}          {pass: 1, end: 0}
 *            b/        \e                   \f
 * {pass: 1, end: 1}  {pass: 1, end: 1}     {pass: 1, end: 1}  
 * 
 * 好处就是可以直接通过pass,end值了解到数组中字符串的情况
 * 比如检查摸个字符串是否出现过
 * 就遍历树的节点到该字符串最后一个字符看该edge的toNode的end值是否不等于0，
 * 大于0，出现过end次，等于0，就是没有出现过
 * 
 * 再比如检查有多少字符串是以某个字符串开头的(做前缀)，同样遍历到该字符串最后一个字母的边的toNode
 * 该toNode的pass值就是有多少字符串以该字符串开头
 * 
 * 
 * 题目： 一个字符串数组arr1,另一个字符串数组arr2,
 * arr2 中有哪些字符是arr1中出现的，请打印
 * arr2 中有哪些字符是作为arr1中某个字符串前缀出现的，请打印
 * arr2 中有哪些字符是作为arr1中某个字符串前缀出现的，请打印arr2中出现次数最多的前缀
 * 
 */

 class treeNode {
  constructor() {
    this.pass = 0;
    this.end = 0;
    this.nexts = {};
  }
}

class PreTree {
  constructor () {
    this.root = new treeNode;
  }
  // 将字符串加入树中
  insert(str) {
    if(!str) {
      return;
    }
    const list = str.split('').filter(e=>e);
    let node = this.root;
    node.pass++;
    let index = 0;
    for(let i = 0; i< list.length;i++) { // 从左往右遍历字符串
      const char = list[i]; // 由字符对应成走向哪条路
      if (!node.nexts[char]) {
        node.nexts[char] = new treeNode()
      }
      node = node.nexts[char];
      node.pass++;
    }
    node.end++
  }
  // str 之前加入过几次
  search(str) {
    if(!str) {
      return 0;
    }
    let node = this.root;
    const list = str.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(node.nexts[char]) {
        node = node.nexts[char];
      } else {
        return 0;
      }
    }
    return node.end;
  }
  // 所有加入的字符串中，有几个是以pre这个字符串作为前缀的
  prefixNumber(pre) {
    if(!pre) {
      return 0;
    }
    let node = this.root;
    const list = pre.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(node.nexts[char]) {
        node = node.nexts[char];
      } else {
        return 0;
      }
    }
    return node.pass;
  }
  // 删除已经加在树里面的字符串
  delete(str) {
    if(!this.search(str)) {
      return;
    }
    let node = this.root;
    node.pass--
    const list = str.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(!(--node.nexts[char].pass)) {
        delete node.nexts[char];
        return
      }
      node = node.nexts[char];
    }
    node.end--;
  }
}
const tree = new PreTree();
const arr = ['abf', 'abc', 'abe', 'bkg', 'bsd'];
for(let i = 0; i<arr.length; i++) {
  tree.insert(arr[i]);
}
console.log(tree);

/**
 * 给你一个字符串数组，每个字符串代表一种目录结构,每一层用\分割
 * 请将所有目录按以下规则打印出来
 * 子目录直接列在父目录下面
 * 并比父目录向右进两格
 * 同一级的需要按字母顺序排列，不能乱
 * 例如： ['b\cst', 'd\\', 'a\d\e', 'a\b\e']
 * 打印结果
 * a
 *   b
 *     c
 *   d
 *     e
 * b
 *   cst
 * d
 * 
 * 思路：
 * 使用前缀树
 * 构建树的时候，将路径指向的结点也标识成path上的名称
 * 并在父节点存储map结构，用于判断是否已经有该path,用于按顺序打印
 * 然后深度优先遍历
 * 每多一层，多加俩空格
 * 
 */
class Node {
  constructor(value) {
    this.value = value;
    this.next = {};
  }
}
const generatePreTree = (arr, parent) => {
  const allStrList = arr.map(str => str.split('\\'));
  const root = new Node(-1);
  for(let i = 0; i < allStrList.length; i++) {
    const currStr = allStrList[i];
    let node = root;
    for (let j = 0; j< currStr.length; j++) {
      const path = currStr[j];
      if(!node.next[path]) {
        node.next[path] = new Node(path);
      }
      node = node.next[path];
    }
  }
  return root
}
const generateSpace = level => {
  let space = '';
  for (let i = 0; i < level * 2; i++) {
    space += ' ';
  }
  return space;
}
const printProcess = (node, level) => {
  const list = Object.keys(node.next).sort((a,b) => b > a ? -1 : 1);
  if (!list.length) {
    return;
  }
  const space = generateSpace(level);
  for(let i = 0; i<list.length; i++) {
    const currNode = node.next[list[i]];
    console.log(`${space}${currNode.value}`);
    printProcess(currNode, level+1);
  }
}
const printPath = arr => {
  const root = generatePreTree(arr);
  printProcess(root, 0)
}
printPath(['b\\cst', 'd\\', 'a\\d\\e', 'a\\b\\e']);


/**
 * 树型dp套路
 * 
 * 树型dp套路使用前提:
 * 如果题目求解目标是S规则，则求解流程可以定成以每一个节点的子树在S规则下的每一个答案，
 * 并且最终答案一定在其中
 * 
 * 步骤：
 * 1. 以某个节点X为头节点的子树中，分析答案有哪些可能性，
 *    并且这种分析师以X的左子树，X的右子树和X的整颗树的角度来考虑可能性的
 * 2. 根据第一步的可能性，列出所有需要的信息
 * 3. 合并第二步的信息，对左右子树提出同样的要求，并写出信息结构
 * 4. 设计递归函数，递归函数是处理以X为头节点的情况下的答案
 *    包括设计递归的basecase,默认直接得到左右子树的所有信息，以及把可能性做整合，
 *     并且要返回第三步的信息结构
 */

/**
 * 【题目】二叉树节点间的最大距离问题
 * 
 * 从二叉树的结点a出发，可以向上或者向下走，但沿途的节点只能经过一次，
 * 到达节点b时路径上的节点个数叫做a到b的距离，那么二叉树任何两个节点之间都有距离
 * 求整颗树上的最大距离
 * 
 * 思路：
 * 想象任意一个结点从发
 * 如果包含这个节点, 最大距离就是从左子树最低的叶子结点到右子树最低的叶子结点，
 * 就是左子树高+当前节点1个+右子树高度
 * 
 * 如果不包含当前节点，那么就看左右子树里面谁的最大距离大要哪个
 * 
 */

const maxLength = node => {
  if(!node) {
   return {
     maxLength: 0,
     height:0
   }
  }
  const leftInfo = maxLength(node.left);
  const rightInfo = maxLength(node.right);
  const maxHeight = leftInfo.height + 1 + rightInfo.height;
  const maxLengthValue = Math.max(maxHeight, Math.max(leftInfo.maxLength, rightInfo.maxLength));
  const height = Math.max(leftInfo.height, rightInfo.height) + 1;
  return {
    maxLength: maxLengthValue,
    height
  } 
}

/**
 * 【题目】派对最大快乐值
 *  员工的信息定义如下：
 *  class Employee {
 *    int happy; // 员工可以带来的欢乐值
 *    list subordinates; // 这名员工有哪些直接下级
 *   }
 * 公司的每个员工都符合类的描述，整个公司结构可以看做是一颗标准的，没有环的多叉树
 * 树的头结点是公司唯一的老板，除老板之外的每个员工都有唯一的直接上级，
 * 叶结点是没有任何下属的基层员工(subordinates), 除基层员工外，每个员工都有一个或多个直接下级
 * 
 * 公司现在要办party,你可以决定哪些员工来，哪些员工不来，但要遵循如下规则
 * 1. 如果某个员工来了，那么这个员工的所有直接下级都不能来
 * 2. 派对的整体快乐值是所有到场员工的快乐值和
 * 3. 你的目标是让派对的快乐值最大
 * 
 * 给定这棵树的头结点，求最大快乐值
 * 
 * 思路：
 * 1. 当前节点来 ， cur.happy + nexts各节点不来的快乐值
 * 2. 当前节点不来 , + max (next各节点 来, 各节点 不来之和）
 * max(当前值来，当前值不来)
 */

const process = node => {
  if(!node.nexts.length) {
     return {
       come: node.happy,
       absent: 0
     }
   }
  const { happy, nexts } = node;
  let come = happy;
  let absent = 0;
  for(let i = 0; i<nexts.length; i++) {
    const result =  process(nexts[i]);
    const max = Math.max(result.come, result.absent);
    absent +=max;
    come +=result.absent;
  }
  return {
    absent,
    come
  }
 }

 const getMaxHappy = node => {
   const result = process(node);
   return Math.max(result.absent, result.come);
 }

 /**
 * 二叉树每个结点都有一个int型的权值，给定一颗二叉树，
 * 要求计算出根结点到叶结点的所有路径中
 * 权值和最大的值为多少
 */
let maxSum = Number.MIN_VALUE;
const process = (node, prevSum) => {
  if (!node.left && !node.right) {
    maxSum = Math.max(maxSum, prevSum + node.value)
  }
  if (node.left) {
    process(node.left, prevSum + node.value);
  }
  if(node.right) {
    process(node.right, prevSum + node.value);
  }
}
const maxPath1 = head => {
  process(head, 0);
  return maxSum;
}

const process2 = node => {
  if(!node.left && !node.right) {
    return node.value;
  }
  let next = Number.MIN_VALUE;
  if(node.left) {
    next = process2(node.left)
  }
  if(node.right) {
    next = Math.max(next, process2(node.right));
  }
  return node.value + next;
}
const maxPath2 = head => {
  
  return process2(head);
}
 /**
  * 有序表
  * 1. 
  * 平衡树： 左边数据< 根结点 <右边数据,左右子树高度差相差不多
  * 树的左旋： 将头结点向左倒, 头结点成为左子树，原来右子树的左子树做原来头结点右子树
  * 树的右旋： 将头结点向右倒, 头结点成为右子树，原来左子树的右子树做原来头结点左子树
  * 
  * 适用平衡树调整规则的常见类型有：红黑树，AVL,SB,他们都属于BST(平衡搜索二叉树)
  * 他们都可以用左右旋的方法实现响应平衡规则的树，只是旋的规则不同
  * 
  * 2. 跳表
  */

  /**
   * SB树
   * 平衡性：
   * 每棵子树的大小，不小于其兄弟的子树大小
   * 每棵叔叔树的大小，不小于其任何侄子树的大小
   */

   /**
    * 红黑树
    * 平衡性：
    * 1. 每个结点不是红就是黑
    * 2. 整棵树头结点和叶结点(null)是黑点
    * 3. 红点不相邻
    * 4. cur为当前头结点，从cur出发到叶子结点的路径上，经过的黑点一样多
    * 
    */

  /**
 * 给定一颗二叉树的头结点head
 * 已知所有节点都不一样，返回其中最大的且符合搜索二叉树条件的最大拓扑结构大小
 * 拓扑结构：不是子树，能连起来的结构都算
 * 
 * 思路：
 * 使用拓扑记录
 * 先求每个子树最大拓扑结构大小，再转换成跟结点最大拓扑大小
 * 再从所以记录中求最大值
 * 
 */

const modifyMap = (n, v, m, s) => {
  if(!n || !m.has(n)) {
    return 0
  }
  const r = m.get(n);
  if ((s && n.value > v) || ((!s) && n.value < v)) {
    m.delete(n);
    return r.l+r.r + 1;
  } else {
    const minus = modifyMap(s ? n.right : n.left, v, m,s);
    if(s) {
      r.r = r.r - minus;
    } else {
      r.l = r.l - minus;
    }
    m.set(n,r);
    return minus;
  }
}

const posOrder = (h, map) => {
  if(!h) {
    return 0;
  }
  const ls = posOrder(h.left, map);
  const rs = posOrder(h.right,map);
  modifyMap(h.left,h.value,map,true);
  modifyMap(h.right,h.value,map,false);
  const lr = map.get(h.left);
  const rr = map.get(h.right);
  const lbst = lr ?lr.l + lr.r + 1:0;
  const rbst = rr ? rr.l + rr.r + 1:0;
  map.set(h, { l: lbst, r: rbst });
  return Math.max(lbst + rbst + 1, Math.max(ls, rs))
}

const bstTopoSize = head => {
  const map = new Map();
  return posOrder(head,map)
}