
  //关键路径：确定一项工程先后顺序的活动安排
  //拓扑排序
  var vertextnodes=[];
   //children每一项，第一位(1,2,3)代表顶点下标，第二位(6,4,5)代表权值
    vertextnodes.push({'data':'C1','in':0,'children':[[1,6],[2,4],[3,5]]});
    vertextnodes.push({'data':'C2','in':1,'children':[[4,1]]});
    vertextnodes.push({'data':'C3','in':1,'children':[[4,1]]});
    vertextnodes.push({'data':'C4','in':1,'children':[[5,2]]});
    vertextnodes.push({'data':'C5','in':2,'children':[[6,7],[7,5]]});
    vertextnodes.push({'data':'C6','in':1,'children':[[7,4]]});
    vertextnodes.push({'data':'C7','in':1,'children':[[8,2]]});
    vertextnodes.push({'data':'C8','in':2,'children':[[8,4]]});
    vertextnodes.push({'data':'C9','in':2,'children':[]});
    var sort = [];//最终排序
    var etv = [];
    function TopologicalSort(){
        var top = 0;//用于判断栈中是否还有数据
        var count = 0;//用于统计输出顶点的个数
        var stack = [];//用于存储入度为0的顶点

        //初始化etv都为0
        for(var i = 0;i<vertextnodes.length;i++){
          etv.push(0);
        }

        for(var i = 0;i<vertextnodes.length;i++){
            if(vertextnodes[i].in == 0){
              stack.push(i);//将入度为0的顶点下标入栈
              top+=1;
            }
        }

         while(top != 0){
           var gettop = stack[0];
           stack.splice(0,1);
           top--;
           sort.push(gettop);
           count++;
            for(var j = 0;j<vertextnodes[gettop].children.length;j++){
                var temp = vertextnodes[gettop].children[j];
                var child = vertextnodes[temp[0]];//浅复制
                if(!(--child.in)){
                  stack.push(temp[0]);
                  top++;
                }
                if((etv[gettop]+temp[1])> etv[temp[0]]){ //计算每个顶点最早发生时间，gettop为指向该结点的结点下标
                  //etv[gettop]+temp[1]即前面所有路径权值和分别加上各条指向该结点的权值，取不同路径中最大值(因为要等前面事件全部做完才能开始该结点事件)
                  etv[temp[0]] = etv[gettop]+temp[1];//取最大值
                }
            }
         }
         console.log(etv);//0 6 4 5 7 7 14 12 16
         if(count < vertextnodes.length){
          return error;
         }else{
          return sort; //0 1 2 3 4 5 6 7 8
         }
    }

    //确定关键路径
    function CriticalPath() {
      TopologicalSort();
      var ltv = [];
      var ete = [];
      var lte = [];
      var path = [];

      //初始化ltv都为汇点的时间,即整个项目总时间
      for(var i = 0;i<vertextnodes.length;i++){
        ltv.push(etv[vertextnodes.length-1])
      }
      //从汇点倒过来逐个计算ltv
      while(sort.length!=0){
         var gettop = sort.pop();
         for(var i =0;i<vertextnodes[gettop].children.length;i++){
            var temp = vertextnodes[gettop].children[i];
            var child = vertextnodes[temp[0]];
            if(ltv[temp[0]] - temp[1] < ltv[gettop]){
              ltv[gettop] = ltv[temp[0]]-temp[1];
              //活动结束时间减去活动持续时间,即顶点事件最晚开始时间，循环找出最小值(保证活动时间最长的事件有足够时间)
            }

         }
      }
      console.log(ltv); // 0 6 6 6 7 8 14 12 16
      //通过etv和ltv求ete和lte
      for(var j=0;j<vertextnodes.length;j++){
        for(var i =0;i<vertextnodes[j].children.length;i++){
          var temp = vertextnodes[j].children[i];
          var child = vertextnodes[temp[0]];
          ete.push(etv[j]);//活动最早开工时间，即各弧弧的起点顶点最早开工时间
          lte.push(ltv[temp[0]]-temp[1]);//活动最晚发生时间，活动终点顶点最晚结束时间减去活动持续时间

          if(etv[j] == ltv[temp[0]]-temp[1]){  //同一活动最早开工时间等于最晚发生时间，该活动代表的路径即关键路径
             path.push([vertextnodes[j].data,vertextnodes[temp[0]].data]);
          }
        }
      }
      console.log(ete);//0 0 0 6 4 5 7 7 7 14 12
      console.log(lte);//0 2 1 6 6 6 7 7 8 14 12
      console.log(path);
    }
   CriticalPath();