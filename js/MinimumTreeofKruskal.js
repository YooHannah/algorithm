  //最小生成树之克鲁斯卡尔算法

  //查看结点是否在生成树中
    function find(parent,f){
      while(parent[f]>0){
        f = parent[f];
      }
      return f;
    }
    function Kruskal(){
    var parent = []; //定义parent数组判断边与边是否形成环路
     for(var i =0;i<9;i++){
        parent[i]=0;
     }
    var edges = [];//边集数组
    edges.push({'begin':4,'end':7,'weight':7});
    edges.push({'begin':2,'end':8,'weight':8});
    edges.push({'begin':0,'end':1,'weight':10});
    edges.push({'begin':0,'end':5,'weight':11});
    edges.push({'begin':1,'end':8,'weight':12});
    edges.push({'begin':3,'end':7,'weight':16});
    edges.push({'begin':1,'end':6,'weight':16});
    edges.push({'begin':5,'end':6,'weight':17});
    edges.push({'begin':1,'end':2,'weight':18});
    edges.push({'begin':6,'end':7,'weight':19});
    edges.push({'begin':3,'end':4,'weight':20});
    edges.push({'begin':3,'end':8,'weight':21});
    edges.push({'begin':2,'end':3,'weight':22});
    edges.push({'begin':3,'end':6,'weight':24});
    edges.push({'begin':4,'end':5,'weight':26});

      for(var i = 0;i<edges.length;i++){
        var n = find(parent,edges[i].begin);
        var m = find(parent,edges[i].end);
        if(n!=m){ //如果n==m,则形成环路，不满足，不参与构建最小生成树
          parent[n] = m;//将此边的结尾顶点放入下边起点的parents数组中，表示此顶点已经在生成树集合中
          console.log(edges[i].begin,edges[i].end);
        }
      }
    }
    Kruskal();