 // 二叉树操作
 var str='ABD  E  CF  G  ';
 // 创建二叉树
    var i = 0
    function creatbtree(){
      var node = {
        data:'',
        right:null,
        left:null
      };
      var temp = str[i++];
      if( temp == ' '){
        node = null;
      }else{
        node.data = temp;
        node.left = creatbtree();
        node.right = creatbtree();
      }
      return node;
    }
  var btree = creatbtree(0);
  console.log(btree);
  // 前序遍历
  var preorder = [];
  function Preordertraversal(val){
    if(val != null){
      preorder.push(val.data);
      Preordertraversal(val.left);
      Preordertraversal(val.right);
    }
  }
  Preordertraversal(btree);
  console.log(preorder);
  // 中序遍历
  var order = [];
  function Ordertraversal(val){
    if(val != null){
    Ordertraversal(val.left);
    order.push(val.data);
    Ordertraversal(val.right);
   }
  }
  Ordertraversal(btree);
  console.log(order);
  // 后序遍历
  var Posterior = [];
  function Posteriortraversal(val){
     if(val != null){
      Posteriortraversal(val.left);
      Posteriortraversal(val.right);
      Posterior.push(val.data);
    }
   }
 Posteriortraversal(btree);
 console.log(Posterior);

 // 给每个结点找到父节点元素值
function findparent(val){
    if(val != null){
      if(val.left != null){
        val.left.parent = val.data;
      }
      if(val.right != null){
        val.right.parent = val.data;
      }
      findparent(val.left);
      findparent(val.right);
   }
  }
  findparent(btree);
  console.log(btree);