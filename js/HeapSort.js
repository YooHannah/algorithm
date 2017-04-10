  //堆排序
  var List = [2,8,6,9,1,3,5,7,4];
  function HeapSort(val){
    if(val.constructor != Array){
      return "输入的参数不是数组";
    }
    if(val.length == 0){
      return [];
    }
    //将序列调整成大顶堆状态的层序遍历序列
    for(var i = parseInt((val.length-1)/2);i>-1;i--){
      val = HeapAdjust(val,i,val.length-1);
    }

    for(var j = val.length-1;j>0;j--){//循环将堆顶元素从后到前放入序列中
      val = swap(val,0,j);//将堆顶元素与序列位置j换位置,j从后到前
      val = HeapAdjust(val,0,j-1);//对除堆顶的元素进行重新调整成大顶堆排序状态，重新获取最大值
    }
    return val;
  }

  function swap(val,i,j){
    var temp;
    temp = val[i];
    val[i] = val[j];
    val[j] = temp;
    return val;
  }

  function HeapAdjust(val,s,n){
    var temp = val[s];
    for(var i = 2*s;i<n;i*=2){
      if(i<n && val[i]<val[i+1]){
        i++;
      }
      if(temp >= val[i]){
        break;
      }
      val[s] = val[i];
      s=i;
    }
    val[s] = temp;
    return val;
  }

  console.log(HeapSort(List));