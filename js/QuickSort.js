//快速排序
         function QuickSort(list,n){
            console.log(Qsort(list,0,n-1));//一开始以首项为基准点进行移动
          }
          function Qsort(list,low,high){
            if(low<high){
              var array = Partition(list,low,high);//移动完一次后得到移动的结果，和基准点的位置
              var point = array[0];
              list = array[1].slice();
              list = Qsort(list,low,point-1);//对基准点前面的数据(都比基准点数据小)，以首项为基准点移动
              list = Qsort(list,point+1,high);//对基准点后面树数据(都比基准点数据大)，以基准点后一项为基准点移动
            }
              return list;
          }
          function Partition(list,low,high){
            var point = list[low];
            while(low<high){
              while(low<high && list[high] >= point){//过滤基准点右边比它大的元素，寻找比它小的元素
                high--;
              }
              //将比自己小的元素放在自己左边
              var temp = list[low];
              list[low] = list[high];
              list[high] = temp;
              while(low<high && list[low] <= point){//过滤基准点左边的比它小的元素，寻找比它大的元素
                low++;
              }
              //将比自己大的元素放在自己右边
              var temp = list[low];
              list[low] = list[high];
              list[high] = temp;
            }
            console.log(low,list)
            //结束循环时hight 等于low,即，基准点被移动到的位置
            return [low,list];
          }
          var list = [5,2,6,0,3,9,1,7,4,8];
          QuickSort(list,list.length);