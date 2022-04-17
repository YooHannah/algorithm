/**
 * 大数据题目解题技巧 
 * 1. 哈希函数可以把数据按照种类均匀分流
 * 2. 布隆过滤器用于集合的建立与查询，并可以节省大量空间
 * 3. 一致性哈希解决数据服务器的负载管理问题
 * 4. 利用并查集结构做岛问题的并行计算
 * 5. 位图解决某一范围上数字的出现情况，并可以节省大量空间
 * 6. 利用分段统计思想，并进一步节省大量空间
 * 7. 利用堆，外排序来做多个处理单元的结果合并
 */


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
 * 并查集
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


/**
 * 【题目】
 * 32位无符号整数的范围是0-4294967295，现在正好有一个包含40亿个无符号整数的文件
 * 所以在整个范围中必然存在没出现过的数，可以使用最多1GB的内存，怎么找到所有未出现过的数？
 * 
 * 方案：
 * 
 * 普通：如果用哈希表来保存出现过的数，那么如果40亿个数都不同，
 * 则哈希表的记录为40亿条，存一个32位整数需要4B，所以最差情况下需要40亿*4B=160亿字节，
 * 大约需要16GB的空间，这是不符合要求的。
 * 
​ * 哈希表需要占用很多空间，我们可以使用bit map的方式来表示数出现的情况。
 * 具体地说，是申请一个长度为4294967295的bit类型的数组bitArr,bitArr上的每个位置只可以表示0或1状态。
 * 8个bit位1B，所以长度为4294967295的bit类型的数组占用500MB的空间。
​ * 怎么使用这个bitArr数组呢？
 * 就是遍历这40亿个无符号数，例如，遇到7000，就把bitArr[7000]设置为1,遇到所有的数时，就把bitArr相应位置的值设置为1。
​ * 遍历完成后，再依次遍历bitArr,哪个位置上的值没有被设置为1，哪个数就不在40亿个数中。
 * 例如，发现bitArr[8001]==0，那么8001就是没出现过的数，遍历完bitArr之后，所有没出现的数就都找出来了。
 *
 * [进阶]
 * 内存限制为10MB,但是只用找到一个没出现过的数即可
 * 
 * 方案：
 * 首先，0-4294967295这个范围是可以平分成64个区间的，每个区间是67108864个数，
 * 例如：第0区间（0-67108863）、第1区间（67108864-134217728）、第i区间（67108864i-67108864*(i+1)-1）,…。
 * 因为一共只有40亿个数，所以，如果统计落在每一个区间上的数有多少，肯定有至少一个区间上的计数少于6710884.
 * 利用这一点可以找出其中一个没出现过的数。
 * 具体过程为：
​ * 第一次遍历时，先申请长度为64的整型数组countArr[0…63]，countArr[i]用来统计区间i上的数有多少。
 * 遍历40亿个数，根据当前数是多少来决定哪一个区间上的计数增加。
 * 例如，如果当前数是3422552090,3422552090/67108864=51，所以第51区间上的计数增加countArr[51]++。
 * 遍历完40亿个数之后，遍历countArr，必然会有某一个位置上的值(countArr[i])小于67108864，表示第i区间上至少有一个数每出现过。
 * 我们肯定会至少找到一个这样的区间。此时使用的内存就是countArr的大小（644B）,是非常小的。
​ * 假设我们找到第37区间上的计数小于67108864，以下为第二次遍历的过程：
 ​* 1.申请长度为67108864的bit map，这占用大约8MB的空间，记为bitArr[0…67108863];
​ * 2.再遍历一次40亿个数，此时的遍历只关注落在第37区间上的数，记为num(num/67108864==37)，其他区间的数全部忽略。
​ * 3.如果步骤2的num在第37区间上，将bitArr[num-6710886437]的值设置为1，也就是只做第37区间上的数的bitArr映射。
​ * 4.遍历完40亿个数之后，在bitArr上必然存在没被设置为1的位置，假设第i个位置上的值没被设置为1，那么6710886437+i这个数就是一个没出现过的数。
 * 总结一下进阶的解法：
​ * 1.根据10MB的内存限制，确定统计区间的大小，就是第二次遍历时bitArr大小。
​ * 2.利用区间计数的方式，找到那个计数不足的空间，这个区间上肯定有没出现的数。
​ * 3.对这个区间上的数做bit map映射，再遍历bit map，找到一个没出现的数即可。
 */

/**
 * 【题目】
 * 32位无符号整数的范围是0-4294967295，现在正好有40亿个无符号整数
 * 所以在整个范围中必然存在没出现过的数，可以使用最多1GB的内存，怎么找到出现了2次的数？
 * 
 * 方案：
 * 可以用bit map的方式表示出现的情况。
 * 具体地说，是申请一个长度为42949672952的bit类型的数组bitArr，
 * 用2个位置表示一个数出现的词频，1B占用8个bit，所以长度为4294967295*2的bit类型的数组占用1GB空间。
 * 怎么使用这个bitArr数组呢？遍历这40亿个无符号数，
 * 如果初次遇到Num,就把bitArr[num2+1]和bitArr[num2]设置为01，
 * 如果第二次遇到Num，就把bitArr[num2+1]和bitArr[num2]设置为10，
 * 如果第三次遇到num，就把bitArr[num2+1]和bitArr[num2]设置为11.
 * 以后再遇到num，发现此时bitArr[num2+1]和bitArr[num2]已经被设置为11，就不再做任何设置。
 * 遍历完成后，再依次遍历bitArr，如果发现bitArr[i2+1]和bitArr[i2]设置为10，那么i就是出现了两次的数。
 *
 * [进阶]
 * 内存限制为10MB,怎么找到这40亿个整数的中位数？
 * 
 * 方案：
 * 用分区间的方式处理，
 * 长度为2MB的无符号整型数组占用的空间为8MB，所以讲区间的数量定为4294967295/2M，向上取整为2048个区间，
 * 第0区间为0-2M-1，第1区间为2M-4M-1，第i区间为2Mi-2M(i+1)-1…
​ * 申请一个长度为2148的无符号整型数组arr[0…2147],arr[i]表示第i区间有多少个数。
 * arr必然小于10MB。然后遍历40亿个数，如果遍历到当前数为num，先看Num落在哪个区间上(num/2M)，然后对应的进行arr[num/2M]++操作。
 * 这样遍历下来，就得到了每一个区间的数的出现状况，
 * 通过累加每个区间的出现次数，就可以找到40亿个数的中位数(也就是第20亿个数)到底落在哪个区间上。
 * 比如，0-K-1区间上的个数为19.998亿，但是发现当加上第K个区间上的个数之后就超过了20亿，
 * 那么可以知道第20亿个数是第K区间上的数，并且可以知道第20亿个数是第K区间上的第0.002亿个数。
​ * 接下来申请一个长度为2MB的无符号整型数组countArr[0…2M-1]，占用空间8MB。
 * 然后遍历40亿个数，此时只关心处在第K区间的数记为numi，其他的数省略，
 * 然后将countArr[numi-K*2M]++,也就是只对第K区间的数做频率统计。
 * 这次遍历完40亿个数之后，就得到了第K区间的词频统计结果countArr，最后只在第K区间上找到第0.002亿个数即可。
 */


/**
 * 【题目】
 * 有一个包含100亿个URL的大文件，假设每个URL占用64B,请找出其中所有重复的URL
 * 
 * 方案：
    1. 将100亿的大文件通过哈希函数分配到100台机器上，哈希函数的性质
    决定了同一条URL不可能分给不同的机器；
    2. 然后每一台机器分别统计给自己的URL中是否有重复的URL，（或者在
    单机上将大文件通过哈希函数拆成1000个小文件，对每一个小文件再进行
    哈希表遍历），找出重复的URL；
    3. 还可以在分给机器或拆完文件之后进行排序找重复URL，排序过后看是
    否有重复的URL出现。
*/

/**
 * [题目]
 * 某搜索公司一天的用户搜索词汇是海量的(百亿数据量)，
 * 请设计一种求出每天热门Top100词汇的可行办法
 * 
 * 方案
    1.哈希分流。首先把包含百亿数据量的词汇文件分流到不同机器上；
    如果每一台机器上分到的数据量依然很大，再用哈希函数把每台机器
    的分流文件拆成更小文件处理；
    2. 处理每一个小文件时，通过哈希表做一个词频统计，哈希表记录完成
    后；再遍历哈希表，过程中用大小为100的小根堆来选出每一个小文件
    的 Top100（未排序）；
    3.将小文件的 Top100的小根堆按照词频排序；把每个小文件进行排序后
    的Top100进行外排序或者利用小根堆，选出每台机器上的Top100；
    4.不同机器之间的Top100再进行外排序或者利用小根堆，最终求出整个
    百亿数据量中的Top100。
 */


