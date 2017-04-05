 //二叉排序树
   var numbers=[70,105,115,100,67,46,99,111,108];
         //创建二叉排序树
         var btree = {
                data:numbers[0],
                right:null,
                left:null
              };
          var i = 1;
          var parent = btree;
          //每次添加结点时，依次遍历已建的树，大于结点数据朝右子树走，小于结点数据朝其左子树走
          function creatbtree(){
              if(i>=numbers.length){
                return 0;
              }
                for(var j = 0;j < i;j++){
                  if(numbers[i]< parent.data){
                    if(parent.left == null){  //数值小的放左子树
                      parent.left = {
                        data:numbers[i],
                        right:null,
                        left:null
                      }
                      i++;//取下一个数据
                      parent = btree;//将父节点重置为树的根结点，从根结点开始遍历
                      creatbtree();
                    }else{
                      parent = parent.left;    //朝左子树遍历
                    }
                  }else{
                     if(parent.right == null){  //数值大的放右子树
                      parent.right = {
                        data:numbers[i],
                        right:null,
                        left:null
                      }
                      i++;
                      parent = btree;
                      creatbtree();
                     }else{
                       parent = parent.right;    //朝右子树遍历
                     }
                  }
                }
            }
          creatbtree();
          //差值
          function findkey(tree,key){
            while(tree != null){
              if(tree.data == key){
                return 1;
              }else if(tree.data > key){
                tree = tree.left;  //朝左子树遍历
              }else{
                tree = tree.right; //朝右子树遍历
              }
            }
            return 0;
          }
          // console.log(findkey(btree,109));
          // console.log(btree);
          //插值
          function insertkey(btree,key){
            if(!findkey(tree,key)){ //原树中没有该数据再添加
              var tree = btree;
              while(tree != null){
                if(tree.data > key){
                  if(tree.left == null || tree.left.data == undefined){
                    tree.left = {
                      data:key,
                      left:null,
                      right:null
                    }
                    return 1;
                  }else{
                    tree = tree.left;
                  }
                }else{
                  if(tree.right == null || tree.right.data == undefined){
                    tree.right = {
                      data:key,
                      left:null,
                      right:null
                    }
                    return 1;
                  }else{
                    tree = tree.right;
                  }
                }
              }
            }
          }
          insertkey(btree,104);
          insertkey(btree,103);
          insertkey(btree,112);
          insertkey(btree,48);
          insertkey(btree,47);
          insertkey(btree,68);
          console.log(btree);
          function Deletekey(btree,key){
            if (!findkey(btree,key)) {
              console.log(key+'不存在于该树中');
              return 0;
            }
            var tree = btree;//从根结点开始找要删除的数据
            var parent = btree;//要删除的数据所在结点的父结点
            var flag = 0; //标志要删除数据是父结点的左结点0还是右结点1
            while(tree != null){
              if(tree.data == key){
                 changekey(parent,tree,flag);
              }else if(tree.data > key){
                parent = tree;
                flag = 0;//左
                tree = tree.left;
              }else{
                parent = tree;
                flag = 1;//右
                tree = tree.right;
              }
            }
          }

          function changekey(parent,tree,flag){
              if(tree.left == null && tree.right == null){ //如果要删除的结点是叶子结点
                  if(flag){
                    parent.right = null;
                  }else{
                    parent.left = null;
                  }
                }else if(tree.left == null){ //如果要删除的结点左子树为空就把右子树顶上去
                  if(flag){
                     parent.right = tree.right;
                  }else{
                    parent.left = tree.right;
                  }
                }else if(tree.right == null){ //如果要删除的结点右子树为空就把左子树顶上去
                  if(flag){
                     parent.right = tree.left;
                  }else{
                     parent.left = tree.left;
                  }
                }else{ //如果要删除的结点左右子树都有,则让要删除数据的结点数据替换为中序遍历时，它的直接前驱或直接后继数据
                  //将删除数据替换为直接前驱数据,看左子树
                  var temp = tree.left; //存放直接前驱结点
                  while(temp.right != null){
                      temp = temp.right; // 找左子树的最大值，即最右结点
                  }
                  if(flag){ //删除数据是父结点的右结点
                     parent.right.data = temp.data;//数据替换
                  }else{ //删除数据是父结点的左结点
                     parent.left.data = temp.data;
                  }
                }
                //因为要删除数据的左子树可能是一个左斜树，因此判断刚刚顶上去的前驱结点是否就是左子树树根数据
                parent = tree.left;
                  while(parent.right.data != temp.data){
                      parent = parent.right;
                  }
                 if(tree.right.data != temp.data){ //前驱结点不是左子树树根数据
                    parent.right = temp.left; //用前驱结点的左子树顶替前驱结点位置
                  }else{                      //前驱结点就是左子树树根数据,即左子树是一个左斜树
                    parent.left = temp.left;  //将前驱结点左子树设置为左子树，相当于将删除数据结点左子树顶到删除数据结点
                  }

                //将删除数据替换为直接后继数据,看右子树
                 // var temp = tree.right;
                 //  while(temp.left != null){
                 //      temp = temp.left;
                 //  }
                 //  if(flag){
                 //     parent.right.data = temp.data;
                 //  }else{
                 //      parent.left.data = temp.data;

                 //  }
                 //  parent = tree.right;
                 //  while(parent.left.data != temp.data){
                 //      parent = parent.left;
                 //  }
                 // if(tree.right.data != temp.data){
                 //    parent.left = temp.right;
                 //  }else{
                 //    parent.right = temp.right;
                 //  }
                return 1;
          }
          Deletekey(btree,44);
          console.log(btree);
