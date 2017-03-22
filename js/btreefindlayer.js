//二叉树按前序遍历输入，叶结点缺的孩子用空格表示
var str='AB D  CE   ';
// var str='AB DE  F  CG   ';
//创建二叉树
var btree = [];
for(var i=0;i<str.length;i++){
  btree.push({
    data:str[i],
    children:[]
  });
}
for(var j=0;j<btree.length-2;j++){
  if(btree[j].data !==' '){
    if(btree[j+1].data !==' '){
      btree[j].children.push(j+1);
    }else{
      btree[j].children.push(1111);
    }
    if(btree[j+2].data !==' '){
      btree[j].children.push(j+2);
    }else{
      btree[j].children.push(1111);
    }
  }
}

var layer =0;
function findlayer(k,tree,val){
  if(tree[k].data == val){
    layer+=1;
    console.log(val+"在第"+layer+"层");
    return;
  }
  if(tree[k].data != val && tree[k].data != ' '){
    if(tree[k].children[0]!=1111){
      k = tree[k].children[0];
      layer++;
      findlayer(k,tree,val);
    }else if(tree[k].children[1]!=1111){
      k = tree[k].children[1];
      layer++;
      findlayer(k,tree,val);
    }else{
      k +=3 ;
      if(k != tree.length-1){
        layer--;
        findlayer(k,tree,val);
      }else{
        console.log(val+"不存在该树中！");
        return;
      }

    }
  }
}
findlayer(0,btree,'H');