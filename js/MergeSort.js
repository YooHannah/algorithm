    //归并算法 递归
    var List = [2,8,6,9,1,3,5,7,4];
    //拆分
    function MergeSort(val,n){
      if(n>1){
        var list1 = [];
        var list1_size = parseInt(n/2);
        var list2 = [];
        var list2_size = n-list1_size;
        list1 = val.slice(0, list1_size);
        list2 = val.slice(list1_size);
        var l1 = MergeSort(list1,list1_size);
        var l2 = MergeSort(list2,list2_size)
       return merging(l1,l2);
     }else{
      return val;
     }
    }
    //实现归并
    function merging(val1,val2){
      var temp = [];
      var i = j = 0;
      var size1 = val1.length;
      var size2 = val2.length;
      while(i<size1 && j<size2){
        if(val1[i]<val2[j]){
          temp.push(val1[i]);
          i++;
        }else{
          temp.push(val2[j]);
          j++;
        }
      }
      while(i<size1){
        temp.push(val1[i]);
        i++;
      }
      while(j<size2){
        temp.push(val2[j]);
        j++;
      }
      return temp;
    }
    console.log(MergeSort(List,List.length));
    //网上找的归并算法，更简便
   function merge(left, right) {
       var re = [];
       while(left.length > 0 && right.length > 0) {
           if(left[0] < right[0]) {
               re.push(left.shift());
           } else {
               re.push(right.shift());
           }
       }
       /* 当左右数组长度不等.将比较完后剩下的数组项链接起来即可 */
       console.log(re.concat(left).concat(right));
       return re.concat(left).concat(right);
    }

    function mergeSort(array) {
       if(array.length == 1) return array;
       /* 首先将无序数组划分为两个数组 */
       var mid = Math.floor(array.length / 2);
       var left = array.slice(0, mid);
       var right = array.slice(mid);
       /* 递归分别对左右两部分数组进行排序合并 */
       return merge(mergeSort(left), mergeSort(right));
    }
    var a = [2,8,6,9,1,3,5,7,4]
    console.log(mergeSort(a));