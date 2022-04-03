/**
 * 哈希函数
 * 一些特征
 * 1. 输入可以无穷，输出有限
 * 2.相同输入相同输出
 * 3.不同输入可能产生相同输出 ===> 哈希碰撞
 * 4. 具备离散均匀性
 * 应用
 * 既然哈希函数具备离散均匀性，那么对于哈希函数离散处理过的结果进行%m取模操作
 * 就可以得到0-m-1范围内均匀分布的结果。
 * 例如统计40亿个数据中出现次数最多的数，内存最大1G
 * 单纯用哈希表的话会超内存，可以先对40亿数据进行哈希并取模M梳理，
 * 那么40亿个数就会被转换成0-M-1间的数，对转换结果进行哈希表处理，统计出现最多次数
 * 即对应原来数据最多次数，利用离散均匀性，出现碰撞也可以被均分
 */

/**
 * 哈希表
 * 一般结构是，key值为哈希函数处理结果取模后的值，value 为原始值，
 * 取模相同的原始数据通过链表链接起来
 * key : originVal1 —— originVal2 ——originVal3
 * 
 * 应用： 通过设置链表长度，触发扩容机制，当链表长度达到阈值，
 * 说明整个表的所有key对应的value链表长度基本上都已经是这个值，达到了存储极限，
 * 从而可以及时进行扩容
 * 
 */

/**
 * 布隆过滤器
 * 
 * 利用位图结构，存储经过K个哈希函数取模M处理后的样本的K个结果,
 * 假如，总长M的容器位置上，K个结果对应的K个位置都标1，
 * 当需要判断某个样本值H是否满足原来样本数据时，
 * 对样本H进行哈希取模处理
 * 通过位图判断是否符合条件
 * 如果经过处理的样本H的K个结果在位图的K个位置均符合原始样本存储的结果
 * 即K个位置上都是1，那么需要进行判断的样本H就是原始样本中的一员
 * 
 * 失误点
 * 原始样本一定可以被判断出来
 * 但是非原始样本成员可能会被误判为原始成员，当M比较小的时候
 * 
 * 计算公式
 * n = 样本量 p = 失误率 
 * m = -(n * ln p)/((ln2)^2)
 * k = ln2 * (m/n) ~ 0.7 * (m/n)
 * p真 = (1 - e ^ (-n*k真/m真)) ^ k真
 * 
 * 应用：
 * 1. 处理40亿个url为黑名单，判断某个url是否在黑名单上，允许有失误
 * 2. 处理数据应该存储的哪个机器上，
 * 机器的代表值Key 是m的一个种类，也是数据取模后的一种结果
 * 
 */

const arr = []; // 假如长度为10，每个位置存储的数据代表32位的信息
/**
 * arr[0] --> 0 ~31
 * arr[1] --> 32~63
 * arr[2] --> 64~95
 */
const i = 178; // 想获取第178位的信息
const numIndex = 178/32;
const bitIndex = 178%32;
const s = (arr[numIndex] >> bitIndex) & 1; // 拿到第178位的状态
arr[numIndex] = arr[numIndex] | (1 << bitIndex); // 把178位状态改成1
arr[numIndex] = arr[numIndex] & (~ (1 << bitIndex)); // 把178位改成0

/**
 * 什么是一致性哈希/一致性哈希原理
 * 解决数据服务器存储的问题
 * 传统哈希函数取模处理存机器的方案 
 * 缺点就是如果增加一台机器，所有数据存储都要重新计算，因为相当于取模值增加了1
 * 使用哈希环确定数据归属
 * 使用虚拟结点解决环不均分和负载不均衡的问题
 */

/**
 * 应用：并查集
 * 解决如何快速判断两个元素是否在统一集合中，快速合并元素为一个集合的问题
 */

class UnionFindSet () {
  constructor() {
    this.elementMap = new Map();
    this.fatherMap = new Map();
    this.sizeMap = new Map();
  }

  initSet(list) {
    for(let i = 0;i<list.length;i++) {
      const value = list[i];
      const element = { value };
      this.elementMap.set(value, element);
      this.fatherMap.set(element,element);
      this.sizeMap.set(element, 1);
    } 
  }

  findHead(element) {
    const path = [];
    let tempElement = element;
    while(tempElement != this.fatherMap.get(tempElement)){
      path.push(tempElement);
      tempElement = this.fatherMap.get(tempElement)
    }
    if(path.length) {
      const size = this.sizeMap.get(tempElement);
      this.sizeMap.set(tempElement, size+path.length)
    }
    while(path.length) {
      const pathElemet = path.pop();
      this.fatherMap.set(pathElemet, tempElement);
    }
    // return tempElement;
  }

  isSameSet(a,b) {
    if(this.elementMap.has(a) && this.elementMap.has(b)) {
      return this.findHead(this.elementMap.get(a)) === this.findHead(this.elementMap.get(b))
    }
    // return false;
  }
  
  union(a,b) {
    if(!this.elementMap.has(a) && this.elementMap.has(b)) {
      return
    }
    const aF = findHead(elementMap.get(a));
    const bF = findHead(elementMap.get(b));
    if(aF != bF) {
      const big = sizeMap.get(aF) > sizeMap.get(bF) ? aF : bF;
      const small = big === aF ? bF : aF;
      fatherMap.set(big, small);
      sizeMap.put(big, sizeMap.get(aF) + sizeMap(bF));
      sizeMap.delete(small);
    }
  }
}

/**
 * 设计RandomPool结构
 * 【题目】
 * 设计一种结构，在该结构中有如下三个功能
 * insert(key) 将某个key加入到该结构，做到不重复加入
 * delete(key) 将原本在结构中的某个key移除
 * getRandom() 等概率随机返回机构中的任何一个key
 * 
 * 要求：以上三个方法的时间复杂度都是O(1)
 */
class RandPool {
  constructor() {
    this.map1 = new Map(); // 存放value Key 结构
    this.map2 = new Map(); // 存放key value 结构
    this.lastIndex = 0;
  }
  insert(key){
    if (this.map1.has(key)) {
      console.log('sorry, has inserted');
      return;
    }
    this.map1.set(key, this.lastIndex);
    this.map2.set(this.lastIndex, key);
    this.lastIndex++
  }

  getRandom() {
    const randomNumber = parseInt(Math.random() * (this.lastIndex + 1))
    return this.map2.get(randomNumber);
  }
  delete(key) {
    if(!this.map1.has(key)) {
      console.log('sorry, no this key~~');
      return;
    }
    const pos = this.map1.get(key);
    const currentLastValue = this.map2.get(this.lastIndex);
    this.map1.set(currentLastValue, pos);
    this.map1.delete(key);
    this.map2.set(pos, currentLastValue);
    this.map2.delete(this.lastIndex);
    this.lastIndex--;
  }
}

/**
 * 岛问题
 * 【题目】
 * 一个矩阵中只有0和1 两种值，每个位置都可以和自己的上下左右4个位置相连，
 * 如果有1片1连在一起，这个部分叫做一个岛，
 * 求一个矩阵中有多少个岛？
 * 
 * 例如
 * 001010
 * 111010
 * 100100
 * 000000
 * 这个矩阵中有三个岛
 * 
 * 进阶：
 * 如何设计一个并行算法解决这个问题
 * 
 */
 const infect = (arr, i, j, lines, columns) => {
  if(i<0 || i>=lines || j <0 || j>=columns || arr[i][j] !=1) {
    return;
  }
  arr[i][j] = 2;
  infect(arr,i-1,j,lines, columns);
  infect(arr,i+1,j,lines, columns);
  infect(arr,i,j-1,lines, columns);
  infect(arr,i,j+1,lines, columns);
}
const countIslands = arr => {
  const lines = arr?.length;
  const columns = arr && arr[0]?.length;
  if (!arr || !lines || !columns) {
    return 0;
  }
  let j = 0;
  let count = 0;
  for(let i=0; i<lines; i++) {
    const line = arr[i];
    for(let j = 0;j < columns; j++) {
      const value = line[j];
      if(value === 1) {
        count++;
        infect(arr, i, j, lines, columns);
      }
    }
  }
  return count;
}
