// 图的优先遍历
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
    var pre = [];
    function Maptraversal(){
      console.log(i)
      if(nodes[i].tag == 0){
         str += nodes[i].name;
      }
     if(str.length == nodes.length){
      return
     }
      var temp = 0;
      for(var k = 0;k<matrix[i].length;k++){
         if(matrix[i][k] ==1 && nodes[k].tag == 0){
          nodes[i].tag = 1;
          pre.push(i);
          i=k;
          Maptraversal();
         }else{
          temp +=1;
         }
      }
      if (temp == matrix[i].length) {
        nodes[i].tag = 1;
        i = pre.pop();
        Maptraversal();
      }
    }
    Maptraversal();
    console.log(str);