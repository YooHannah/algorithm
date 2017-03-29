
   //指定字符串建立赫夫曼编码。
   //也可以初始化所有字符，再根据想要编码的字符串进行出现次数统计
    var str = 'I love Sunshine!';

    //统计字符出现次数
    var prio = {};
    var toporder = [];
    for(var i = 0;i<str.length;i++){
      prio[str[i]] = 0;
    }
    for(var i = 0;i<str.length;i++){
      prio[str[i]] += 1;
    }
    for(item in prio){
      toporder.push({
        'name':item,
        'number':prio[item],
        'code':''
      })
    }

    //创建优先级队列(排一下序) toporder,queue
    var compare = function (prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (val1 < val2) {
                return 1;
            } else if (val1 > val2) {
                return -1;
            } else {
                return 0;
            }
        }
    }
    toporder = toporder.sort(compare('number'));
    var queue = toporder.slice(); //编码的时候用到

    //创建赫夫曼树heffmantree
    var heffmantree = toporder.pop();
    function createtree(){
      var node2 = toporder.pop();
      if(node2 != undefined){
        var node = {
        'number':0,
        'left':null,
        'right':null
      }
       node.number = heffmantree.number + node2.number;
      if(heffmantree.number < node2.number){
        node.left = heffmantree;
        node.right = node2;
      }else{
        node.left = node2;
        node.right = heffmantree;
      }
      heffmantree = node;
      createtree()
      }
    }
    createtree();
    console.log(heffmantree);
    //建立字符编码
    function creatcode(val){
      if(node.left != undefined){
        if(node.left.name == val.name){
          val.code+='0';
        }else{
          val.code+='1';
          node = node.right;
          creatcode(val);
        }
      }
    }
    for(var k =0;k<queue.length;k++){
      var node = heffmantree;
      creatcode(queue[k]);
    }
    //字符编码
    function encode(str){
      var code = '';
      for(var k = 0;k<str.length;k++){
        for(var j=0;j<queue.length;j++){
          if(str[k] == queue[j].name){
            code += queue[j].code;
            break
          }
        }
      }
      return code;
    }
    console.log(encode('love'));//1111110111111110111100

    //字符解码
    function decode(code){
      var node = heffmantree;
      var str = '';
      for(var k =0;k<code.length;k++){
        if(code[k] == 0){
          if(node.left.name != undefined){
            str += node.left.name;
            console.log()
            node = heffmantree;
          }else{
             node = node.left;
          }
        }else{
          if(node.right.name != undefined){
            str += node.right.name;
            node = heffmantree;
          }else{
             node = node.right;
          }
        }
      }
      return str;
    }
    console.log(decode('1111110111111110111100'));//love