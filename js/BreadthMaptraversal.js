//广度优先遍历(想象树的层序遍历)
var node = ['A','B','C','D','E','F','G','H','I'];
    var nodes = [];
    for(var k = 0;k<node.length;k++){
      nodes.push({
        "name":node[k],
        "tag":0
      })
    }
    var matrix = [];
    matrix.push([0,1,0,0,0,1,0,0,0]);
    matrix.push([1,0,1,0,0,0,1,0,1]);
    matrix.push([0,1,0,1,0,0,0,0,1]);
    matrix.push([0,0,1,0,1,0,1,1,1]);
    matrix.push([0,0,0,1,0,1,0,1,0]);
    matrix.push([1,0,0,0,1,0,1,0,0]);
    matrix.push([0,1,0,1,0,1,0,1,0]);
    matrix.push([0,0,0,1,1,0,1,0,0]);
    matrix.push([0,1,1,1,0,0,0,0,0]);
    var i = 0;
    var str = '';
    nodes[i].tag = 1;
    var queue = [];
    queue.push({
      'index':0,
      'name':'A'
    })
    function BreadthMaptraversal(){
     if(str.length == nodes.length){
      return
     }
      for(var k = 0;k<matrix[i].length;k++){
         if(matrix[i][k] ==1 && nodes[k].tag == 0){
            nodes[k].tag = 1;
            queue.push({
              'index':k,
              'name':nodes[k].name
            });
         }
      }
      str += queue[0].name;
      queue.splice(0,1);
      if(queue.length>0){
         i = queue[0].index;
         BreadthMaptraversal()
      }
    }
    BreadthMaptraversal();
    console.log(str);