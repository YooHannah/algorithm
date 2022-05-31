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
/**
 * 一个帖子最高分数定义为用户所有打分记录中，连续打分数据之和的最大值
 * 计算一个帖子曾经得到过的最高分数为多少
 * 例如，打分记录为：[1,1,-1,-10,11,4,-6,9,20,-10,-2]
 * 最高分为11 + 4 + (-6) + 9 + 20 = 38
 * 
 * 思路：
 * 相当于寻找数组中累计和最大且最长的子数组
 * 假设该子数组位于i-j这一段
 * 那么可以推断
 * i < curr < j ,i ~ curr这段和肯定大于0
 * curr < i -1, curr ~ i-1 这段和肯定小于0
 * 
 * 那么定义两个变量currSum 和maxSum
 * currSum是持续累加和
 * 如果maxSum小于currSum就把maxSum = currSum
 * 如果当前currSum小于0，就置为0，说明之前的累加和小于0，从现在开始重新累加
 * 如果不小，就保持不动
 */
const getMaxSum = arr => {
  let currSum = 0;
  let maxSum = 0;
  for(let i = 0; i < arr.length; i++) {
    currSum += arr[i];
    maxSum = Math.max(maxSum, currSum);
    if (currSum < 0) {
      currSum = 0
    }
  }
  return maxSum
}
 /**
  * 给定一个整型矩阵，返回子矩阵中最大累计和
  * 
  * 思路：
  * 使用压缩矩阵成数组的思路
  * 假如现在有一个8 * 9 矩阵
  * 依次计算出
  * 0 ~ 0
  * 0 ~ 1  
  * 0 ~ 2
  * ...
  * 2 ~ 8
  * ...
  * 8 ~ 8
  * 这些行组成的矩阵的累计和
  * 只有一行，累计和即为各位置上的原有数字，转成数组累计和
  * 多行则是相同col位置上累计和，再转成数组累计和
  * 每种情况算出累计和最大值后，从中找大小
  */
  const addResult = (result, sumArr) => {
    const length = sumArr.length;
    for(let i = 0;i<length;i++) {
      let init = sumArr[i];
      result.push(init)
      for (let j = i+1; j<length;j++) {
        init +=sumArr[j];
        result.push(init)
      }
    }
    return result;
  }
  const getSum = (arr1, arr2) => {
    const length = arr1.length;
    const result = [];
    for(let i = 0;i<length; i++) {
      const sum = arr1[i] + arr2[i];
      result.push(sum);
    }
    return result;
  }
   const getMaxMatrixSum = matrix => {
     const height = matrix.length;
     const width = matrix[0].length;
     let result = [];
     for(let i = 0; i< height;i++) {
      const line = matrix[i];
      let sumArr = line.slice();
      result = addResult(result, sumArr);
      for(let j = i+1; j< height; j++) {
        const nextLine = matrix[j];
        sumArr = getSum(sumArr,nextLine);
        result = addResult(result, sumArr);
      }
     }
     return result.sort((a,b) => b-a)[0]
   }
  /*********************************************************** */

  /**
   * 现有一个数组arr，表示一条路需要照明的情况，
   * 每个元素不是'.' 就是'x', '.' 表示需要照明的地方，'X' 表示不需要，灯也照不到
   * 假如一个路灯放在poi位置，那么它可以照亮poi -1 ,poi, poi+1三个袁元素
   * 如果他们三个都是‘.’的话
   * 
   * 求问这条路需要多少路灯
   * 
   * 思路：
   * 判断当前元素是‘.’ 还是‘x’
   * 如果是x, 继续往后遍历
   * 如果是.，路灯数加1
   * 判断往后一个有没有越界
   * 越界的话，停止
   * 
   * 如果没有越界
   * 判断是x还是.
   * 假如现在位于curr
   * 如果是x,越过x 继续遍历, 相当于从curr + 2继续
   * 如果是., 连续越过两个，继续遍历 相当于从curr + 3继续
   * 因为如果是.,说明现在有两个. 连续，第三个元素无论是x还是. 
   * 都会需要一盏灯，然后从这组需要灯的位置继续往后
   * 
   * 
   */
  let needLamb = road => {
    const count = 0;
    for(let i = 0; i< road.length; i++) {
      if(road[i] === '.') {
        count++;
        const next = i + 1;
        if (next === road.length) {
          break
        }
        if (road[next] === '.') {
          i = i+2;
        } else {
          i = i + 1
        }
      }
    }
    return count;
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
   * 将数字转化成中英文表达
   * 例如，
   * 17 => 十七，
   * 117 =>一百一十七
   * 21,230,123,456 => 21 Billion 230Million 123 Thousand 456
   */

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
  
/**
* 求最长递增子序列
* 
* 思路:
* 子序列可以不连续
*
* 方法1
* 申请一个相同长度的数组dp
* 数组dp中每个位置存放原序列arr中相同位置为结尾的最长子序列长度，
* 其中值最大的就是最长的长度
* 如何形成dp?
* 假如当前位置i,找到0 ~ i-1之间小于arr[i]的数的位置
* 对应的找到dp里面的值
* 看dp位置上谁的值最大，用哪个加1,就是dp[i] 位置上的值
* 
* 方法2s
* 准备一个数组ends
* ends 上的每个位置的值，表示当前位置i+1长度的子序列，最小的结尾值是多少
* 试图构造出单调性，遍历完所有的值，ends长度就是最大长度
* 如何形成ends?
* 每次遍历到一个arr的值arr[i]，二分查找的去看arr[i]在ends中所在的位置
* 如果arr[i]夹在ends[m]和ends[m+1]之间，
* 说明当以arr[i] 结尾的最长子序列应该包含ends[m]
* 所以arr[i]对应的最长子序列长度为m+1, 此时要把原来ends的m+1位置对应的值改成arr[i]
* 因为arr[i] < ends[m+1],长度为m+2的子序列中结尾值最小的变成arr[i]
*/ 


  /**
   * 现在有一这样规律的数组
   * [1,12,123,1234,...12345678910,1234567891011,...]
   * 求问从第i个元素到第r个元素中有多少个数能够被3整除
   * 
   * 思路：
   * 考虑到可以使用的最大数字，所以不能单纯的用相应位置上的数据直接去对3取余
   * 一个数能不能被3整除，等价于一个数上的每位之和能否被3整除
   * 假如当前元素位于n位置，那么这个数能否被整除可以这样计算
   * (n*(n+1)/2)%3
   */
  const specialCase = (i,r) => {
    let count = 0;
    for(let n = i; n<r +1; n++) {
      const can = (n*(n+1)/2)%3;
      if (!can) {
        count++
      }
    }
    return count;
  }

  /************************************************* */


  /**
   * 给定一个数组A，长度n,有1<=A[i]<=n,且位于[1,n]的整数，
   * 其中部分整数会重复出现而部分不会出现
   * 找出[1,n]中所有未出现在A中的整数
   * 
   * 思路：
   * 尽可能的让i位置上的数据等于i+1,那么i位置上不等于i+1的数据就是没有出现过的数据
   */
  const findUnShowNumber = arr => {
    for(let i = 0; i < arr.length; i++) {
      while(arr[i] != i+1) {
        let pos = arr[i] -1;
        let temp = arr[pos];
        if(temp === pos + 1) {
          break;
        }
        arr[pos] = arr[i];
        arr[i] = temp;
      }
    }
    let count = 0;
    for(let i = 0; i < arr.length; i++) {
      if (arr[i] != i+1) {
        count++
      }
    }
    return count
  }

  /**
   * 现有一土豪想给主播冲人气从start刚好到达end,
   * 冲人气的方式有一下三种
   * a.点赞 花费x 个C币， 人气 +2
   * b.送礼 花费y 个C币，人气 * 2
   * c.私聊 花费z 个C币，人气 - 2
   * 其中end远大于start,且二者均为偶数
   * 求出土豪至少要花多少C币实现目的
   * 
   * 思路：
   * 递归
   * 分别用三种方式增加一次人气值后剩下的人气值如何增加的方式相加
   * 但是要注意边界条件
   * 从start到end过程，人气和花费C币数量都会递增，
   * 很有可能不会刚刚好到达end,
   * 那么要限制一下增加到多少不再尝试
   * 
   */
  /**
   * 
   * @param {之前用了多少C币} preMoney 
   * @param {当前人气值} curr 
   * @param {目标人气值} aim 
   * @param {增加2人气需要C币数量} add 
   * @param {翻倍人气需要C币数量} double 
   * @param {私聊花费C币数量} del 
   * @param {人气最高限制} limitAim 
   * @param {C币最多使用限制} limitCoin 
   */
  const process = (
    preMoney, curr, aim, add, double, del, limitAim, limitCoin
  ) => {
    if(
      curr > limitAim ||
      preMoney > limitCoin ||
      curr < 0
    ) {
      return Number.MAX_VALUE;
    }
    if(curr === preMoney) {
      return preMoney
    }
    let min = Number.MAX_VALUE;
    const p1 = process(preMoney+add, curr + 2, aim,  double, del, limitAim, limitCoin);
    if (p1 != Number.MAX_VALUE) {
      min = Math.min(p1, min);
    }

    const p2 = process(preMoney+double, curr * 2, aim,  double, del, limitAim, limitCoin);
    if (p2 != Number.MAX_VALUE) {
      min = Math.min(p2, min);
    }

    const p3 = process(preMoney+del, curr - 2, aim,  double, del, limitAim, limitCoin);
    if (p3 != Number.MAX_VALUE) {
      min = Math.min(p3, min);
    }
    return min;
  }
  const needC = (start, end, add, double, del) => {
    if(end - start < 0) {
      return -1
    }

    return process(preMoney, start, end, add, double, del, end*2, ((end-start)/2)*add);
  }


/***
* 现在输入一些数据，表示运营活动的相关情况
* 主播可以从任意活动开始，但是一定要将关联的后续活动参加完
* 
* 例如
* 
* 8 10
* 3 2000 0 1 1 0 0 0 0 0
* 3 4000 0 0 0 1 1 0 0 0
* 2 2500 0 0 0 1 0 0 0 0
* 1 1600 0 0 0 0 1 1 1 0
* 4 3800 0 0 0 0 0 0 0 1
* 2 2600 0 0 0 0 0 0 0 1
* 4 4000 0 0 0 0 0 0 0 1
* 3 3500 0 0 0 0 0 0 0 0
* 
* 第一行N和D，表示一共有N项活动，D表示活动周时长
* 0 < N <= 1000, 0 < D <= 10000
* 第1 ~ N + 1行描述每一个活动的信息
* 第一项表示参加活动需要时间
* 第二项表示将来可得报酬
* 之后的每一项表示和活动周内活动的关联关系
* 1表示有关联，0 表示没有关联
* 
* 例子中表示的活动从上到下标记为1 - 8
* 活动间关系如下
*       2  -       5
*    /      \    /    \
* 1            4 - 6  - 8
*    \      /    \    /
*       3          7
* 
* 互动由标记数字少的的指向数字大的
* 问一个主播从哪个活动开始直到完成最后一个活动，也就是活动8
* 能够获得最多报酬，且最少用时
* 
* 思路：
* 反正都要完成最后一个任务，那就从最后一个任务往回走开始计算
* 在每个活动结点维持一个天数-报酬Map结构
* 表示通过不同路径过来的情况下，累计活动天数可以拿到的报酬
* 全都遍历完后，计算每个结点下面Map表中找到天数最少报酬最多的一条数据
* 每个结点拿到后再做一次比较，找天数最少报酬最多的
* 
* 同级结点不在计算过程中仅保留天数少报酬多的情况是防止在遍历过程中出现
* 在当前路径累计报酬少，但是再往上面一个报酬多的情况，
* 因为移除报酬少的数据意味着不再继续一条路线的探索
*/



/**
 * 给定一个只由数字0和1，逻辑符号 & (与) | (或) 和 ^ (异或) 五种字符组成的字符串express
 * 再给定一个bool类型期待值desired，返回express能有多少种组合方式可以达到desired的结果
 * 举例：
 * express = "1^0|0|1".desired = false
 * 只有"1^（（0|0）|1）" 和 "1^（0|（0|1））" 两种组合可以得到false,返回2
 * express = "1".desired = false
 * 无组合，返回0
 * 
 */
 const invalid = list => {
   const length = list.length;
  if(!(length & 1)) {// 字符数量是奇数
    return true;
  }
  // 该是数字的位置应该是数字
  for(let i = 0; i<length; i = i+2) {
    if (!['1', '0'].includes(list[i])) {
      return true;
    }
  }
  // 该是符号的位置应该是符号
  for(i = 1; i<length; i = i+2) {
    if (!['&', '|', '^'].includes(list[i])) {
      return true;
    }
  }
  return false;
 } 
 const process = (list, desired, L, R) => {
   if( L === R) {
     const char = list[L];
     let result = false;
     if(char === '1') {
      result = desired ? 1: 0;
     }
     if(char === '0') {
      result = desired ? 0: 1;
     }
     return result;
   }
   let count = 0;
   for(let i = L+1; i < R; i+=2) {
    let sign = list[i];
    if (sign === '*') {
      if(desired) {
        count += process(list, desired, L, i - 1) * process(list,desired, i + 1, R ); 
      } else {
        count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
        count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
        count += process(list, false, L, i - 1) * process(list,false, i + 1, R );   
      }
    }
    if(sign === '|') {
      if(desired) {
        count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
        count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
        count += process(list, true, L, i - 1) * process(list,true, i + 1, R );  
      } else {
        count += process(list, false, L, i - 1) * process(list,false, i + 1, R );
      }
    }
    if(sign === '^') {
      if(desired) {
        count += process(list, true, L, i - 1) * process(list,false, i + 1, R );
        count += process(list, false, L, i - 1) * process(list,true, i + 1, R ); 
      } else {
        count += process(list, true, L, i - 1) * process(list,true, i + 1, R );
        count += process(list, false, L, i - 1) * process(list,false, i + 1, R ); 
      }
    }
   }
   return count;
 }
 const methods = (express, desired) => {
   if(!express) {
    return 0;
   }
   const list = express.split('');
   if (invalid(list)) {
    return 0;
   }
   return process(list, desired, 0, list.length -1)
 }

// 优化

const dpLive = (express, desired) => {
  const list = express.split('');
  const length = list.length;
  const tMap = new Array(length).fill(null).map(e => new Array(length).fill(0));
  const fMap = new Array(length).fill(null).map(e => new Array(length).fill(0));
  for(let i = 0; i< length; i+=2) {
    tMap[i][i] = list[i] === '1' ? 1:0;
    fMap[i][i] = list[i] === '1' ? 0:1;
  }
  for( let row = length - 3; row >= 0; row -=2) {
    for(let col = row + 2; col < length; col +=2) {
      for(let i = row + 1; i<col;i +=2) {
        const char = list[i];
        if (char === '&') {
          tMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '|') {
          tMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          tMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
          tMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '^') {
          tMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          tMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
        }
        if (char === '&') {
          fMap[row][col] += fMap[row][i -1] * tMap[i+1][col];
          fMap[row][col] += tMap[row][i -1] * fMap[i+1][col];
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
        if (char === '|') {
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
        if (char === '^') {
          fMap[row][col] += tMap[row][i -1] * tMap[i+1][col];
          fMap[row][col] += fMap[row][i -1] * fMap[i+1][col];
        }
      }
    }
  }
  return desired ? tMap[0][length-1] : fMap[0][length-1];
}
/**
* 在一个字符串中找到没有重复字符子串中最长的长度
* 
* 例如
* abcabccbb 最长子串是abc,长度是3
* 
* 思路：
* 子串要连续
* 遍历每个字符，当前字符位置是i,找
* 到0 - i-1范围内离i最近的和i位置字符相同的字符位置
* 而二者之间的距离就是不重复子串的长度
* 每个字符都得到后找最大的长度
* 注意：利用i-1位置长度，看位置i字符是否在该范围内
*/
const findMaxNoRepeatLength = str => {
  const result = [1];
  for(let i = 1; i< str.length; i++) {
    const temp = str.slice(0, i).split('');
    const pos = temp.findLastIndex(e => e === str[i]);
    let length = i - pos;
    length = length > result[i-1] ? result[i-1] + 1 : length;
    result.push(length);
  }
  return result.sort((a, b) => b-a)[0]
}
/**
 * 给定两个字符str1和str2,
 * 再给定三个整数，ic,dc,rc、
 * 分别代表插入，删除，替换一个字符的代价
 * 返回将str1转换成str2的最小代价
 * 
 * 思路：
 * 直接用动态规划思想
 * 计算上空串，并且将空串作为str1和str2的第一个字符。
 * 那么dp【i】【j】就代表从str1【0…i】->（转变为）str2【0…j】需要的花费
 * 这个花费来自于三个路径
 * 第一个路径：由插入得到。str1【0…i】先编辑成str2【0…j-1】，再由str2【0…j-1】插入到str2【0…j】
 * 即 dp【i】【j-1 】+ ic
 * 第二个路径，由删除得到。str1【0…i】先编辑成str1【0…i-1】，再由str1【0…i-1】转变为str2【0…j】
 * 即dp【i-1】【j】+dc
 * 第三个路径，由替换得到。
 * 而替换又分为两种情况：
 * 第一种为当前字符串匹配的情况：那么就等于dp【i-1】【j-1】
 * 第二种为当前字符串不匹配的情况：那么久等于dp【i-1】【j-1】+rc
 * 那么，最后dp【i】【j】的值为这四种情况中的最小值。
 */
const minCount1 = (str1, str2, ic,dc,rc) => {
  const length1 = str1.length;
  const length2 = str2.length;
  let dp = new Array(length1+1).fill(null).map(e => new Array(length2+1).fill(0));
  // 长度为i 的str1 变成长度为0的str2 需要的花费，只能删除操作
  for(let i = 1; i< length1 + 1; i++) {
    dp[i][0] = i * dc;
  }
  // 长度为0的str1变成长度为j的str2 需要的花费，只能插入操作
  for(let j = 1; j< length2 + 1; j++) {
    dp[0][j] = j * ic;
  }
  // 长度为i的str1变成长度为j的str2需要的花费
  for (i = 1; i<length1+1; i++) {
    for( j = 1; j< length2 +1; j++) {
      if(str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = dp[i-1][j-1] + rc;
      }
      dp[i][j] = Math.min(dp[i][j], dp[i-1][j] + dc);
      dp[i][j] = Math.min(dp[i][j], dp[i][j - 1] + ic);
    }
  }
  return dp[length1][length2]
}


/**
 * 给定一个全是小写字母的字符串str
 * 删除多余字符，使得每个字符只保留一个
 * 并让最终结果字符串的字典序最小
 * 例如
 * str = ‘acbc’,删除掉第一个c,得到‘abc’是所有结果字符串中最小的
 * str = 'dbcacbca',删除第一个b和c,第二个c和a,得到'dabc'
 * 是所有结果字符串中字典序最小的
 * 
 * 思路：
 * 优先保证每个字符都在，
 * 同时记录当前字符串中字典序中排列靠前的字符的位置pos
 * 每次找到一个只有一个字符的时候
 * 从pos开始切割字符串继续处理剩下字符
 */

const remove = str => {
  if (str.length === 1) {
    return str;
  }
  const list = str.split('');
  const count = {};
  for(let i = 0;i<list.length; i++) {
    const char = list[i];
    if (!count[char]) {
      count[char] = 0;
    }
    count[char]++
  }
  let minACSIndex = 0;
  for (let j = 0; j < list.length; j++) {
    const currMin = list[minACSIndex].charCodeAt();
    const curr = list[j].charCodeAt();
    minACSIndex = currMin > curr ? j : minACSIndex;
   if (--count[list[j]] === 0) {
     break
   } 
  }
  const start = list[minACSIndex];
  const subStr = list.slice(minACSIndex + 1).filter(e => e != start).join('');
  return start + remove(subStr);
}




/**
 * 对26个字母进行升序排列组合最终达到的长度，
 * [a,b,c,...z,ab,ac,ad,...az,bc,bd...bz,...abc,....bcd,...xyz...]
 * 随便输入一个升序组合，求位于该数组的位置
 */
const base = 'abcdefghijklmnopqrstuvwxyz'.split('');
// 以base[charpos]开头，长度为length的字符串有多少个
const renderCustome = (charPos, length) => {
  if(length === 1) {
    return 1;
  }
  let count = 0;
  for(let i = charPos+1; i< 26; i++) {
    count += renderCustome(i, length - 1);
  }
  return count;
}
// 长度为length的字符串有多少个
const render = length => {
  let count = 0;
  for(let j = 1; j<=26;j++) {
    count += renderCustome(j-1, length)
  }
  return count
}
 const findPos = str => {
   const length = str.length;
   const first = str[0];
   let count = 0;
   const firstPos = base.findIndex(e => e === first);
   // 长度小于length的升序字符串有多少
   for(let i = 1; i< length; i++) {
     count += render(i);
   }
   //排在首字母前面的字母形成的长度为length的字符串有多少
   for(let m = 0; m < firstPos; m++) {
     count +=  renderCustome(m, length);
   }
   let pre = firstPos;
   for(let j = 1; j<length; j++) {
     const curr = str[j];
     const currPos = base.findIndex(e=> e === curr);
     // 升序，第二个字母肯定位于上一个字母的后面，所以 k = pre + 1
     for(let k = pre + 1; k< currPos; k++) {
      count += renderCustome(k, length - j);
     }
     pre = currPos;
   }
   return count;
 }
