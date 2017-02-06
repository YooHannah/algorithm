//拉丁方阵是一种n*n的方阵，方阵中恰有n种不同的元素，每种元素恰有n个，
//并且每种元素在一行一列中恰好出现一次
//主要思路：将n个结点的链表，每次错一位push到一个数组中，pusH操作n次
  function Latinsquare(num){
            var list=[];
            for(var i = 0;i<num;i++){
              var pre = 0;
              if(i==0){
                pre=num;
              }else{
                pre = i;
              }
              var nextt = 0;
              if(i ==num-1){
                nextt = 1;
              }else{
                nextt = i+2;
              }
              list.push({
                prior:pre,
                data:i+1,
                next:nextt
              })
            }
            for(var i = 0;i<num;i++){
              var string=[];
              var p = 1;
              for(var j = 0;j<i;j++){
                p = list[p-1].next;
              }
              for(var k = 0;k<num;k++){
                string.push(list[p-1].data);
                p = list[p-1].next;
              }
              console.log(string);
            }
          }
          Latinsquare(5);