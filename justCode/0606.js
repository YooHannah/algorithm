/**0606 */

/**
 * 给定一个数组，求排序之后，相邻两数的最大差值，
 * 要求时间复杂度O(N),且要求不能用基于比较的排序
 * 
 * 思路：
 * 找出最大最小值，涵盖这两值范围，均等10分，形成10个桶
 * 将所有数字放入10个桶中
 * 计算每个桶中最大最小值，
 * 让最大值和下一个桶的最小值求差，
 * 让最小值和上一个桶的最大值求差
 * 从里面找最大值即要求的最大差值
 * 
 * 原理
 * 一个桶里面的数字差肯定小于桶的范围大小，直接忽略不计
 * 从桶之间找最大值
 */

/**
 * 给出n个数字，问最多有多少不重叠的非空区间，使得每个区间内数字的xor都等于0
 * 
 * 
 */

/**
 * 现有n1  + n2 种面值的硬币，
 * 其中n1种为普通币，可以取任意枚，
 * n2种为纪念币，每种最多只能取一枚
 * 每种硬币有一个面值，问能用多少种方法拼出m的面值？
 * 
 * 思路：
 * 预处理一下，先算出只用n1 类型的硬币和只用n2类型硬币，拼出0-m面值的方法数
 * 再用n1 硬币 拼出x面额，有a种方法，
 * 剩下m-x面额用n2硬币拼出有b种方法
 * 所有情况a*b累计和就是最终方法数
 */

/**
 * 
 * 给定两个有序数组A和B，长度分别是m和n
 * 求A和B中最大的K歌数字
 * 要求使用尽量少的比较次数
 * 
 * 思路：
 * 利用一个数组中位数位置，比较大小，算出右边数字个数
 * 和另一个数组大于该中位数的数字个数
 * 加一起是否等于K  
 */

/******************** 0607 ****************/ 
/**
 * 约瑟夫杀人算法变形
 * 每次数的要杀的人是从这一轮开始的那个人拿到的编号
 * 编号是几数几个人
 * 
 * 某公司招聘，有n 个人入围，HR在黑板上写下m个正整数
 * a1,a2,...am
 * 用作n个人循环领取的临时编号
 * n个人原始编号顺序依次是0, 1, ... n-1
 * 现在从原始编号0这个人开始领取临时编号
 * 0到n-1个人领到的临时编号依次是
 * a1,a2,...am, a1,a2,...am,...a(n%m)
 * 都领完后，看原始编号0这个人手上的临时编号a1, 
 * 从原始编号0这个人开始数，输到第a1个人，
 * 把第a1这个人淘汰，假设这个人原始编号是x
 * 下一轮从x+1开始
 * 看x+1手上的临时编号是几，数几个人，然后淘汰，
 * 以此多轮淘汰后，剩一个人，
 * 返回该人的原始编号
 * 
 */

/****** 0608 ******/

/**
 * 给定一个N*3的矩阵matrix,
 * 对于每一个长度为3的小数组arr
 * 都表示一个大楼的3个数据
 * [大楼左边界， 大楼右边界，大楼高度（一定都大于0）]
 * 地基都在X轴上，大楼之间可能会有重叠
 * 请返回整体轮廓线数组
 * 例如，matrix = 
 * [
 *  [2,5,6],
 *  [1,7,4],
 *  [4,6,7],
 *  [3,6,5],
 *  [10,13,12],
 *  [9,11,3],
 *  [12,14,4],
 *  [10,12,5]
 * ]
 * 
 * 返回：
 * [
 *  [1,2,4],
 *  [2,4,6],
 *  [4,6,7],
 *  [6,7,4],
 *  [9,10,3],
 *  [10,12,5],
 *  [12,14,4]
 * ]
 * 
 * 思路：
 * 组装成有序表
 * 将每个子数组拆成两个
 * 原数组[a,b,c]
 * 拆成这样的两个
 * [a,up,c], [b,down,c]，这样数组为描述方便成为边界数组
 * 所有子数组拆完后
 * 按边界数组第一项从小到大排序，up在前，down在后
 * 准备两个有序表，
 * map1: 存放统计的《高度：频次》，相同高度，每遇到一个down边界减1，
 * map2: 存放当统计到当前坐标高度后，《当前坐标: 此时map1中的最大高度值》
 * 统计完后看map2高度变化
 * 假设map2 = {
 *  <1: 4>
 *  <2: 8>
 *  <4: 8>
 *  <3: 8>
 *  <4: 8>
 *  <6: 5>
 *  <7: 0>
 * 
 * }
 * 那么最终返回的结果就是
 * [
 * [1,2,4],
 * [2,4,8],
 * [4,6,5],
 * [6,7,5],
 * ]
 * 
 * 其实map2存放的是当前坐标所处的最大高度
 */


/**
 * 给定一个均为正数无序的数组arr,求数组中所有子数组中相加和为 K 的最长子数组长度
 * 要求时间复杂度O(N),时间复杂度O(1)
 * 
 * 例arr = [1,2,1,1] k = 3 
 * 返回 3
 * 
 * 思路：
 * 使用窗口移动
 * 准备box = [], 存放累计和k的子数组长度的各种情况
 * 开始L = R = i = 0
 * sum = 1， 数组第一个值
 * sum < K， R 右移一个, sum+=arr[++i];
 * 如果sum < k, 继续右移sum+=arr[++i];
 * 如果sum == K, box.push(R -L +1), R 继续右移
 * 如果sum > K, L右移一个，sum = sum - arr[L];
 * 再判断sum与k关系，直到 L= R = arr.length -1;
 * 
 * 找出box最大值返回
 * 
 * 
 */

/**
 * 给定一个正负0都包含的无序数组,
 * 求数组中所有子数组中相加和小于等于 K 的最长子数组长度
 * 
 * 例如arr = [3,-2,-4,0,6],K =2;
 * 相加小于等于2的最长子数组为[3,-2,-4,0],长度为4故返回4
 * 
 * 例如
 * 先从后往前计算一下累计和，如果之前计算的大于0，不累加
 * arr2 =  [-3,-6,-4,0,6]
 * 对应计算的右边界为
 * arr3 = [2,2,2,3,4]
 * 把右边界一样的分成一组，计算累计和
 * [-3, 0, 6]
 * -3 + 0 = -3 <2,所以就是0-3位置上的数加起来小于2
 */

/**
 * 给定一个非负数组，每个位置上代表有几枚铜板
 * a先手b后手，每次都可以拿任意数量铜板，但是不能不拿
 * 谁最先把铜板拿完谁赢，
 * 返回获胜者名字
 */


 /**0609 */

 /**
  * 现有一个去重的字符数组
  * 例如 arr = ['a', 'b', ... 'z'];
  * 由arr中字符组成的字符串与数字形成这样的关系
  * a,b,...z,aa,ab,...az,ba,bb,...zz,aaa,...zzz,aaaa,...
  * 1,2,...26,27,28,...52,53,54,...702,703,...18278,18279,...
  * 求给定数组形成的字符串与数字的互转函数
  * 
  * 思路：
  * 使用伪x进制思想
  * 原来arr数组有多少字符使用几进制
  * 先把原数字转换成伪进制
  * 伪进制上每一位数字是几，代表取arr上哪个位置字符
  * 再转换成字符
  * 
  * 伪X进制思想：
  * 以伪7进制为例
  * 每一位上只能是1-7这个几个数字，每一位所带的幂次方跟二进制相同
  * 例如
  * 伪7进制的数673 转10进制的转换过程为：
  * 6 * 7^2 + 7 * 7 ^ 1 + 3 * 7 ^ 0
  */

 const generateTransformTool = arr => {
  const length = arr.length;
  const numToString = num => {
    if (num <= length) {
      return arr[num-1];
    }
    const list = [];
    num = num;
    let power = 0;
    while(num) {
      const nextlevel = Math.pow(length, power);
      if(num >= nextlevel) {
        list.push(1);
        num = num - nextlevel;
        power++
      } else {
        power--;
        const basic = Math.pow(length, power);
        const count = Math.floor(num / basic);
        list[power] += count;
        num = num - count*basic;
      }
    }
    return list.reverse().map(e => arr[e-1]).join('');
  }

  const stringToNum = str => {
    const list = str.split('').map(e => 1 + arr.findIndex(char => char === e)).reverse();
    let sum = 0;
    list.forEach((val, index) => {
      sum+=val * Math.pow(length, index);
    })
    return sum;
  }
  return {
    numToString,
    stringToNum
  }
}

/**
 * 现有一二维数组matrix,均为整数，正负都有，
 * 贪吃蛇可以从矩阵最左侧一列任意一个单元格当做起点进入矩阵
 * 每次只能到达当前位置进入右上相邻，右侧相邻，和右下相邻的单元格
 * 每到达一个单元格后，生命值累计单元格的值
 * 但可以在游戏开始前将矩阵内任意一个单元格转换成相反数，且只能转换一次
 * 当贪吃蛇的生命值小于0，则游戏结束
 * 问贪吃蛇游戏过程中能获得的最高生命值可以有多少？
 * 例如
 * 1 -4 10
 * 3 -2 -1
 * 2 -1 0
 * 0 5 -2
 * 最右路径是从最左侧3开始，3->-4(这里使用转换相反数) -> 10 ===> 返回17
 * 
 * 思路：
 * 尝试所有可能性
 * 找最大值
 * 
 */
const f = (matrix, row, col) => {
  const val = matrix[row][col];
  if (!col) {
    return {
      yes: -val,
      no: val
    }
  }
  let preNo = -1;
  let preYes = -1;
  if(row) {
    // 从左上角来到当前格子
    const {yes, no} = f(matrix, row-1, col-1);
    if(yes >=0) {
      preYes = yes;
    }
    if(no >=0) {
      preNo = no
    }
  }
   // 从左侧来到当前格子
  const {yes,no} = f(matrix, row, col-1);
  if(yes >=0) {
    preYes = Math.max(yes, preYes);
  }
  if(no >=0) {
    preNo = Math.max(no, preNo)
  }
   // 从左下角来到当前格子
  if(row < matrix.length -1) {
    const {yes,no} = f(matrix, row+1, col-1);
    if(yes >=0) {
      preYes = Math.max(yes, preYes);
    }
    if(no >=0) {
      preNo = Math.max(no, preNo)
    }
  }
  let y = -1;
  let n = -1;
  if (preNo >=0) {
    y = preNo + (-val);
    n = preNo + val;
  }

  if(preYes) {
    y = Math.max(preYes + val, y);
  }
  return {
    yes: y,
    no: n
  }
}
const getMaxLife = matrix => {
  const rowLength = matrix.length;
  const colLength = matrix[0].length;
  let life = Number.MIN_VALUE;
  for(let i = 0; i<rowLength; i++) {
    for(let j = 0; j<colLength;j++) {
      const cur = f(matrix, i,j);
      life = Math.max(life, cur.yes, cur.no);
    }
  }
  return life;
}

/**
 * 给定一个计算式的字符串，返回计算式计算结果
 * 例如str = '48*(70-65)+8*1', 返回-1816
 * 
 * 思路：
 * 将数据和符号依次进栈
 * 如果栈顶是乘除号，从栈中pop出符号和数字，跟当前数字计算后再入栈
 * 如果是左括号，记录下当前位置，从当前位置往后计算，步骤同上
 * 直到遇到右括号，将所有值从栈中pop出，计算结果再返回继续计算
 * 
 */
const highCalculate = (num, stack) => {
  if(num) {
    const currLast = stack.pop();
    if(currLast == '*') {
      const preNum = stack.pop(); 
      stack.push(Number(num) * preNum);
    } else if(currLast == '/') {
      const preNum = stack.pop(); 
      stack.push(Number(num) / preNum);
    } else if(currLast) {
      stack.push(currLast);
      stack.push(Number(num));
    } else {
      stack.push(Number(num));
    }
  }
}
const calculate = (str, pos) => {
  const list = str.split('');
  const stack = [];
  let num = '';
  let i = -1;
  for(i= pos; i< list.length; i++) {
    const char = list[i];
    if(Number(char)) {
      num = `${num}${char}`;
      if ( i === list.length -1) {
        stack.push(Number(num));
      }
    } else {
      highCalculate(num, stack);
      if(char === '(') {
        const {result, currPos} = calculate(str, i+1);
        highCalculate(result, stack); // 括号前面可能是乘除
        i = currPos;
      } else if(char === ')') {
        break;
      } else {
        stack.push(char);
        num = '';
      }
    }
  }
  let count = stack[0];
  for(let m = 1; m < stack.length; m +=2) {
    const operator = stack[m] == '+';
    const next = stack[m+1];
    count = operator ? count +  next : count - next; 
  }
  return {
    result: count,
    currPos: i
  }
}

 /**
  * 给定一数组，数组中值代表人的体重
  * 给定一艘船的载重limit
  * 现在按如下规则坐船
  * 1. 每条船最多俩人
  * 2. 两人体重和不能超过船的载重
  * 问至少需要多少船
  * 
  * 思路：
  * 先将所有人体重由大到小排序，找到中位数，
  * 然后看中位数两侧数据加和是否小于等于limit
  * 满足的话船数加1
  * 不满足的话，
  * 如果大于limit,中位数左侧数据移动，
  * 最终如果小于中位数的数据剩下m个
  * 大于中位数的数据剩下n个
  * 需要船数 = 满足两人一条船的情况 + m /2 + n
  * 
  * 
  */

/**
 * 给定两字符串str1和str2,求两个字符串的最长公共子串
 * 动态规划空间压缩应用
 */

 /**
 * 给定两字符串str1和str2,求两个字符串的最长公共子序列
 * 动态规划空间压缩应用
 */




/**
 * 给定一个字符串str,求最长回文子序列，注意区分子序列和子串的不同
 * 
 */

/**
 * 给定一个字符串，可以在str任意位置添加字符使原字符变成回文字符串
 * 求需要添加最少字符数时生成的回文字符串
 * 
 * 
 */

/**
 * 给定一个字符串str,返回把str全部切成回文子串的最小分割数
 * 例如：
 * aba 本身就是回文，不用切割返回0
 * acdcdcdad, 切两次变成3个回文子串， a , cdcdc, dad
 */

/**
 * 给定一个字符串str,通过去除字符串中的字符，使原字符串变成回文字符串
 * 请问有多少种不同的方案？
 * 如果移除的字符组成的序列不一样，归为不同的方案
 * 
 */


 /***0611 */

 /**
  * 动态规划状态依赖技巧
  * 
  * 给定一个正整数，求裂开的的方式有多少种
  * 比如
  * 1 => (1) 1种
  * 2=> (1,1) (2) 2种
  * 3=>(1,1,1)(1,2),(3) 3种
  * 4=>(1,1,1,1)(1,1,2)(1,3)(2,2)(4) 5种
  * 
  */

/**
 * 给定一颗二叉树的头结点head
 * 已知所有节点都不一样，返回其中最大的且符合搜索二叉树条件的最大拓扑结构大小
 * 拓扑结构：不是子树，能连起来的结构都算
 * 
 */

/**
 * 给定一个长度为偶数的数组arr,长度记为2*N
 * 前N个为左部分，后N个为右部分
 * arr就可以表示为[l1,l2,l3,...ln,r1,r2,r3,...rn]
 * 请将数组调整成[r1,l1,r2,l2,...rn,ln]的样子
 * 
 * 思路：
 * 完美洗牌问题
 * 根据变换规则可以知道
 * 原来的每个数据最终会在什么位置，
 * 但是在一轮交换数据过程中不能保证所有的数据都会轮到被交换
 * 只能部分数据可以得到交换，然后再部分数据的到交换
 * 为避免通过记录交换状态带来的性能问题
 * 使用完美洗牌规律
 * 如果整个数组的长度 2 * N = 3^k -1 ,其中k>=1
 * 也就是M = 2 * N = 2,8,26，... 这样的偶数时
 * 每次交换的数据可以从3^(k-1)的位置开始 数组位置从1开始
 * 比如 M = 26时
 * 进行交换的数据可以从1,3,9，开始
 * 
 * 比如现在M = 12， 它最接近的3^k - 1是8
 * 那就先对未来的签8个数据进行交换
 * 先找到12个数据的中间mid
 * 将mid左边两个和右边4个做交换
 * l1,l2,l3,l4,l5,l6,r1,r2,r3,r4,r5,r6 变成
 * l1,l2,l3,l4,r1,r2,r3,r4,l5,l6,r5,r6
 * 这样前8个就可以按照从1,3位置开始进行交换的处理
 * 剩下l5,l6,r5,r6 ，最接近2
 * l5,l6,r5,r6  变成 l5,r5,l6,r6 
 * 处理 l5,r5, 交换一下
 * 再处理l6,r6 交换一下
 * 
 * 扩展：
 * 将一无序数组调整成[a,b,c,d,e,f,g,h....]的顺序
 * a<=b>=c<=d>=e<=f>=g<=h
 * 要求空间复杂度为O(1)
 * 思路：
 * 先将数组从小到大排序，
 * 如果是偶数个直接使用洗牌思路
 * 如果是奇数个，排除掉最小的一个数据
 * 剩下的偶数个进行洗牌
 * 洗完在最开始，再加上最小的数据
 */
 
const rotate = (arr, left, mid, half) => {
  const leftPart = arr.slice(left + half, mid +1); //中点左边需要换的一段
  const rightPart = arr.slice(mid+1, mid + half + 1);// 中点右边需要换的一段
  const newPart = [...leftPart.reverse(), ...rightPart.reverse()].reverse()
  arr.splice(left + half, newPart.length, ...newPart);
 }

 // 获取满足洗牌规律的最终位置
 const getFinalPos = (pos, len) => {
   const half = Math.floor(len/2);
   if (pos <= half) {
    return 2 * pos
   } else {
     return 2 * (pos - half) -1;
   }

   // return (2 * i) % (len + 1); // 上面逻辑优化
 }
 // 根据不同圈开始的位置，开始调换数据
 const cycles = (arr, left,len, k) => {
  const list = arr.slice(left, left + len);
  for(let i = 0;i<k; i++) {
    const pos = Math.pow(3,i);
    let curr = getFinalPos(pos,len);
    let originalValue = list[pos-1];
    while(curr != pos) {
      const temp = list[curr -1];
      list[curr - 1] = originalValue;
      originalValue = temp;
      curr = getFinalPos(curr,len);
    }
    list[pos -1] = originalValue;
  }
  arr.splice(left, len, ...list);
 }
 // 对数组进行切片处理
 const shuffle = (arr, left,right) => {
   while(right - left + 1) {
    const length = right - left +1;
    let base = 3;
    let k = 1;
    while(Math.pow(base,k) - 1 <= length) {
      k++;
    }
    k--;
    base = Math.pow(base,k) - 1;
    const mid = Math.floor((right+left)/2);
    const half = base / 2;
    rotate(arr, left, mid, half);
    cycles(arr, left, base, k);
    left = left + base;
   }
 }
 const washCard = arr => {
   const length = arr.length;
   if (arr && length && !(length % 2)) {
    shuffle(arr, 0, length -1);
    return arr
   }
 }


/**
 * 判断一个由[a-z]字符构成的字符串和一个包含'.'和'*'通配符的字符串是否匹配
 * '.'匹配任一单一字符，'*' 匹配0个或者多个字符
 * 输入的字符串长度不会超过100，且不为空
 * 
 */

/**
 * 数组异或和的定义： 将数组中所有的数异或起来得到的值
 * 给定一个整型数组arr, 其中可能有正数，负数，0，
 * 求其中子数组的最大异或和
 * 
 * 
 */

 /**
  * 给定一个数组，数组上每个位置的值，代表该位置气球的分数
  * 打爆气球得分规则如下
  * 1，如果被打气球左右两边还有气球，找到离他最近的气球，本次得分为三者分数乘积
  * 2. 如果左右两侧气球都没有了，则本次分数为被打气球分数
  * 3.如果左右两边任意一边气球被打完，另一边有气球，
  * 则本次得分为有气球一方离被打气球最近的气球分数与被打气球分数乘积
  * 4.打爆所有气球得分之和为总分数，所以打爆气球顺序可以决定不同总分数
  * 求能获得的最大分数
  */

/**
 * 汉诺塔要求把所有圆盘从左边移动到右边
 * 现给定一个数组arr表示各个圆盘当前在哪个柱子上
 * 1代表在左住上，2代表在中柱上，3代表在右柱上
 * 例如[3,3,2,1],表示现在有2个盘子在右柱上，1个在中柱上，1个在左柱上
 * 假如arr现在表示最优移动过程中的一个状态，返回是移动过程中的第几步
 * 如果不是游戏中的一个状态，返回-1
 * 
 */

 /**
  * 0615
  */

/**
 * 给定一个字符串str1和str2,求str1的子串中含有str2所有字符的最小字符长度
 * 
 * 例如str1 = 'abcde', str2 = 'ac'
 * str1子串中‘abc’ 满足，包含str2,且长度最短，返回3
 * str1 = '12345'， str2 = '344'
 * str1子串中没有包含str2的，所以返回0
 */

/**
 * LFU 缓存替换算法
 * 
 * 一个缓存结构需要实现如下功能
 * set(key, value) 加入或者修改key对应的value
 * get(key) 查询key对应的value
 * 
 * 但是缓存中最多放K条记录，如果新的第K+1条记录要加入，
 * 就根据策略删掉一条记录，然后才能把新纪录加入
 * 策略如下：
 * 在缓存的K条记录中，
 * 哪一个Key从进入缓存结构的时刻开始
 * 被调用set或者get的次数最少的，就删除掉
 * 如果最少次数有多个，删除上次调用发生时间最早的key
 * 
 * 实现整个结构，K作为参数给出
 * 
 */

/***
 * N个加油站组成一个环形，
 * oil数组表示第i个加油站可以给加多少油
 * dis数组表示第i个加油站到第i+1个加油站需要消耗的油量
 * 请选择一个加油站，从这个加油站开始给没有的车加上可以加的油量后
 * 开始依次通过N个加油站
 * 问是否存在可以跑完N个加油站回到触发加油站的方案
 * 存在的话，返回从第几个加油站出发
 * 
 */

/**
 * 一颗二叉树原本是搜索二叉树
 * 但是其中有两个节点调换了位置
 * 使得这颗二叉树不再是搜索二叉树
 * 请找出这两个节点返回
 * 
 * 进阶：
 * 如果在原问题中得到了这两个错误节点
 * 当然可以通过交换节点的方法让整棵树重新成为搜索二叉树
 * 但现在要求你不能这么做，而是在结构上完全交换两个节点的位置
 * 实现调整函数
 * 
 */

/**
 * 平面内有n个矩形，
 * 第i个矩形的左下角坐标为(x1[i],y1[i])
 * 右上角坐标为(x2[i],y2[i])
 * 如果两个或者多个矩形有公共区域则认为他们相互重叠
 * 不考虑边界和角落
 * 请计算出平面内重叠矩形数量最多的地方，
 * 有多少矩形重叠
 * 
 * 思路：
 * 二维空间的问题转换成一维的问题
 * 将矩形重叠问题转换成线段重叠问题
 * 先根据底边重叠情况找出高度上重叠最多的矩形
 * 然后拿到这些矩形的宽度开始结尾位置
 * 转换成线段重叠问题
 * 
 * 线段重叠问题处理思路：
 * 将线段按开始位置从小到大排列
 * 新建一个栈，用于存放当前重叠线段结束位置
 * 如果当前线段开始位置大于栈中结束位置，将这些结束位置从栈中移除
 * 操作过程中记录栈中数据达到的最大值的时候，就是线段重叠最多的情况
 * 
 * 高度重叠最多情况也可以使用相似思路
 * 
 */

const maxCoverCount = (x1,y1,x2,y2) => {
  const bottomLines = y1.slice().map((value, pos)=> ({
    value,
    pos 
  })).sort((a,b) => a.value - b.value);
  const heightStack = [];
  let currentMaxHeight = [];
  for(let i = 0;i< bottomLines.length; i++) {
    const { value: currentbottomLine, pos } = bottomLines[i];
    for(let j = 0;j < heightStack.length; j++) {
      const beforeTopline = y2[heightStack[j]];
      if(beforeTopline <= currentbottomLine) {
        heightStack.splice(j,1)
      }
    }
    heightStack.push(pos);
    if (heightStack.length >= currentMaxHeight.length) {
      currentMaxHeight = [...heightStack]
    }
  }
  const leftLines = currentMaxHeight.map(pos=> ({
    value: x1[pos],
    pos
  })).sort((a,b) => a.value - b.value);
  const widthStack = [];
  let currentMaxWidth = [];
  for(let k = 0; k<leftLines.length; k++) {
    const {value: currentLeft, pos} = leftLines[k];
    for(let l = 0; l < widthStack.length; l++) {
      const beforeRight = x2[widthStack[l]];
      if (beforeRight <= currentLeft) {
        widthStack.splice(l,1);
      }
    }
    widthStack.push(pos)
    if (widthStack.length >= currentMaxWidth.length) {
      currentMaxWidth = [...widthStack]
    }
  }
  return currentMaxWidth.length;
 }