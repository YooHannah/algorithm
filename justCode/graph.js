/**
 * 图的存储方式
 * 1. 邻接表
 *  以点为key,值为与他直接相连的点的集合
 * 2. 邻接矩阵
 *  如果两点有链接，则以这两个点为坐标确定的值为二者的权重，否则值为正无穷
 * 3.其他
 * 图的表达方式有很多，为方便算法实现，可以选择自己比较擅长的表达方式，实现不同的算法
 * 当遇到图的其他表达方式时，先将其他表达方式转成自己擅长的表达方式即可、
 * 
 * 如下表达方式
 */

class Graph {
  HashMap<Integer Node> nodes; // 点集合，integer仅代表节点编号，第几个点
  HashSet<Edge> edges; // 边集合
}

class Edge {
  int weight; // 边的权重
  Node from; // 对于有向图来说，边开始的节点 对于无向图来说，会有两条from to相反的边
  Node to;// 对于有向图来说，边指向的节点
}

class Node {
  int value; //当前节点的值
  int in; // 入度，有几条边指向它
  int out; // 出度，从它出发的边有几条
  ArrayList<Node> nexts; // 从自己出发相邻的点
  ArrayList<Edge> edges; // 从自己出发的边
}

/**
 * 
 * 假如现在有一个[[weight, from节点上的值，to节点上面的值]]
 * 这样的一个数组形式表示的图, 任何节点值不同
 * 将这个结构转换成上面表达图的形式
 */
const creatNode = value => (
  {
    value: value,
    in: 0,
    out: 0,
    nexts: [],
    edges: []
  }
);
const creatGraph = matrix => {
  const graph = {
    nodes: new Map(),
    edges: new Set()
  }
  for(let i = 0; i< matrix.length; i++) {
    const [weight, fromValue, toValue] = matrix[i];
    if (!graph.nodes.get[fromValue]) {
      graph.nodes.set(fromValue, creatNode(fromValue))
    }
    if (!graph.nodes.get[toValue]) {
      graph.nodes.set(toValue, creatNode(toValue))
    }
    const from = graph.nodes.get(fromValue);
    const to = graph.nodes.get(toValue);
    const edge = { weight, from, to };
    from.out +=1;
    to.in +=1;
    from.nexts.push(to);
    from.edges.push(edge);
    graph.edges.push(edge);
  }
  return graph;
 }

 /**
  * 图的宽度优先遍历
  * 1. 利用队列实现
  * 2. 从源节点开始依次按照宽度进队列(与当前节点相连的节点都进去)，然后弹出
  * 3. 每弹出一个点，把该节点所有没有进过队列的临界点放入队列
  * 4. 直到队列变空
  * 
  */

 const bfs = node => {
   if (!node) {
    return null
   }
   const quenu = [];
   const set = new Set();
   quenu.push(node);
   set.add(node);
   while(!queue.length) {
     const cur = queue.shift();
     console.log(cur.value);
     cur.nexts.forEach(nextNode => {
       if(!set.has(nextNode)) {
        set.add(nextNode);
        queue.push(nextNode);
       }
     })
   }
 }


 /**
  * 广度优先遍历
  * 1.利用栈实现
  * 2. 从源节点开始把节点按照深度放入栈(与当前节点相连的节点只进去一个)，然后弹出
  * 3. 每弹出一个点，把该节点下一个没有进过栈的邻接点放入栈中
  * 4，直到栈变空
  * 
  */

 const dfs = node => {
   if (!node) {
    return
   }
   const stack = [];
   const set = new Set();
   stack.push(node);
   set.add(node);
   console.log(node.value);
   while(stack.length) {
     const currNode = stack.pop();
     currNode.nexts.forEach(nextNode => {
       if(!set.has(nextNode)) {
        stack.push(currNode);
        stack.push(nextNode);
        set.add(nextNode);
        console.log(nextNode.value);
        break
       }
     })
   }

 }

 /**
  * 拓扑排序算法
  * 
  * 适用范围：要求有向图，且有入度为0的结点，且没有环
  * 实际应用： 处理项目编译中的文件依赖关系
  * 
  * 思路：
  * 从入度为0的节点开始，遍历其nexts节点，
  * 并记录遍历过的节点入度减一
  * 当节点入度减为0时，存入集合中即所有指向整个节点的点都已经被遍历过了
  * 
  */

 const sortedTopology = graph => {
   // key: Node, value: 剩余的入度
   const inMap = new Map();
   const zeroInQueue = []; // 入度为0的点的集合
   graph.nodes.forEach(node => {
     inMap.set(node, node.in);
     if(!node.in) {
      zeroInQueue.push(node)
     }
   })
   // 排序结果
   const result = [];
   while(zeroInQueue.length) {
     const currNode = zeroInQueue.shift();
     result.push(currNode);
     currNode.nexts.forEach(nextNode => {
       inMap.set(nextNode, inMap.get(nextNode)-1);
       if (!inMap.get(nextNode)) {
        zeroInQueue.push(nextNode)
       }
     })
   }
   return result;
 }

 /**
  * kruskal算法
  * 适用范围: 要求无向图
  */

 /**
  * prim算法
  * 适用范围: 要求无向图
  */

 const primMst = graph => {
   const priorityQueue = []; // 用于存放解锁的边，每次取权重最小的
   const set = new Set();
   const result = new Set(); // 存放每次选中的边

   graph.nodes.forEach(node=> {
     // node 是起点
      if(!set.has(node)) {
        set.set(node);
        node.edges.forEach(edge => priorityQueue.push(edge));
        while(priorityQueue.length) {
          const edge = priorityQueue.sort((a,b)=>a.weight-b.weight)[0];
          const toNode = edge.to;
          if (!set.has(toNode)) {
            set.set(toNode);
            result.set(toNode);
            toNode.edges.forEach(edge=> priorityQueue.push(edge))
          }
        }
      }
    })
    return result;
 }

 /**
  * Dijkstra算法
  * 适用范围: 没有权值为负数的边，或者有权值为负值的边，但该边不再一个环里面
  * 
  * 目的： 用权重最小的边，遍历完整个图，每次找当前节点出发边的最小权重的边走，走过的点不再走
  */
const getMinDistanceAndUnselectedNode = (distanceMap, touchedNodes) => {
  let minNode = null;
  let minDistance = Number.MAX_VALUE;
  distanceMap.forEach((distance, node) => {
    if(!touchedNodes.has(node) && distance < minDistance) {
      minNode = node;
      minDistance = distance;
    }
  });
  return minNode
}
 const dijkstral = head => {
   // 从head出发到所有点的最小距离
   // key: 从head出发到达的点
   // value: 从head出发到达的点的最小距离
   // 如果在表中，没有T记录，含义是从head出发到T这个点的距离为正无穷
   const distanceMap = new Map();
   distanceMap.set(head, 0);
   // 已经求过距离的节点，存在selectedNodes中，以后再也不碰
   const selectedNodes = new Set();
   let minNode = getMinDistanceAndUnselectedNode(distanceMap, selectedNodes);
   while(minNode) {
     const distance = distanceMap.get(minNode);
     minNode.edges.forEach(edge => {
       const toNode = edge.to;
       if (!distanceMap.has(toNode)) {
        distance.set(toNode, distance + edge.weight)
       }
       distance.set(toNode, Math.min(distanceMap.get(toNode), distance + edge.weight))
     })
     selectedNodes.set(minNode);
     minNode = getMinDistanceAndUnselectedNode(distanceMap, selectedNodes)
   }
   return distanceMap;
 }