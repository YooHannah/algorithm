/**
 * 哈希函数
 */

/**
 * 哈希表
 */

/**
 * 布隆过滤器
 */

/**
 * 什么是一致性哈希/一致性哈希原理
 * 
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
