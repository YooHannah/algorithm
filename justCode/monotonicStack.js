/**
 * 由一个代表题目，引出一种结构
 * 
 * 【题目】
 * 
 * 有一个整型数组arr和一个大小为w的窗口从数组的最左边滑到最右边，
 * 窗口每次向右边滑动一个位置
 * 
 * 例如，数组[4,3,5,4,3,3,6,7],窗口大小为3时：
 * [4,3,5],4,3,3,6,7 最大值5
 * 4,[3,5,4],3,3,6,7 最大值5
 * 4,3,[5,4,3],3,6,7 最大值5
 * 4,3,5,[4,3,3],6,7 最大值4
 * 4,3,5,4,[3,3,6],7 最大值6
 * 4,3,5,4,3,[3,6,7] 最大值7
 * 
 * 如果数组长度为n, 窗口大小为w,那么将会产生n-w+1个窗口的最大值
 * 实现函数，输入为整型数组，窗口大小为w
 * 输出长度n-w+1的数组res，res[i] 代表第i个窗口里面的最大值
 * 
 * 思路：
 * 借助下标数组pmax，该数组存放当前窗口内大于等于当前值的数的下标，按值从大到小排序
 * 比如原数组[4,7,8,1,4,3,2,5],
 * 当i = 0 时，pmax = [0] 窗口未形成
 * i = 1 时， pmax = [1], 7>4 窗口未形成
 * i = 2 时， pmax = [2], 8>7, 窗口形成
 * i = 3 时， pmax = [2,3]
 * i = 4 时， pmax = [2,4]
 * i = 5 时， pmax = [4,5]
 * 当pmax的第一个值超出窗口范围时，从pmax移除
 * 这样i所在的窗口的最大值就始终是pmax的第一个值
 */

 const getMaxWindow = (arr, w) => {
  if (!arr || !w || arr.length < w) {
    return null;
  }
  const windowMax = [];
  let index = 0;
  const pmax = [];
  for(let i = 0; i<arr.length; i++) {
    // 将pmax中存放的下标对应值比当前值小的下标清除
    while (pmax.length && arr[pmax[pmax.length -1]] < arr[i] ) {
      pmax.pop();
    }
    pmax.push(i);
    if (pmax[0] <= i - w) { // 超出窗口移除
      pmax.shift();
    }
    if(i >= w-1) {
      windowMax[index++] = arr[pmax[0]];
    }
  }
  return windowMax;
}


/**
 * 单调栈结构
 * 
 */
/**
 * 在数组中相找到一个数，左边和右边比这个数小，且离这个数最近的位置
 * 如果对每个数都像求这样的信息，能不能整体代价达到O(N)
 * 
 * 思路：
 * 借助下标数组pmin,存放比当前值小的值的下标，对应值从小到大，
 * 当碰到比pmin最后一个下标对应数值小的值时，对pmin进行弹出处理，
 * 此时pmin最后一个下标对应值，
 * 离它最近的左边比他小的最近值是pmin的倒数第二个值
 * 离它最近的右边比他小的最近值时当前值
 */

const getMinPos = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const pmin = [];
  const minPos = [];
  for(let i = 0; i < arr.length; i++) {
    while (pmin.length && arr[pmin[pmin.length -1]] > arr[i]) {
     const lastpos = pmin.pop();
     minPos.push({
       pos: lastpos,
       value: arr[lastpos],
       left: pmin.length > 1 ? pmin[pmin.length - 1] : -1,
       right: i
     });
    }
    pmin.push(i);
  }
  while(pmin.length) {
    const lastpos = pmin.pop();
    minPos.push({
      pos: lastpos,
      value: arr[lastpos],
      left: pmin.length ? pmin[pmin.length - 1] : -1,
      right: -1 // 后面没有比自己小的数，都比自己大
    });
  }
  return minPos
}

/**
 * 定义数组中累计和与最小值的乘积，叫做指标A，
 * 给定一个数组，请返回子数组中，指标A最大的值
 * 
 * 思路：
 * 首先明白子数组定义：一个或连续多个数组中的元素组成一个子数组(子数组最少包含一个元素)
 * 指标A 的获取就是当前元素作为子数组最小值，尽可能获取到左右两边比他大的值
 * 那么左右两边只要遇到比它小的值，再往当前值挪一位就是累计和最大的子数组的边界
 * 
 */

 const getMaxIndexA = arr => {
  if (!arr || !arr.length) {
    return null;
  }
  const posInfoList = getMinPos(arr);
  const IndexAList = [];
  posInfoList.forEach(item => {
    const { pos, left, right } = item;
    // 配合slice运算找到合适位置
    const start = left === -1 ? pos : left + 1;
    const end = right === -1 ? arr.length: right; 
    const list = arr.slice(start, end);
    const sum = list.reduce((prev,curr) => prev + curr, 0)
    const IndexA = sum * arr[pos];
    IndexAList.push(IndexA);
  })
  return IndexAList.sort((a,b)=> b-a)[0];;
}

/**
 * 【题目】
 * 给定一个有序数组arr,代表从左到右有N个点, arr[0], arr[1], ...arr[n-1]
 * 给定一个正数L, 代表一根长度为L的绳子，求绳子最多能覆盖几个点
 * 例如arr = [2,4,8,9,12,17], L = 5
 * L 右端端移动到2时， 能1个点 ：2
 * L 右端端移动到4时， 能覆盖2个点 : 2, 4
 * L 右端端移动到8时， 能覆盖2个点 : 4, 8
 * 
 * 思路一：
 * 让绳子右边界依次到达arr中每个点a，
 * 然后看绳子左边界指向的点b，arr中大于它的位于最左边的点c，
 * a在arr位置为i,c在arr位置为j, 那么右边界来到a位置能覆盖的点的个数就是i - j + 1;
 * 走完整个arr,看覆盖点的最大值
 * 
 * 思路二
 * 【滑动窗口】思想
 * 左右边界一上来指向arr上的点，然后右边界每次往右移动一个位置，
 * 直到移动到的点距离左边界大于绳子长度停止，
 * 计算此时绳子上覆盖的点数，记录在左边界当前指向的位置上
 * 然后左边界往右移动一个，右边界继续试探着前进
 * 同样尝试完所有点，再往记录里面找最大值
 * 
 * 相比思路一，思路二窗口一直是递增的状态，一直往右走，不用返回计算左侧的状态
 * 时间复杂度为O(N)
 */

 const maxCover = (arr, L) => {
  let left = arr[0];
  let right = arr[0];
  let rightPos = 0;
  let coverList = [];
  for (let i = 0; i< arr.length; i++) {
    left = arr[i];
    while(rightPos < arr.length && right - left <= L) {
      rightPos++;
      right = arr[rightPos];
    }
    coverList[i] = rightPos  - i ;
  }
  console.log(coverList);
  return coverList.sort((a,b) => b - a);
 }

/**
 * 现在有一个描述工作情况的池子，每项工作包括该工作需要的难度和报酬、
 * job: [{hard: 20, money: 15}]
 * 现在有N个人需要找工作，arr[i]代表第i个人的工作能力
 * 工作能力大于等于工作难度才可以胜任工作
 * 每个人要能拿到尽可能多的报酬
 * 请问这个N个人最终可以拿到的报酬可以是多少？
 * 
 * 输入job,arr，返回N个人最高报酬集合
 * 
 * 思路：
 * 对job进行按hard从小到大单调栈排序，hard相同的，money由大到小排序
 * 排完之后，
 * 相同hard里面去掉money少的job,仅剩money最多的job
 * 不同hard里面去掉后面的money比前面mone少的job
 * 然后arr[i] 在里面找 arr[i] >=hard的job即可
 */

const getMoneyjob = (jobList, arr) => {
  jobList.sort((item1,item2) => item1.hard - item2.hard);
  let jobLength = jobList.length;
  const tempobj = {};
  jobList.forEach(item => {
    const { hard } = item;
    if(!tempobj[hard]) {
      tempobj[hard] = []
    }
    tempobj[hard].push(item);
  });
  let keys = Object.keys(tempobj);
  keys.forEach(key=>{
    const list = tempobj[key];
    list.sort((job1,job2)=> job2.money -job1.money);
    tempobj[key] = list[0].money;
  })
  keys = keys.filter((key, index) => {
    if(index === 0 || index> 0 && tempobj[keys[index]] > tempobj[keys[index-1]]){
      return true;
    }
    return false
  }).sort((a,b)=> Number(b) - Number(a));
  const res = arr.map(ability => {
    const hard = keys.find(hard => hard <= ability);
    return tempobj[hard];
  })
  return res;
}

/**
 * 一个帖子最高分数定义为用户所有打分记录中，连续打分数据之和的最大值
 * 计算一个帖子曾经得到过的最高分数为多少
 * 例如，打分记录为：[1,1,-1,-10,11,4,-6,9,20,-10,-2]
 * 最高分为11 + 4 + (-6) + 9 + 20 = 38
 * 
 * 思路：
 * 相当于寻找数组中累计和最大且最长的子数组
 * 假设该子数组位于i-j这一段
 * 那么可以推断
 * i < curr < j ,i ~ curr这段和肯定大于0
 * curr < i -1, curr ~ i-1 这段和肯定小于0
 * 
 * 那么定义两个变量currSum 和maxSum
 * currSum是持续累加和
 * 如果maxSum小于currSum就把maxSum = currSum
 * 如果当前currSum小于0，就置为0，说明之前的累加和小于0，从现在开始重新累加
 * 如果不小，就保持不动
 */
const getMaxSum = arr => {
  let currSum = 0;
  let maxSum = 0;
  for(let i = 0; i < arr.length; i++) {
    currSum += arr[i];
    maxSum = Math.max(maxSum, currSum);
    if (currSum < 0) {
      currSum = 0
    }
  }
  return maxSum
}

/**
* 求最长递增子序列
* 
* 思路:
* 子序列可以不连续
*
* 方法1
* 申请一个相同长度的数组dp
* 数组dp中每个位置存放原序列arr中相同位置为结尾的最长子序列长度，
* 其中值最大的就是最长的长度
* 如何形成dp?
* 假如当前位置i,找到0 ~ i-1之间小于arr[i]的数的位置
* 对应的找到dp里面的值
* 看dp位置上谁的值最大，用哪个加1,就是dp[i] 位置上的值
* 
* 方法2s
* 准备一个数组ends
* ends 上的每个位置的值，表示当前位置i+1长度的子序列，最小的结尾值是多少
* 试图构造出单调性，遍历完所有的值，ends长度就是最大长度
* 如何形成ends?
* 每次遍历到一个arr的值arr[i]，二分查找的去看arr[i]在ends中所在的位置
* 如果arr[i]夹在ends[m]和ends[m+1]之间，
* 说明当以arr[i] 结尾的最长子序列应该包含ends[m]
* 所以arr[i]对应的最长子序列长度为m+1, 此时要把原来ends的m+1位置对应的值改成arr[i]
* 因为arr[i] < ends[m+1],长度为m+2的子序列中结尾值最小的变成arr[i]
*/ 

const maxlist1 = arr => {
  const { length } = arr;
  const dp = [1];
  let maxLength = 1;
  let maxPos = 0;
  for(let i = 1; i< length; i++) {
    const temp = [];
    for(let j = 0; j<i; j++) {
      if(arr[i] > arr[j]) {
        temp.push(dp[j])
      }
    }
    const max = temp.sort((a, b) => b-a)[0];
    dp[i] = temp.length ? max + 1 : 1;
    if(maxLength < dp[i]) {
      maxPos = i;
      maxLength = dp[i]
    } 
  }
  let childArr = [];
  while(maxPos >=0){
    childArr.push(arr[maxPos]);
    const newLength = --maxLength;
    maxPos = dp.findIndex(e=> e === newLength);
  }
  return childArr.reverse();
}

const maxlist2 = arr => {
  const { length } = arr;
  const ends = [arr[0]];
  const dp = [1];
  for( let i = 1; i<length;i++) {
    const curr = arr[i];
    const pos1 = ends.findIndex(((e, index) => e < curr && ends[index + 1] > curr));
    if(pos1 === -1) {
      if (curr > ends[ends.length -1]) {
        ends.push(curr);
        dp[i] = ends.length;
      } else {
        let k = ends.length - 1;
        while(k) {
          if(ends[k] > curr) {
            k--
          } else {
            break;
          }
        }
        if(!k && ends[0] > curr) {
          ends[0] = curr;
          console.log('fire', i)
          dp[i] = 1;
        } else {
          ends[i+1] = curr;
          dp[i] = i+2;
        }
      }
    } else {
      ends[pos1 + 1] = curr;
      dp[i] = pos1+2;
    }
  }

  const value = ends[ends.length -1];
  let maxPos = arr.findIndex(e => e === value);
  let maxLength = ends.length;
  let childArr = [];
  while(maxPos >=0){
    childArr.push(arr[maxPos]);
    const newLength = --maxLength;
    maxPos = dp.findIndex(e=> e === newLength);
  }
  return childArr.reverse();
}

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
 *  [10,13,2],
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
 *  <7: 10>
 * 
 * }
 * 那么最终返回的结果就是
 * [
 * [1,2,4],
 * [2,4,8],
 * [4,6,5],
 * [6,7,10],
 * ]
 * 
 * 其实map2存放的是当前坐标所处的最大高度
 */

const getBuildingLine = matrix => {
  const list = matrix.map(item => {
    const [left, right, height] = item;
    return [
      [left,'up', height],
      [right, 'down', height]
    ]
  })
  .reduce((curr,prev) => [...curr, ...prev], [])
  .sort((a,b) => {
    const [pos1,flag1,height1] = a;
    const [pos2,flag2,height2] = b;
    if (pos1 === pos2) {
      if (flag2 === 'up') {
        return -1
      } else {
        return 1
      }
    } else {
      return pos1 - pos2
    }
  });
  const map1 = {};
  const map2 = {};
  let currMaxHeight = -1;
  list.forEach(item => {
    const [pos, flag, height] = item;
    if (!map1[height]) {
      map1[height] = 0;
    }
    if (flag === 'down') {
      map1[height]--
    } else {
      map1[height]++;
    }
    const max = Object.keys(map1).filter(key=>map1[key]).sort((a,b)=> b-a )[0];
    map2[pos]=max;
  })
 const lines = [];
 const poslist = Object.keys(map2);
 for(let i = 0; i< poslist.length;i++) {
  const height = map2[poslist[i]];
  if (!height ||  map1[height] > i) {
    continue;
  }
  let j = -1;
  for(j = i+1; j< poslist.length;j++) {
    if (map2[poslist[j]] != height) {
      break;
    }
  }
  map1[height] = j;
  lines.push([poslist[i],poslist[j],height]);
 }
 return lines
}

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

/**
 * 给定一个均为正数无序的数组arr,求数组中所有子数组中相加和为 K 的最长子数组长度
 * 要求时间复杂度O(N),时间复杂度O(1)
 * 
 * 例arr = [1,2,1,1,1] k = 3 
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

const findMaxPartSumK = (arr, k) => {
  let L = 0;
  let R = 0;
  let sum = arr[0];
  const box = [];
  const length = arr.length;
  while(L < length && R <length) {
    if (sum < k) {
     sum +=arr[++R];
    } else if(sum === k) {
     box.push(R-L+1);
     sum +=arr[++R];
    } else {
     sum -=arr[L];
     ++L;
    }
  }
  return box.sort((a,b)=>b-a)[0]
}

/**
 * 给定一个正负0都包含的无序数组,
 * 求数组中所有子数组中相加和小于等于 K 的最长子数组长度
 * 
 * 例如arr = [3,-2,-4,0,6],K =2;
 * 相加小于等于2的最长子数组为[3,-2,-4,0],长度为4故返回4
 * 
 * 方法论：可能性舍弃
 * 
 * 思路
 * 先从后往前计算一下累计和，如果之前计算的大于0，不累加
 * arr2 =  [-3,-6,-4,0,6]
 * 对应计算的右边界为
 * arr3 = [2,2,2,3,4]
 * arr2就代表从当前位置往右累计能达到的最小累计和
 * 现在对arr2进行处理，从0位置开始累计到其右边界位置的数如果满足条件
 * 则继续往下扩到下一块的右边界，直到不符合条件，此时满足条件的右边界是k
 * 此时记录最大长度
 * 然后依次计算，起始位置i从1，2,3...k开始计算到k是否满足条件，满足往下扩，
 * 不满足起始位置加1
 * 这样相当于计算i到k这段是否有满足提交的能够继续往k之后的为扩
 * 忽略掉i-k之间满足条件的长度，因为已经找到0-k这个大的长度
 * 
 */
const findMaxPartSumk = (arr, k) => {
  const lastPos = arr.length -1;
  const tempList = [arr[lastPos]];
  const tempPosList = [lastPos];
  for(let i = lastPos -1; i>=0; i--) {
    const curr = arr[i];
    const beforeSmall =  tempList[0] < 0;
    const sum = beforeSmall ? tempList[0] + curr : curr;
    tempList.unshift(sum)
    const pos = beforeSmall ? tempPosList[0] : i;
    tempPosList.unshift(pos)
  }
  let sum = 0;
  let len = 0;
  let end = 0;
  // i是窗口最左位置，end是出口最右位置的下一个位置(终止位置)
  for(let i = 0; i<arr.length; i++){
    /**
     * 从i开始往右扩的尝试
     * 以右边界为跳跃距离，
     * 这一块满足就尝试到下一块边界
     */
    while(end < arr.length && sum + tempList[end] <=k) {
      sum += tempList[end];
      end = tempPosList[end]+1
    }
     /**
     * while 循环结束后
     *  如果以i开头的情况下
     *  累加和<=k的最长子数组是arr[i...end-1],看这个长度能不能更新len
     *  如果以i开头情况下
     *  累加和<=k的最长子数组比arr[i...end-1]短，更新都不会影响len代表的值
     */
    len = Math.max(len, end - i);
    if (end > i) {
      sum -=arr[i]
    } else {
      end = i+1
    }
  }
  return len
}
