//最短路径之佛洛依德(Floyd)算法
 var nodes = [];
    for(var k = 0;k<9;k++){
      nodes.push({
        "name":'v'+k,
        "tag":0
      })
    }
    var matrix = [];//节点间若没有连线，则其权值用Infinity表示
    matrix.push([0,1,5,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity]);
    matrix.push([1,0,3,7,5,Infinity,Infinity,Infinity,Infinity]);
    matrix.push([5,3,0,Infinity,1,7,Infinity,Infinity,Infinity]);
    matrix.push([Infinity,7,Infinity,0,2,Infinity,3,Infinity,Infinity]);
    matrix.push([Infinity,5,1,2,0,3,6,9,Infinity]);
    matrix.push([Infinity,Infinity,7,Infinity,3,0,Infinity,5,Infinity]);
    matrix.push([Infinity,Infinity,Infinity,3,6,Infinity,0,2,7]);
    matrix.push([Infinity,Infinity,Infinity,Infinity,9,5,2,0,4]);
    matrix.push([Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,7,4,0]);

    function ShortestPath_Floyd(){
      var p = [];//用于存储最短路径下标的数组
      var weightsum = [];//用于存储起点到各点最短路径的权值
      //初始化
      for(var v=0;v<matrix.length;v++){
        weightsum[v] = [];
        p[v] = []
          for(var w=0;w<matrix.length;w++){
            weightsum[v][w] = matrix[v][w];
            p[v][w] = w;
          }
      }
      //佛洛伊德算法
      for(var k = 0;k<matrix.length;k++){
        for(var v=0;v<matrix.length;v++){
          for(var w=0;w<matrix.length;w++){
            if(weightsum[v][w]>weightsum[v][k] + weightsum[k][w]){
              weightsum[v][w] = weightsum[v][k] + weightsum[k][w];
              p[v][w] = p[v][k];
            }
          }
        }
      }
      console.log(weightsum[0]);
      console.log(p[1]);
      //结果看p数组的列，选择第v1列，即以v1为起点，终点选择v7，则从坐标（7,1)开始将坐标对应的值V作为路径前一个顶点
      //接着寻找(V,1)的值，知道找到结点V1
    }
    ShortestPath_Floyd();