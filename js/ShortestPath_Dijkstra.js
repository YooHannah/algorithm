 //最短路径之迪杰斯特拉(Dijkstra)算法
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

    function ShortestPath_Dijkstra(){
      var final = [];//final[w] = 1表示已经求得顶点V0到Vw的最短路径
      var p = [];//用于存储最短路径下标的数组
      var weightsum = [];//用于存储起点到各点最短路径的权值和
      var k = 0;//记录最短路径顶点下标

      //初始化数据
      for(var v = 0;v<matrix.length;v++){
        final[v] = 0;//全部顶点初始化为未找到最短路径
        weightsum[v] = matrix[0][v];//将V0作为起点，将与V0点有连线的顶点加上权值,即从第一行开始
        p[v] = 0;//初始化路径数组p为0
      }
      weightsum[0] = 0; //V0到V0的路径为0
      final[0] = 1; //v0到V0不需要求路径

      //开始主循环，每次求得V0到某个V顶点的最短路径
      for(var v =1;v<matrix.length;v++){
        var min = Infinity;
        for(var w= 0;w<matrix.length;w++){
          //nodes中下标w的顶点还没有作为最短路径被找到，而且起点到该顶点的路径小于当前最小路径min,其实是寻找最小值
          if(!final[w] && weightsum[w]<min){
            k = w;
            min = weightsum[w];
          }
        }
        final[k] = 1; //将目前找到的最近的顶点置1，说明该下边顶点已经找到

        //修正当前最短路径及距离
        for(var w=0;w<matrix.length;w++){
          //如果经过V顶点的路径比现在这条路径的长度短的话，更新
          if(!final[w] && (min +matrix[k][w] <weightsum[w])){
          //注意是min +matrix[k][w]，路径和，即之前最小路径加上即将要选择的路径与之前路径比较
            weightsum[w] = min+ matrix[k][w];//修改当前路径长度
            p[w] = k; //存放前驱顶点，即下标顶点的前驱顶点时nodes中下标为k的顶点，路径确定
          }
        }
      }
      console.log(weightsum); //0 1 4 7 5 8 10 12 16//到各顶点最短路径权值和
      console.log(p); //0 0 1 4 2 4 3 6 7//路径下标
      //所以如果从V0到V8，则p[8] = 7，即V8上一顶点时V7,P[7] = 6，V7上一顶点时V6，P[6]= 3，V6上一顶点是V3，p[3] = 4，
      //V3上一顶点是V4,以此类推，知道起点V0。
    }
    ShortestPath_Dijkstra();