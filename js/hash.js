 //散列表(哈希表)插入和删除
 //初始化散列表
  var hashtable={
    count:12,
    elem:[]
  }
  for(var i=0;i<12;i++){
    hashtable.elem.push(-1);
  }
  //散列函数用除留取余法
  function Hash(val){
    return val%12;
  }
  //插入关键字到散列表
  function InsertHash(table,key){
    var addr = Hash(key);
    //找空位
    while(table.elem[addr] != -1){ //发生冲突
      addr = (addr+1) % 12;
    }
    table.elem[addr] = key;
    return table;
  }
  //查找散列表
  function SearchHash(table,key){
    var addr  = Hash(key);
    while(table.elem[addr] != key){ //如果地址发生冲突则按照冲突地址解决方法寻找下一个地址
      addr = (addr+1) % 12;
      //如果记录没找到或者循环又回到了发生冲突的地址
      if(table.elem[addr] == -1|| addr == Hash(key)){
        return false;//则说明不存在该记录
      }
    }
    return true;//否则，存在
  }
  var keys = [12,67,56,16,25,37,22,29,15,47,48,34];
  for(var j = 0;j<keys.length;j++){
    hashtable = InsertHash(hashtable,keys[j]);
  }
  console.log(hashtable);
  console.log(SearchHash(hashtable,34));