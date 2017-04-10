 //选择排序，从小到大，每次寻找位置以后比自己小的最小元素互换位置
  var List = [2,8,6,9,1,3,5,7,4];
          function SelectSort(val){
            if(val.constructor != Array){
              return "输入的参数不是数组";
            }
            if(val.length == 0){
              return [];
            }
            var list = val.slice();
            for(var i = 0;i<list.length-1;i++){
               var min = i;
               //寻找i以后的元素中比下标i元素还小的最小值的下标
              for(var j= i+1;j<list.length;j++){
                if(list[j] < list[min]){
                  min = j;
                }
              }
              //如果找到比下标i元素小的元素，互换
              if(min != i){
                temp = list[min];
                list[min] = list[i];
                list[i] = temp;
              }
            }
            return list;
          }
 console.log(SelectSort(List))
