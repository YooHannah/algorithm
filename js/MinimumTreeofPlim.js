 //最小生成树普里姆算法
 var nodes = [];
    for(var k = 0;k<9;k++){
      nodes.push({
        "name":'v'+k,
        "tag":0
      })
    }
    var matrix = [];//节点间若没有连线，则其权值用Infinity表示
    matrix.push([0,10,Infinity,Infinity,Infinity,11,Infinity,Infinity,Infinity]);
    matrix.push([10,0,18,Infinity,Infinity,Infinity,16,Infinity,12]);
    matrix.push([Infinity,18,0,22,Infinity,Infinity,Infinity,Infinity,8]);
    matrix.push([Infinity,Infinity,22,0,20,Infinity,Infinity,16,21]);
    matrix.push([Infinity,Infinity,Infinity,20,0,26,Infinity,7,Infinity]);
    matrix.push([11,Infinity,Infinity,Infinity,26,0,17,Infinity,Infinity]);
    matrix.push([Infinity,16,Infinity,Infinity,Infinity,17,0,19,Infinity]);
    matrix.push([Infinity,Infinity,Infinity,16,7,Infinity,19,0,Infinity]);
    matrix.push([Infinity,12,8,21,Infinity,Infinity,Infinity,Infinity,0]);

    function MinimumTreeofPlim(){
      var subscript = [];//保存相关顶点下标
      var weight = [];//保存相关顶点间边的权值
      var i,j,k,min;
      weight[0] = 0;//V0作为最小生成树的根开始遍历,权值为0
      subscript[0] = 0;//vO第一个加入

      for( i = 1;i<9;i++){ //从1开始,将与v0相关结点权值存入weight
        weight[i] = matrix[0][i];
        subscript[i] = 0;//全部初始化为0
      }

      for( i = 1;i<9;i++){
        min = Infinity;//初始化最小值为无穷大
        k = 0;

      //找出与V0结点有关的连线的最小权值
      for(var j = 1;j<9;j++){
          if(weight[j]!=0 && weight[j] < min){ //非0.若为0，是它自己
            min = weight[j];
            k = j;//记住最小权值的下标
          }
        }
        console.log(subscript[k],k);//要走的路径起点下标为subscript[k]，终点下标为K
        weight[k] = 0;//将最小权值赋值为0，即说明从V0出发的要选择路径即为到Vk的路径,vK为下一个要访问的结点

        //更新weight，让weight的值与matrix的k行的值对应比较，
        //如果weight的值大于K行的值，就将weight该位置的值换为K行位置的值
        //然后进入下一轮循环，查找weight中的最小值
        for(var j=1;j<9;j++){
          if(weight[j]!=0 && matrix[k][j] < weight[j]){
             weight[j] = matrix[k][j];
             subscript[j] = k;
          }
        }
      }
    }
    MinimumTreeofPlim();