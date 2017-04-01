  //拓扑排序
  var vertextnodes=[];
    vertextnodes.push({'data':'C1','in':0,'children':[2,3,4]});
    vertextnodes.push({'data':'C2','in':2,'children':[]});
    vertextnodes.push({'data':'C3','in':2,'children':[6,7,9,10]});
    vertextnodes.push({'data':'C4','in':2,'children':[7,8,10]});
    vertextnodes.push({'data':'C5','in':1,'children':[]});
    vertextnodes.push({'data':'C6','in':1,'children':[]});
    vertextnodes.push({'data':'C7','in':3,'children':[]});
    vertextnodes.push({'data':'C8','in':1,'children':[]});
    vertextnodes.push({'data':'C9','in':1,'children':[]});
    vertextnodes.push({'data':'C10','in':2,'children':[7,11]});
    vertextnodes.push({'data':'C11','in':1,'children':[12]});
    vertextnodes.push({'data':'C12','in':1,'children':[]});
    vertextnodes.push({'data':'C13','in':0,'children':[4,14]});
    vertextnodes.push({'data':'C14','in':1,'children':[2,3,15]});
    vertextnodes.push({'data':'C15','in':1,'children':[5]});
    function TopologicalSort(){
        var top = 0;//用于判断栈中是否还有数据
        var count = 0;//用于统计输出顶点的个数
        var stack = [];//用于存储入度为0的顶点
        var sort = [];//最终排序
        for(var i = 0;i<vertextnodes.length;i++){
            if(vertextnodes[i].in == 0){
              stack.push(i);//将入度为0的顶点下标入栈
              top+=1;
            }
        }
         while(top != 0){
           var gettop = stack.pop();
           top--;
           sort.push(vertextnodes[gettop].data);
           count++;
            for(var j = 0;j<vertextnodes[gettop].children.length;j++){
              //获取入度为0的顶点的各出度结点给到K
                var child = vertextnodes[vertextnodes[gettop].children[j]-1];//浅复制
                //将其入度减1，并判断入度是否为0，为0，则入栈
                if(!(--child.in)){
                  stack.push(vertextnodes[gettop].children[j]-1);
                  top++;
                }
            }
         }
         if(count < vertextnodes.length){
          return error;
         }else{
          return sort;
         }
    }
    console.log(TopologicalSort());//["C13", "C14", "C15", "C5", "C1", "C4", "C8", "C3", "C10", "C11", "C12", "C7", "C9", "C6", "C2"]