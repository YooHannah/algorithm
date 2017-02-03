
        var string = "1+(2-3)*4+10/5";
        var r=string.match(/\d+/g);
        var s=string.split(/\d+/g);
        var slist =[];
        var list =[];
        for(var j = 0;j<s.length;j++){
          if(s[j]!=""){
             slist.push(s[j]);
          }
        }
        if(isNaN(string[0])){
          for(var j = 0;j<slist.length;j++){
             list.push(slist[j]);
             if(j<r.length){
              list.push(r[j]);
             }
          }
        }else{
          for(var j = 0;j<r.length;j++){
             list.push(r[j]);
             if(j<slist.length){
              list.push(slist[j]);
             }
          }
        }
        var List = [];
        for(var l = 0;l<list.length;l++){
          if(isNaN(list[l])){
            var temp = list[l];
            for(var k = 0;k<temp.length;k++){
              List.push(temp[k]);
            }
          }else{
            List.push(list[l]);
          }
        }
        console.log(List);
        list=List;

        var list1 = [];
        var list2 = [];
        for(var i = 0;i<list.length;i++){
          if(!isNaN(list[i])){
              list2.push(list[i]);
          }else if(list[i] == "+" || list[i] == "-"){
            if(list1.length == 0){
              list1.push(list[i]);
            }else{
              var tempp = "";
              var len = list1.length;
              for(var k = len-1;k>-1;k--){
                tempp = list1.pop();
                if (tempp != "(") {
                  list2.push(tempp);

                }
                if(tempp == "("){
                  list1.push(tempp);
                  break;
                }
              }
              list1.push(list[i]);
            }
          }else if(list[i] == ")"){
            var temp = "";
            temp = list1.pop();
            var len = list1.length;
              for(var k = len-1;k>-1;k--){
                if (temp != "(") {
                  list2.push(temp);
                  temp = list1.pop();
                }
                if(temp == "("){
                  break;
                }
              }
          }else if(list[i] == "*" || list[i] == "/" || list[i] == "("){
            list1.push(list[i]);
          }else{
            console.log("输入有误！")
          }
        }
        do
        {
          list2.push(list1.pop());
        }while(list1.length>0);
        console.log(list2);