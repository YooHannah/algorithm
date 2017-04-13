//快速排序
          //快速排序
         function QuickSort(list,n){
            console.log(Qsort(list,0,n-1));//一开始以首项为基准点进行移动
          }
          //优化方案3.对小数组使用插入排序法，不使用快排
         // function InsertSort(val){
         //     if(val.constructor != Array){
         //      return "输入的参数不是数组";
         //    }
         //    if(val.length == 0){
         //      return [];
         //    }
         //    var list = val.slice();
         //    for(var i = 1;i<list.length;i++){
         //      if(list[i] <list[i-1]){
         //        temp = list[i];
         //        //寻找list[i]应该插入的位置，并将比它大的值后移
         //        for(j=i-1;list[j]>temp;j--){
         //          list[j+1] =list[j];
         //        }
         //        list[j+1] = temp;//插入
         //      }
         //    }
         //    return list;
         //  }
          function Qsort(list,low,high){
            if(low<high){
             // if((high-low)>7){ //优化方案3.对小数组使用插入排序法，不使用快排
              var array = Partition(list,low,high);//移动完一次后得到移动的结果，和基准点的位置
              var point = array[0];
              list = array[1].slice();
              list = Qsort(list,low,point-1);//对基准点前面的数据(都比基准点数据小)，以首项为基准点移动
              list = Qsort(list,point+1,high);//对基准点后面树数据(都比基准点数据大)，以基准点后一项为基准点移动
              //优化方案4：减少递归
              // while(low<high){
              //   var array = Partition(list,low,high);
              //   var point = array[0];
              //   list = array[1].slice();
              //   list = Qsort(list,low,point-1);
              //   low = point+1;
              // }
               //优化方案4：使用尾递归
              // while(low<high){
              //   var array = Partition(list,low,high);
              //   var point = array[0];
              //   list = array[1].slice();
                   // if(point-low <high-point){
                      //   list = Qsort(list,low,point-1);
                     //   low = point+1;
                   // }else{
                   //     list = Qsort(list,point+1,high);
                   //     high = point-1;
                   // }

              // }
            }
             // else{//优化方案3.对小数组使用插入排序法，不使用快排
            //   list = InsertSort(list)

            // }
              return list;
          }
          function swap(list,low,high){
             var temp = list[low];
              list[low] = list[high];
              list[high] = temp;
              return list;
          }
          function Partition(list,low,high){

            //优化方案1：对point的选取尽量选取中间的值
            // var m=low+Math.floor((high-low)/2);
            // if(list[low]>list[high]){
            //   list = swap(list,low,high);
            // }
            // if(list[m]>list[high]){
            //   list = swap(list,m,high);
            // }
            // if(list[m]>list[low]){
            //   list = swap(list,m,low);
            // }

            var point = list[low];
            while(low<high){
              while(low<high && list[high] >= point){//过滤基准点右边比它大的元素，寻找比它小的元素
                high--;
              }
              //将比自己小的元素放在自己左边
              list = swap(list,low,high);
              //优化方案2：优化不必要的交换，直接赋值
              // list[low] = list[high]

              while(low<high && list[low] <= point){//过滤基准点左边的比它小的元素，寻找比它大的元素
                low++;
              }
              //将比自己大的元素放在自己右边
               list = swap(list,low,high);
               //优化方案2：优化不必要的交换，直接赋值
               // list[high] = list[low];

            }
            //优化方案2：优化不必要的交换，直接赋值
             // list[low] = point;

            //结束循环时hight 等于low,即，基准点被移动到的位置
            return [low,list];
          }
          var list = [5,2,6,0,3,9,1,7,4,8];
          QuickSort(list,list.length);