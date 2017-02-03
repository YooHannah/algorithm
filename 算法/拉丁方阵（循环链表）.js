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