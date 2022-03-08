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
    if (!graph.nodes.get(fromValue)) {
      graph.nodes.set(fromValue, creatNode(fromValue))
    }
    if (!graph.nodes.get(toValue)) {
      graph.nodes.set(toValue, creatNode(toValue))
    }
    const from = graph.nodes.get(fromValue);
    const to = graph.nodes.get(toValue);
    const edge = { weight, from, to };
    from.out++;
    to.in +=1;
    from.nexts.push(to);
    from.edges.push(edge);
    graph.edges.add(edge);
  }
  return graph;
 }

 const originData = [[3, 5,6],[2,5,3],[1,5,4],[5,6,2],[8,6,3],[2,4,3],[7,4,2],[4,3,2]];
 const graph = creatGraph(originData);
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
        distanceMap.set(toNode, distance + edge.weight)
       }
       distanceMap.set(toNode, Math.min(distanceMap.get(toNode), distance + edge.weight))
     })
     selectedNodes.add(minNode);
     minNode = getMinDistanceAndUnselectedNode(distanceMap, selectedNodes)
   }
   return distanceMap;
 }
console.log(dijkstral(graph.nodes.get(5)));