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
  * 2. 从源节点开始依次按照宽度进队列，然后弹出
  * 3. 每弹出一个点，把该节点所有没有进过队列的临界点放入队列
  * 4. 直到队列变空
  * 
  */

 


 /**
  * 广度优先遍历
  * 1.利用栈实现
  * 2. 从源节点开始把节点按照深度放入栈，然后弹出
  * 3. 每弹出一个点，把该节点下一个没有进过栈的邻接点放入栈中
  * 4，直到栈变空
  * 
  */

 /**
  * 拓扑排序算法
  * 适用范围：要求有向图，且有入度为0的结点，且没有环
  * 
  */

 /**
  * kruskal算法
  * 适用范围: 要求无向图
  */

 /**
  * prim算法
  * 适用范围: 要求无向图
  */

 /**
  * Dijkstra算法
  * 适用范围: 没有权值为负数的边，或者有权值为负值的边，但该边不再一个环里面
  */