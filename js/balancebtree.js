 //创建平衡二叉树
 var numbers = [3,2,1,4,5,6,7,10,9,8];
 var node = null;
 var taller = false;
 function insertAVL(node,i){
  if(i >= numbers.length){
    return 1111;
  }
            if(!node){ //插入节点
              node = {
                'data':numbers[i],
                'left':null,
                'right':null,
                'bf':0
              };
              taller = true;
              return node;
            }else{
              if(numbers[i] == node.data){ //数据已经插入
                taller = false;
                return false;
              }
              if(numbers[i]< node.data){//小于父节点往左走
                node.left = insertAVL(node.left,i);
                if(!node.left){//如果作为左子树的节点找到，同样结束插入
                  return false;
                }
                if(taller){ //如果作为左节点被插入了，就需要判断父节点原来的bf
                  switch(node.bf){
                      case 1://原来左减右 = 1,现在又增加了左结点，|bf|>1
                        node = leftBalance(node);//进行左平衡操作
                        taller = false;//平衡处理后。树的深度因该结点不增加
                        break;
                      case 0://原来左=右，现在增加了左结点，左减右 = 1
                      node.bf = 1;
                        taller = true;//树的深度增加了
                        break;
                      case -1: //原来左减右 = -1
                        node.bf = 0; //现在左右相等
                        taller = false;//树的深度因该结点不增加
                        break;
                      }
                    }
                    return node;
                  }else{
                    node.right = insertAVL(node.right,i,taller);
                if(!node.right){//如果作为右子树的节点找到，同样结束插入
                  return false;
                }
                if(taller){ //如果作为右节点被插入了，就需要判断父节点原来的bf
                  switch(node.bf){
                      case 1://原来左减右 = 1
                        node.bf = 0; //现在左右相等
                        taller = false;//树的深度因该结点不增加
                        break;
                      case 0://原来左=右，现在增加了右结点，左减右 = -1
                      node.bf = -1;
                        taller = true;//树的深度增加了
                        break;
                      case -1: //原来左减右 = -1 现在又增加了右结点，|bf|>1
                        node = rightBalance(node);//进行右平衡操作
                        taller = false;//平衡处理后。树的深度因该结点不增加
                        break;
                      }
                    }
                    return node;
                  }
                }
                
              }
          //左平衡
          function leftBalance(node){
            var left = node.left;//结点左子树树根
            switch(left.bf){
              case 1://新增结点做的是结点左子树的左孩子
                node.bf = left.bf = 0;//处理相关结点bf
                node = R_Rotate(node);//直接右旋处理
                break;
              case -1://新增结点做的是结点左子树的右孩子
                leftright = left.right;//取新增结点
                switch(leftright.bf){
                  case 1:
                  node.bf = -1;
                  left.bf = 0;
                  break;
                  case 0:
                  node.bf = left.bf = 0;
                  break;
                  case -1:
                  node.bf = 0;
                  left.bf = 1;
                  break;
                }
                leftright.bf = 0;
                node.left = L_Rotate(node.left);//先对左子树左旋将符号调整
                node = R_Rotate(node);//再对结点右旋
                break
                case 0:
                node.bf = 1;
                left.bf = -1;
                node =  R_Rotate(node);
                break;
              }
              return node;
            }
         //右旋
         function R_Rotate(node){
          var left = node.left;
          node.left = left.right;
          left.right = node;
          node = left;
          return node;
        }
         //左旋
         function L_Rotate(node){
          var right = node.right;
          node.right = right.left;
          right.left = node;
          node = right;
          return node;
        }
           //右平衡
           function rightBalance(node){
            var right = node.right;//结点右子树树根
            switch(right.bf){
              case -1://新增结点做的是结点右子树的右孩子
                node.bf = right.bf = 0;//处理相关结点bf
                node = L_Rotate(node);//直接左旋处理
                break;
              case 1://新增结点做的是结点右子树的左子树上的结点
              rightleft = right.left;
              switch(rightleft.bf){
                case 1:
                node.bf = 0;
                right.bf = -1;
                break;
                case 0:
                node.bf = right.bf = 0;
                break;
                case -1:
                node.bf = 1;
                right.bf = 0;
                break;
              }
              rightleft.bf = 0;
                node.right = R_Rotate(node.right);//先对左子树右旋将符号调整
                node = L_Rotate(node);//再对结点左旋
                break;
                case 0:
                node.bf = -1;
                right.bf = 1;
                node = L_Rotate(node);
                break;
              }
              return node;
            }
            for(var j = 0;j<numbers.length;j++){
              node = insertAVL(node,j);
            }  
            console.log(node); 
