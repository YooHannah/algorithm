/**
 * 一些数据结构的概念
 */

/**
 * 哈希表
 * 
 * 1. 使用上是一种聚合结构
 * 2. 如果只有key，没有伴随数据value,可以使用Set结构
 * 3. 如果既有key, 又有伴随数据value, 可以使用Map结构
 * 4. 常用的增删该查操作的时间复杂度可以认为是O(1), 但常数时间比较大
 * 5. 存入哈希表的数据如果是基础类型，内部按值传递，内存大小级值大小
 * 6. 存入哈希表的数据如果是不是基础类型，内部按引用传递，内存是地址大小
 * 
 */

/**
 * 有序表
 * 
 * 1.也是一种聚合结构，也分为带value和不带value两类，内存原理同哈希，不过Key会按照一定顺序组织起来，哈希表不会
 * 2. 红黑树，AVL树，size-balance-tree和跳表都属于有序表结构，只是底层具体实现不同
 * 3. 固定操作
 * put 增，get 查key对应value，remove 删，containsKey 查key是否存在
 * firstKey 键值排序最左边(最小)的key
 * lastKey 键值排序最右边(最大)的key
 * floorKey 如果存入过key,返回key, 否则返回所有键值排序结果中前一个
 * ceilingKey 如果存入过key,返回key, 否则返回所有键值排序结果中后一个
 * 
 */

/**
 * 链表
 * 只需要给定一个头部结点head,就可以找到剩下的所有节点
 * 
 * 单链表
 * 
 * class Node {
 *   int value;
 *   Node next;
 * }
 * 
 * 
 * 双链表
 * 
 * class Node {
 *   int value;
 *   Node next;
 *   Node last;
 * }
 * 
 */
// 生成一个单链表
 const originarr = [1,2,3,4,5];
 const generateDoubleLink = (originarr)=> {
   const link = {};
   originarr.forEach((value, i) => {
     const currentNode = i ? link[i-1].next : {
         value: value,
         next: null,
         last: null
       };
      link[i] = currentNode;
     if(i != originarr.length - 1) {
       const nextValue = originarr[i+1]
       const nextNode = {
         value: nextValue,
         next: null,
         last: null
       };;
       currentNode.next = nextNode;
     }
     if(i) {
       const lastNode = link[i-1];
       currentNode.last = lastNode;
     }
   })
   return link;
 }
 
 const link = generateDoubleLink(originarr);
 console.log(link);

/**
 * 题目: 翻转单向和双向链表
 * 要求：如果链表长度N，时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 
 * 注意点： 要求返回head的逻辑要注意写法 head = F(head), 传入老head，返回新head
 */
const printLink = (head) => {
  let node = head;
  let str = ''
  while(node) {
    str+=`--->${node.value}`;
    // str+=`--->${node.value}/${node.next && node.next.value}/${node.rand && node.rand.value}`
    node = node.next;
  }
  console.log(str);
}
const turnLink = (head)=> {
  printLink(head);
  let lastNode = head;
  let currentNode = head.next;
  while(currentNode) {
    const nextNode = currentNode.next;
    currentNode.next = lastNode;
    lastNode = currentNode;
    currentNode = nextNode;
  }
  head.next = null;
  printLink(lastNode)
  return lastNode
}

const turnDoubleLink = (head) => {
  printLink(lastNode);
  let currentNode = head.next;
  let lastNode = head;
  while(currentNode) {
    const nextNode = currentNode.next;
    currentNode.next = lastNode;
    currentNode.last = nextNode;
    lastNode = currentNode;
    currentNode = nextNode;
  }
  head.next = null;
  printLink(lastNode)
  return lastNode
}

/**
 * 题目：打印两个有序链表的公共部分
 * 要求：如果链表长度N，时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 
 * 方案：使用merge思想，谁小谁往前移，相同打印然后一起往后移动，
 * 直到一个链表的结点指向null
 * 
 */

 const printCommonPart = (list1, list2) => {
  let i = 0;
  let j = 0;
  const length1 = list1.length;
  const length2 = list2.length;
  if(length1 < 2 && length1 === length2) {
    if(length1 === 1 && list1[0] === list2[0]) {
      console.log(list1[0]);
    }
    return
  }
  const fromSmallToBig = list1[0]<list1[1];
  while(i < length1 && j< length2) {
    if(list1[i] === list2[j]) {
      console.log(list1[i]);
      i++;
      j++;
    } else {
      if(list1[i] > list2[j]){
       fromSmallToBig ? j++ : i++;
      } else {
        fromSmallToBig ? i++ : j++;
      }
    }
  }
}

printCommonPart([10,9,8,7,6,5,4,3,2,1], [100,13,9,7,4,2,1])
printCommonPart([1,2,3,4,5,6,7,8,9,10], [1,4,7,9,10,100])

/**
 * 题目： 判断一个单链表是否为回文结构
 * 例子：1->2->1 返回true, 1->2->2->1, 返回true, 15->6->15,返回true,
 * 1->2->3,返回false
 * 要求：如果链表长度N，时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 
 * 方案一
 * 将整个链表push到栈里面，pop一个跟链表对比一个，都一样即回文
 * 缺点使用了额外空间
 * 
 * 以下方案使用快慢指针，注意链表长度是奇数偶数的情况中间结点如何判断
 * 方案二
 * 使用快慢指针,当快指针走到链表结尾时，慢指针走到链表中间
 * 将中间位置往后存入栈，然后pop跟原始链表比较
 * 缺点使用了额外空间
 * 
 * 方案三
 * 利用快慢指针找到中间位置后，将中间位置之后的链表反向指向中间结点
 * 中间位置结点指向null，此时链表尾部变成一个head
 * 根据两个head依次比较链表上的结点，直到中间结点指向null
 * 最后将链表后半段复原
 * 
 * 
 */
 const judgePalindrome = (head) => {
  let fast = head;
  let slow = head;
  while(fast) {
    slow = slow.next;
    fast = fast.next &&  fast.next.next;
  }
  const tempHead = turnLink(slow)
  let current1 = head;
  let current2 = tempHead;
  while(current1 && current2) {
    if(current1.value !== current2.value) {
      turnLink(tempHead)
      console.log('不是回文')
      return false
    }
  }
  console.log('是回文')
  turnLink(tempHead)
  return true
}
judgePalindrome(link[0])
console.log(link)

/**
 * 题目：将单向链表按某值划分成左边小，中间相等，右边大的形式
 * 给定一个单链表head,节点的值类型是整型，再给定一个整数pivot.
 * 实现一个调整链表的函数， 将链表调整为左部分值都是小于pivot的节点，
 * 中间部分都是值等于pivot的节点，右部分是值大于pivot的节点
 * 
 * 要求： 时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 进阶：调整后所有节点间相对顺序和调整前一样
 *
 * 方案一：将链表转成数组，在数组里面进行partition, 然后将数组里面的值串起来
 * 
 * 方案二：定义小于值的头尾结点指针，等于值的头尾指针，大于值的头尾结点
 * 依次遍历链表，根根据判断结果，变更上面6个变量的值
 * 最终将链表分成大于值，等于值，小于值，三个链表，再将三个链表串起来
 * 注意处理这三部分没有值的情况
 */
 const generatePartLink = (head,tail,node) => {
  if(head) {
    if(tail) {
      tail.next = node;
      tail = node;
      tail.next = null;
    } else {
      tail = node;
      head.next = tail;
    }
  } else {
    head = node;
    head.next = null;
  }
  return { head, tail };
}
const linkPartition = (head, value) => {
  let smallerHeader = null;
  let smallerTail = null;
  let equalHeader = null;
  let equalTail = null;
  let biggerHeader = null;
  let biggerTail = null;
  let currentNode = head;
  while(currentNode) {
    const currentValue = currentNode.value;
    const nextNode = currentNode.next;
    if(currentValue < value){
      const { head, tail } = generatePartLink(smallerHeader, smallerTail, currentNode);
      smallerTail = tail;
      smallerHeader = head; 
    }else if(currentValue === value){
      const { head, tail } = generatePartLink(equalHeader,equalTail,currentNode);
      equalTail = tail;
      equalHeader = head; 
    }else if(currentValue > value){
      const { head, tail } = generatePartLink(biggerHeader,biggerTail,currentNode);
      biggerTail = tail;
      biggerHeader = head; 
    }
    currentNode = nextNode;
  }
  // printLink(smallerHeader)
  // printLink(equalHeader)
  // printLink(biggerHeader)
  const hasSmaller = smallerTail || smallerHeader;
  const hasEqual = equalTail || equalHeader;
  const hasBigger = biggerHeader;
  if(hasSmaller) {
    hasSmaller.next = equalHeader || biggerHeader;
  } 
  if(hasEqual) {
    hasEqual.next = biggerHeader;
  }
  printLink(smallerHeader || equalHeader || biggerHeader)
  return smallerHeader || equalHeader || biggerHeader;
}



/**
 * 题目：复制含有随机指针的链表
 * 一种特殊的节点结构如下
 * class Node {
 *   int value;
 *   Node next;
 *   Node rand;
 *   Node(int val) {
 *     value = val
 *   }
 * }
 * 
 * rand指针是单链表节点结构中新增的指针，rand可能指向链表中的任意一个节点，也可能指向null
 * 给定一个由Node节点类型组成的无环单链表的头节点head，
 * 请实现一个函数完成整个链表的复制，并返回复制的新链表的头节点
 * 
 * 要求： 时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 
 * 方案一
 * 使用哈希表，将复制的节点作为值存入以原始节点为key的哈希表中
 * 通过读取原始节点拿到next和rand指针，赋值给从哈希表里面拿到的值
 * 再从哈希表里面拿值形成复制链表
 * 缺点使用了额外空间
 * 
 * 方案二
 * 将复制的节点存在原始链表节点后边，形成a->复a->b->复b -> null
 * 利用位置关系处理next和rand指向，最后将复制链表从原始链表摘出来
 * 
 */
 const copyRandomLink = (head) => {
  let currentNode = head;
  while(currentNode) {
    const nextNode = currentNode.next;
    const currentCopyNode = {...currentNode};
    currentNode.next = currentCopyNode;
    currentCopyNode.next = nextNode;
    currentNode = nextNode;
  }
  currentNode = head;
  while(currentNode) {
    const copyNode = currentNode.next;
    const randomNode = currentNode.rand;
    copyNode.rand = randomNode.next;
    currentNode = copyNode.next;
  }
  const copyLinkHead = head.next;
  currentNode = head;
  while(currentNode) {
    const currentCopyNode = currentNode.next;
    const nextNode = currentCopyNode.next;
    currentNode.next = nextNode;
    currentCopyNode.next = nextNode && nextNode.next;
    currentNode = nextNode;
  }
  printLink(head);
  printLink(copyLinkHead);
  return copyLinkHead
}


/**
 * 题目：两个单链表相交的一系列问题
 * 
 * 给定两个有环也可能无环的单链表，头节点head1和和head2
 * 请实现一个函数，
 * 如果两个链表相交，请返回相交的第一个节点，
 * 如果不相交，返回null
 * 
 * 要求：如果两个链表长度之和为N， 时间复杂度要求为O(N),额外空间复杂度为O(1)
 * 
 * 思路：
 * 1，如何判断单链表是否有环
 * 快慢指针，两个指针相等了，一定有环
 * 将快指针重新回到head,每次走一步，二者相交点即入环第一个节点
 * 2. 如何判断有无环同步情况下两链表是否相交
 * a. 二者都没有环，找到各自最后一个结点看是有相同，相同则相交，不同就是不相交
 *    相交的话，长的链表先走二者长度差个点，二者再每次往下走一步，找到相同节点即相交第一个节点
 * b. 二者都有环，入环节点相同，二者相交，长链表先走长度差个结点，再一起往下走，走到相同的则是相交点
 * c. 二者都有环，入环节点不同，让其中一个入环节点走一个环看是否经过另一个入环节点，经过则相交，不经过则不想交
 */

// 判断是否有环
const getLoopNode = (head) => {
  if(head === null || head.next === null || head.next.next === null) {
    return null;
  }
  let n1 = head.next;
  let n2 = head.next.next;
  while(n1 != n2) {
    if(n2.next === null || n2.next.next === null) {
      return null;
    }
    n2 = n2.next.next;
    n1 = n1.next;
  }
  n2 = head;
  while(n1 != n2) {
    n1 = n1.next;
    n2 = n2.next;
  }
  return n1;
}

// 如果两个链表都没有环
const noLoop = (head1, head2) => {
  if(head1 === null || head2 === null) {
    return null;
  }

  let cur1 = head1;
  let cur2 = head2;
  let n = 0;
  while(cur1.next != null) {
    n++;
    cur1 = cur1.next;
  }
  while(cur2.next != null) {
    n--;
    cur2 = cur2.next;
  }
  if(cur1 != cur2) {
    return null
  }
  cur1 = n > 0 ? head1 : head2;
  cur2 = cur1 === head1 ? head2 : head1;
  n = Math.abs(n);
  while(n != 0) {
    n--;
    cur1 = cur1.next;
  }
  while(cur1 != cur2) {
    cur1 = cur1.next;
    cur2 = cur2.next;
  }
  return cur1;
} 

// 如果两个单链表都有环
const bothLoop = (head1, loop1, head2, loop2) => {
  let cur1 = null;
  let cur2 = null;
  if(loop1 === loop2) {
    cur1 = head1;
    cur2 = head2;
    let n = 0;
    while(cur1 !== loop1) {
      n++;
      cur1 = cur1.next;
    }
    while(cur2 !== loop2) {
      n--;
      cur2 = cur2.next;
    }
    cur1 = n > 0 ? head1 : head2;
    cur2 = cur1 === head1 ? head2 : head1;
    n = Math.abs(n);
    while(n != 0) {
      n--;
      cur1 = cur1.next;
    }
    while(cur1 != cur2) {
      cur1 = cur1.next;
      cur2 = cur2.next;
    }
    return curl1;
  } else {
    cur1 = loop1.next; // 从入环节点下一个开始走环，找loop2
    while (cur1 != loop1) {
      if(cur1 == loop2) {
         return loop1 || loop2;
      }
      cur1 = cur1.next;
    }
    return null;
  }
}


/**
 * 面试链表解题方法论
 * 
 * 1. 对于笔试，不用太在乎空间复杂度，一切为了时间复杂度
 * 2. 对于面试，时间复杂度依然放在第一位，但是一定要找到空间最省的方法
 * 
 * 重要技巧
 * 
 * 1. 使用合适的结构作为额外存储空间进行记录，如哈希表
 * 2. 善于用快慢指针
 */