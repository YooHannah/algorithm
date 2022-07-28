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

const findMaxMin = arr => {
  let max = Number.MIN_SAFE_INTEGER;
  let min = Number.MAX_VALUE;
  arr.forEach(e=> {
    max = Math.max(e, max);
    min = Math.min(e, min);
  })
  return [max, min];
}
const findMaxDistance = arr => {
  const [max, min] = findMaxMin(arr);
  const length = max - min + 1;
  const space = Math.floor(length / 10);
  const bottle = [];
  for(let i = 1; i < 11; i++) {
    bottle[i-1] = [];
  }
  const firstEnd = min + space - 1;
  for(let j = 0; j< arr.length; j++) {
    const curr = arr[j];
    let bottleMaxValue = firstEnd;
    let pos = 0;
    while(bottleMaxValue < curr) {
      bottleMaxValue += space;
      pos++;
    }
    bottle[pos].push(curr);
  }
  const validBottle = bottle.filter(item => item.length);
  const maxMin = validBottle.map(list => findMaxMin(list))
  const diffValue = [];
  for(let m = 0; m < maxMin.length; m++) {
    const [max, min] = maxMin[m];
    diffValue.push(max - min);
    if (m < maxMin.length -1) {
      const [nextMax, nextMIn] = maxMin[m + 1];
      diffValue.push(nextMIn - max);
    }
  }
  return findMaxMin(diffValue)[0];
}
/**
 * 给出n个数字，问最多有多少不重叠的非空区间，使得每个区间内数字的xor都等于0
 * 
 * 思路：
 * 假设答案法
 * 准备一个容器dp，每个位置存放从0到当前位置i的符合要求的空间个数
 * 即，dp[i] 是0-i范围内不重叠区间，且每个区间xor等于0的区间个数
 * 同时准备一个映射表map，
 * key表示遍历过程中xor出现的结果，
 * value 表示这个结果最近出现的位置
 * 先初始化一个数组{0： -1}，表示一开异或和结果是0的位置在-1，还没开始遍历数组
 * 准备一个变量eor，存放遍历到当前值和之前所有值的异或结果
 * 当遍历到i的时候
 * 如果0-i有最优划分，i肯定位于划分的空间的最后一个
 * 
 * 假如i所在的空间异或和不是0，
 * 说明i所在的空间不会计入dp[i]的个数，
 * 此时dp[i] 的值，跟是否有i位置的值无关，那么dp[i] = dp[i-1]
 * 
 * 假如i所在空间异或和是0，那么空间开始的位置到i位置异或和为0
 * 空间开始的位置应该是上一次出现相同xor位置的下一个位置
 * 从map表中找到上一次出现xor所在的位置pre，
 * 也就是说0-pre异或和是xor， 0-i异或和也是xor
 * 那么pre+1到i的异或和只能是0
 * 符合要求的区间增加1
 * dp[i] = dp[pre] + 1,
 * 
 * 比较两种可能性的大小取最大值，就是dp[i]最终的值
 * 遍历到最后一个值，dp[arr.length -1] 就是答案
 */

const finsMaxXorSpace = arr => {
  let xor = 0;
  let dp = [];
  let map = { 0: -1 };
  for(let i = 0; i<arr.length; i++) {
    xor ^= arr[i];
    // 最优解有i位置数据
    if(map[xor]) { // 可以从前面的位置中找一个位置到i异或和为0
      const pre = map[xor];
      dp[i] = pre === -1 ? 1 : dp[pre] +1;
    } else { // 找不到，空间个数为0
      dp[i] = 0;
    }
    if (i > 0) { // dp[i-1] 0-i范围内，满足的空间没有i位置数据
      dp[i] = Math.max(dp[i-1], dp[i])
    } 
    map[xor] = i;
  }
  return dp[dp.length -1]
}

/**
 * 
 * 给定两个有序数组A和B，长度分别是m和n
 * 求A和B中最大的第K个数字
 * 要求使用尽量少的比较次数
 * 
 * 思路：
 * 
 * 算法原型： 
 * 求两个长度相同的排序好的数组合并和后的上中位数
 * 原理：子数组的上中位数就是整个数组的上中位数
 * 
 * 上中位数的概念 : 长度为偶数的数组中，中位数有两个，位置靠前的那个叫上中位数、
 * 例如： 1,2,3,4,5,6,7,8,上中位数是4
 * 
 * 假如两个长度一样的数组arr1和arr2长度是偶数m
 * 可以先找到各自的上中位数m1,m2
 * 假如m1 === m2,那么合并后上中位数就是m1
 * 假如m1 > m2,
 * 说明arr1的[m/2 ... m-1]和arr2的[0 ...m/2-1]的两段内不可能存在上中位数
 * 继续递归arr1的[0 ...m/2-1] 和arr2 的[m/2 ... m-1]] 这两段找这两段的中位数
 * 这两段的中位数就是整体合并后中位数
 * 例如m = 4
 * arr1[1] > arr2[1]
 * a1 = [arr1[0], arr1[1]], a2 = [arr2[2], arr2[3]]
 *
 * 如果a1[0] == a2[0] ,此时进行递归的a1和a2的上中位数就是a1[0],也就是 arr1[0] 或者arr2[2]
 * 最后排序是arr2[1] < arr1[0] == arr2[2]
 * 原来arr2[2]前面会有arr1[0],arr2[0-1],arr2[2]此时成为合并后大数组上中位数
 * 大数组中位数也是arr2[1]
 * 
 * 如果a1[0] > a2[0],继续递归[a1[0]], [a2[1]]的上中位数
 * 二者谁小谁是中位数，一样大的话就是任意一个值，
 * 返回的结果放在a1和a2的结果中
 * 就是
 * a1[0] <= a2[1] =====> a2[0] < a1[0] <= a2[1], a1[1] 或者
 * a1[0] >= a2[1] =====> a2[0] < a2[1] <= a1[0] < a1[1]
 * 对应到arr1和arr2
 * 这样上中位就是arr2[3] 或者arr1[0]，往回推
 * arr1和arr2合并后的上中位数就是arr2[3] 或者arr1[0]
 * 
 * 但如果是长度一样的奇数长度的数组arr1和arr2,长度为m
 * 得到中位数pos= (m-1)/2,m1和m2
 * 如果m1 === m2,同样上中位数就是m1或者m2这个数
 * 如果m1 > m2,此时arr1[0...pos-1] 和arr2[pos, m-1]的长度不一致
 * 需要手动判断一下arr2[pos]的情况
 * 如果arr2[pos] >= arr1[pos-1]
 * 那么就会形成arr1[0...pos-1], arr2[0...pos-1] < arr2[pos] <arr1[pos]
 * arr2[pos]就是最后的上中位数
 * 但是如果arr2[pos] < arr1[pos-1]，就可以去掉arr2[pos]这个位置的数
 * 让arr1[0...pos-1]和arr2[pos+1, m2-1] 继续递归起来
 * 
 * 回到本题目中
 * 求最大的第k个数，通过排除掉不可能是第k个数的情况，在剩下的数据里面找中位数就是第K个数
 * 问题是m和n的长度可能不一致
 * 这时需要根据k值和m,n m+n的大小关系进行不同的处理，
 * 成为相同长度的数组，使用上面求中位数的递归过程
 * 假如m<n
 * 
 * 1. 如果 1<k<m， 那么找arr1[0...k-1] 和arr2[0,k-1]的上中位数即可
 * 
 * 2. 如果 m<k<n, 
 * arr1上面所有数都有可能是第k个数
 * arr2上面arr2[0...k-m-2] 和arr2[k...n-1]两段不可能是第k个值
 * 现在需要从arr1 上和arr2[k-m-1,...k-1]范围上找上中位数
 * arr1长长度为m, arr2这段长度为k-1 - (k-m-1)+1 = m+1
 * 比arr1多一个，单独摘出来arr[k-m-1]和arr[m-1] 比较
 * 如果arr[k-m-1] >=arr[m-1那他就是第K个值
 * 如果arr[k-m-1] <arr[m-1] 那就按把它划入不可能范围
 * 从arr1 和arr[k-m, ...k-1] 里面找上中位数
 * (k-m -1) - 0 +1 + m = k
 * 3. 如果 n<k < m+n
 * arr1上[0...k-n-2]上的值，不可能是第K个值
 * arr2上[0...k-m-2]上的值，不可能是第K个值
 * 剩下的arr1[k-n-1...m-1]上的值，和arr2[k-m-1,...n-1]的值中求上中位数
 * 现在剪掉k-n-2 -0 + 1 + k-m-2-0+1=2k -m -n -2 = part1
 * 剩下，m + n - part1 = 2(m+n+1-k) 上中位数位置在m+n-k = part2
 * part1 + part2 + 1 = k-1， 只能找到第k-1个数
 * 通过判断arr1[k-n+1] 和arr2[k-m+1]是否是第K个值情况往part1里面增加一个数
 * 如果arr1[k-n+1] >= arr2[n-1],那么把arr1[k-n+1] 就是第K个数
 * 如果arr1[k-m+1] >= arr2[m-1],那么把arr1[k-m+1] 就是第K个数
 * 如果arr1[k-n+1]<arr2[n-1],那么把arr1[k-n+1] 划入到part1
 * 如果arr2[k-m+1]<arr1[m-1],划到part1，
 * 参与接下来的找上中位数过程
 * part1 + 2 + m+n-k= k
 */
const  getUpMedium = (arr1, arr2) => {
  const length = arr1.length;
  const odd = !(length % 2);
  if (length === 1) {
    return Math.min(arr1[0], arr2[0]);
  }
  if (odd) {
    const pos = length / 2 - 1;
    if (arr1[pos] === arr2[pos]) {
      return arr1[pos];
    } else if (arr1[pos] > arr2[pos]) {
      return getUpMedium(arr1.slice(0,pos+1), arr2.slice(pos+1))
    } else {
      return getUpMedium(arr2.slice(0,pos+1), arr1.slice(pos+1))
    }
  } else {
    const pos = (length - 1)/2;
    if (arr1[pos] === arr2[pos]) {
      return arr1[pos];
    } else if(arr1[pos] > arr2[pos]) {
      if (arr2[pos] >= arr1[pos-1]) {
        return arr2[pos];
      } else {
        return getUpMedium(arr1.slice(0,pos), arr2(pos+1))
      }
    } else {
      if (arr1[pos] >= arr2[pos-1]) {
        return arr1[pos];
      } else {
        return getUpMedium(arr1.slice(pos+1), arr2.slice(0,pos))
      }
    }
  }
}
const findKthNum = (list1, list2, k) => {
  const length1 = list1.length;
  const length2 = list2.length;
  const arr1 = length1 < length2 ? list1 : list2;
  const arr2 = length1 < length2 ? list2 : list1;
  const m = arr1.length;
  const n = arr2.length;
  let upMedium = -1;
  if (1<=k && k<=m) {
    upMedium = getUpMedium(arr1.slice(0,k),arr2.slice(0,k));
  } else if(m<k && k<n) {
    const start = k-m-1;
    const end = k-1;
    const flag = arr2[start];
    if (flag > arr1[m-1]) {
      upMedium = flag;
    } else {
      upMedium = getUpMedium(arr1, arr2.slice(k-m,k));
    }
  } else if(n<=k && k <= m+n){
    const start1 = k-n - 1;
    const end1 = m-1;
    const start2 = k-m - 1;
    const end2 = n-1;
    if (arr1[start1] > arr2[end2]) {
      upMedium = arr1[start1]
    } else if (arr2[start2] > arr1[end1]) {
      upMedium = arr2[start2]
    } else {
      upMedium = getUpMedium(arr1.slice(start1+1), arr2.slice(start2+1))
    }
  }
  console.log('upMedium', upMedium);
}


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
 * 方法论： 动态规划里面的斜率优化
 * 思路： 
 * 先实现约瑟夫杀人问题
 * 依赖剃刀函数 y = x % i
 * i是个固定值
 * 图像会是这样
 * |
 * |
 * |  /    /    /
 * | /    /    /
 * |/____/____/___________
 * 
 * 约瑟夫杀人问题每次数人的个数一致，假设为m
 * 杀到最后一个人的时候那个人当前轮的编号固定是1，
 * 如果有可以从最后一个人往前推原始编号的函数，那么一次往前推即可
 * 
 * y = f(len,x)
 * i表示该轮人数，x表示下一轮即人数为len-1时，最后那个人的该轮编号
 * y就是人数为len时最后一个人对应的结点编号
 * m会在该函数中用于数数
 * 
 * 例如y = f(2, 1)
 * y表示剩两个人时，最后那个人在这一轮里面的编号是几
 * 
 * 求该关系前，先看一下每一轮里面人的位置和数数编号的关系
 * 人位置从1-n,人数为len,循环数
 * 1-n 对应的编号关系就是1，2,3,...m,1,2,3,...m
 * 类似于剃刀函数，参考剃刀函数
 * 可以得到每个人位置=(当前轮的编号 - 1) % len + 1
 * 比如1个人该轮数数编号是k,那他的位置就是（k-1）%n + 1
 * 
 * 在看一下杀完一次人之后，新老编号的对应关系
 * 假设原来编号
 * 1,2,3,4,5,6,7, 3号被杀，那么下一轮编号变成
 * 5,6,-,1,2,3,4
 * 即1对应5,2对应6,4对应1,5对应2,6对应3,7对应4
 * 再联系剃刀函数
 * 可以得到式子1：
 * 老编号= （(新编号-1）+ 被杀被杀编号S（这里是3）) %len + 1
 * len表示老编号对应轮的长度
 * 
 * 根据上面编号和位置关系
 * 位置=(当前轮的编号 - 1) % n + 1
 * 现在计算当前轮数到m对应的1-n中的位置
 * 也就是是报数为m的那个人，也就是该轮要被杀的人
 * 带进去算出来的结果就是这个人在1-n中的位置x
 * 这个位置x就是老编号里面被杀人的位置，也就是s
 * s = (m -1) %len + 1,
 * 数到m就杀人
 * 
 * 代入式子1：
 * 老编号 = (新编号 + （m-1）%len)%len + 1;，继续化简
 * 老编号 = (新编号 + m-1)%len + 1;
 * 
 * 
 * 回到本题，相当于每轮在数的m的值在变
 * 
 */

 // 约瑟夫杀人长度为i个人，数到m就杀人，最终活下来的是几

 const getLive = (i, m) => {
   if(i === 1) {
    return 1;
   }
   return (getLive(i-1, m) + m -1)%i + 1;
 }

 // 公司招聘
 const nextIndex = (size, index) => index == size -1 ? 0 : index + 1;
 const no = (n, arr, index) => {
   if(n == 1) {
     return 1
   }
   // 老 = （新 + m -1）% i + 1
   return (no(n-1, arr, nextIndex(arr.length, index)) + arr[index] -1 ) % n + 1
 }
 // 0到n-1个人依次循环取用arr中数字杀n-1轮，返回的活的人编号
 const getLive = (n, arr) => no(n, arr, 0)

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

/**
 * 给定一个非负数组，每个位置上代表有几枚铜板
 * a先手b后手，每次都可以拿任意数量铜板，但是不能不拿
 * 谁最先把铜板拿完谁赢，
 * 返回获胜者名字
 * 
 * 方法论： Nim 博弈论问题
 * 思路：
 * 数组所有数据异或和（所有数据无进位相加）为0，则后手肯定赢
 * 否则先手赢
 * 先手赢的操作就是每次拿完铜板，让后手面对的数组，异或和为0
 * 
 */

const getWinner = arr => {
  const xor = arr.reduce((curr,prev)=> curr ^ prev, 0);
  return xor ? '先手赢' : '后手赢'
}


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
  * 小范围内做贪心
  * 
  * 先将所有人体重由大到小排序 找到小于等于limt/2的数的最右位置pos
  * 从pos和pos+1两个位置开始加和是否小于等于limit
  * 满足的话船数加1， 指向pos+1位置的数右移，直到大于limit，记录经过的数据个数count
  * 表示pos - count ...pos, pos+1,...pos+count +1,可以两两组合做一条船，需要count条
  * 不满足的话，
  * 如果大于limit,pos位置左移，直到找到符合相加小于等于limit的，记录经过的数据个数m,
  * 这m个数表示无法跟pos+1以后的数据同乘一条船
  * 再重复符合条件的步骤，累计count
  * 
  * 如果pos左移到0，还是满足不了pos+1以后的数据同乘一条船，那么剩下的pos+1以后的数据，
  * 就得每个人自己乘一条船，假设剩下n
  * 
  * 需要船数 = 满足两人一条船的情况count + m /2 + n
  * 
  */

 const needBoat = (arr, limit) => {
  const list = arr.sort((a,b)=> a-b);
  const len = list.length;
  const mid =  limit/2;
  let left = list.findLastIndex(e=> e <= mid);
  console.log('dddd', list, mid, left)
  let right = left + 1;
  let count = 0;
  let rightRest = 0;
  let leftRest = 0;
  while(left >= 0 && right<len) {
    let rightMove = 0;
    while(right<len && rightMove <left+1 && list[left] + list[right] <= limit) {
      rightMove++;
      right++
    }
    count +=rightMove;
    left -= rightMove;
    let leftMove = 0;
    while(left>=0 && list[left] + list[right] > limit) {
      leftMove++;
      left--
    }
    leftRest +=leftMove;
  }
  leftRest = leftRest + left + 1;
  rightRest = len - right;
  return count + Math.ceil(leftRest/2) + rightRest
}

/**
 * 给定两字符串str1和str2,求两个字符串的最长公共子串
 * 动态规划空间压缩应用
 * 
 * 思路：
 * 子串必须连续
 * 想想dp是一张str1.length * str2.length的表
 * dp[i][j]表示str1以str1[i]结尾，str2以str2[j]结尾时，最长公共子串长度
 * 整张表的最大值就是答案
 * 
 * 对于第一行第一列来说，str1[i]，str2[j]相等dp[i][j]就是1，不等dp[i][j]就是0
 * 其他位置上不等dp[i][j]肯定是0
 * 相等的位置上，等于左上角的值 + 1，dp[i-1][j-1]保障str1和str2都往前移一个的效果
 * 因为dp[i][j] 位置上两个 字符相同，所以就看前面的字符相同的长度是多少
 * 所以 dp[i][j] = dp[i-1][j-1] +1
 *  这样整张表就可算出来，然后找最大值
 * 
 * 优化：
 * 因为第一行的值可以确定，dp[0][str2.length -1], dp[0][str2.length -2]，...dp[0][0]
 * 那么根据dp[i][j] = dp[i-1][j-1] +1
 * 利用dp[0][str2.length -2]就可以算出dp[1][str2.length -1],
 * 利用dp[0][str2.length -3]就可以算出dp[1][str2.length -2]， dp[2][str2.length -1]
 * 以此类推，按从左上到右下方向的对角线可以一次计算出表中每个值
 * 我们在计算过程中只要存折最大值即可，其他值不用存
 * 所以就可以实现一个变量代替一张表的效果
 * 
 * 
 * 
 */
// 实现1
 const getMaxChild = (str1, str2) => {
   const len1 = str1.length;
   const len2 = str2.length;
   let maxLen = -1;
   for (let i = len2 -1; i>=0; i--) {
      let currentValue =  str1[0] === str2[i] ? 1 : 0;
      maxLen = Math.max(maxLen, currentValue);
      const count = len2 -1 -i;
      for(let j = 1; j<=count && j<len1;j++){
        currentValue = str1[j] === str2[i+j]  ? currentValue + 1 : 0;
        maxLen = Math.max(maxLen, currentValue);
      }
   }

   for (let m = 1; m<len1; m++) {
    let currentValue =  str1[m] === str2[0] ? 1 : 0;
    maxLen = Math.max(maxLen, currentValue);
    const count = len1 -1 -m;
    for(let n = 1; n<= count && n< len2; n++){
      currentValue = str1[m+n] === str2[n]  ? currentValue + 1 : 0;
      maxLen = Math.max(maxLen, currentValue);
    }
   }
   return maxLen;
 }

// 实现2

const getMaxChild = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  let max = -1;
  let row = 0;
  let col = len2 - 1;
  let end = 0;
  while(row < len1) {
    let i = row;
    let j = col;
    let len = 0;
    while(i<len1 && j <len2) {
      if (str1[i] === str2[j]) {
        len++;
      } else {
        len = 0;
      }
      if(len > max) {
        end = i;
        max = len;
      }
      i++;
      j++;
    }
    if (col > 0) {
      col--
    } else {
      row++
    }
  }
  console.log(end,max)
  return str1.substring(end - max +1, end +1) // 返回最长子串
}

 /**
 * 给定两字符串str1和str2,求两个字符串的最长公共子序列
 * 动态规划空间压缩应用
 * 
 * 思路：
 * 公共子序列可以不连续
 * dp[i][j]表示str1以str1[i]结尾，str2以str2[j]结尾时，最长公共子序列长度
 * dp[i][j]的值来自一下四种可能性
 * 子序列
 * 1.既不以str1[i]也不以str2[j]，这种情况dp[i][j] = dp[i-1][j-1]
 * 2.以str1[i]但不以str2[j]，这种情况dp[i][j] = dp[i][j-1]
 * 3.不以str1[i]但以str2[j]，这种情况dp[i][j] = dp[i-1][j]
 * 4.既以str1[i]也以str2[j]，即str1[i] == str2[j]，这种情况dp[i][j] = dp[i-1][j-1] + 1
 * 
 * 四种可能性最大值就是dp[i][j]的值
 * 观察可发现每个格子会依赖自己左边，左上，和正上方的格子
 * 
 * 对于第一行第一列来说，str1[i]，str2[j]相等dp[i][j]就是1，不等dp[i][j]就是0
 * 剩下的每个格子，从dp[1][1]开始就都可以算出值
 * 在填表过成中可以寻找最大值
 * 
 */

const getMAXChildSorted = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = (new Array(len1).fill(null)).map(e => (new Array(len2).fill(0)));
  let row = 0;
  let max = 0
  while(row < len1) {
    let col = 0
    while(col<len2){
      const same = str1[row] === str2[col];
      if(col > 0 && row > 0) {
        dp[row][col] = Math.max(
          dp[row-1][col],
          dp[row][col-1],
          same ? dp[row-1][col-1] + 1 : dp[row-1][col-1]
        )
      } else {
        dp[row][col] = Number(same);
      }
      max = Math.max(max, dp[row][col])
      col++
    }
    row++
  }
  return max
 }

// 在范围上尝试模型，进行可能性分析

/**
 * 给定一个字符串str,求最长回文子序列，注意区分子序列和子串的不同
 * 
 * 思路：
 * 计算str[i,...j]范围内最长回文子序列
 * dp[i][j] 就表示str[i,...j]范围内最长回文子序列
 * dp[len-1][len-1]就是答案
 * dp会是一个len * len 的二维表，且对角线右上有效，左下角无效
 * 因为左下角i<j
 * 
 * basic场景
 * dp[i][i] = 1;
 * dp[i][i+1] = str[i] === str[i+1] ? 2: 1;
 * 
 * 其他dp[i][j] 最长回文子序列按可能性分析可能会有以下几种情况
 * 
 * 1. 以i开头，不以j结尾 dp[i][j] = dp[i][j-1]
 * 2. 不以i开头，以j结尾 dp[i][j] = dp[i+1][j]
 * 3. 不以i开头，不以j结尾 dp[i][j] = dp[i+1][j-1]
 * 4. 以i开头，以j结尾, 说明str[i] === str[j], dp[i][j] = dp[i+1][j-1] + 2;
 * 
 * 以上四种情况取最大值
 * 
 * dp[i][j]依赖左，左下，下三个值，表从右下开始填
 * 
 */

const getMaxHuiWen = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 1;
    dp[i][i+1] = str[i] === str[i+1] ? 2: 1;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = Math.max(
        dp[row][col -1],
        dp[row+1][col],
        str[row] === str[col] ? dp[row+1][col-1] + 2 :  dp[row+1][col-1]
      )
      col++
    }
    row--;
    col = row + 2;
  }
  console.log(dp)
  return dp[0][len-1]
}


/**
 * 给定一个字符串，可以在str任意位置添加字符使原字符变成回文字符串
 * 求需要添加最少字符数时生成的回文字符串
 * 
 * * 思路：
 * 计算str[i,...j]范围内至少添加的个数
 * dp[i][j] 就表示str[i,...j]范围内至少添加的个数
 * dp[len-1][len-1]就是答案
 * dp会是一个len * len 的二维表，且对角线右上有效，左下角无效
 * 因为左下角i<j
 * 
 * basic场景
 * dp[i][i] = 0;
 * dp[i][i+1] = str[i] === str[i+1] ? 0: 1;
 * 
 * 其他dp[i][j] 至少添加的个数按可能性分析可能会有以下几种情况
 * 
 * 1. str[i] != str[j] ,先把[i,...j-1] 范围上整成回文，最后加1把str[j] 加在开头 
 *    dp[i][j] = dp[i][j-1] + 1
 * 2. str[i] != str[j] ,先把[i+1,...j] 范围上整成回文，最后加1把str[i] 加在结尾 
 *    dp[i][j] = dp[i+1][j] + 1
 * 3. str[i] == str[j] ,先把[i+1,...j-1] 范围上整成回文 
 *    dp[i][j] = dp[i+1][j-1]
 * 
 * 以上情况取最小值
 * 
 */
const getMaxHuiWen = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 0;
    dp[i][i+1] = str[i] === str[i+1] ? 0 : 1;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = Math.min(
        dp[row][col -1] + 1,
        dp[row+1][col] + 1,
        str[row] === str[col] ? dp[row+1][col-1] : Number.MAX_VALUE
      )
      col++
    }
    row--;
    col = row + 2;
  }
  console.log(dp)
  return dp[0][len-1]
}

/**
 * 给定一个字符串str,通过去除字符串中的字符，使原字符串变成回文字符串
 * 请问有多少种不同的方案？
 * 如果移除的字符组成的序列不一样，归为不同的方案
 * 
 * 思路：
 * 范围内尝试
 * dp[i][j] 表示str[i...j] 范围内去除的方案数dp[0][str.len-1]就是答案
 * 
 * 对于str[i..j] 形成的回文字符串可以从以下几种情况分析
 * 
 * 1. 不以i开头，不以j结尾
 * 2. 不以i开头，以j结尾 
 * 3. 以i开头，不以j结尾
 * 4. 以i开头，以j结尾
 * 
 * 方案互斥数之和就是答案
 * 
 * dp[i][j -1] 包括1,3两种情况
 * dp[i+1][j] 包括1，2 两种情况
 * 
 * dp[i][j -1] + dp[i+1][j] - dp[i+1][j-1] 就是1,2,3情况之和
 * 
 * 第四情况说明str[i] === str[j], 
 * 把二者单独拿出来就可以组成一种方案
 * 剩下就是 dp[i+1][j-1]
 * 第四种情况的方案数就是dp[i+1][j-1] + 1
 * 
 * 加起来就是 dp[i][j -1] + dp[i+1][j] + 1
 * 
 * basic场景
 * dp[i][i] = 1;
 * dp[i][i+1] = str[i] === str[i+1] ? 3: 2;
 * 
 * 
 */

const getChangeHuiWenWays = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = 1;
    dp[i][i+1] = str[i] === str[i+1] ? 3 : 2;
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = str[row] === str[col] ? dp[row][col -1] + dp[row+1][col] + 1 : dp[row][col -1] + dp[row+1][col] - dp[row+1][col -1]
      col++
    }
    row--;
    col = row + 2;
  }
  return dp[0][len-1]
}

/**
 * 给定一个字符串str,返回把str全部切成回文子串的最小分割数
 * 例如：
 * aba 本身就是回文，不用切割返回0
 * acdcdcdad, 切两次变成3个回文子串， a , cdcdc, dad
 * 
 * 思路：
 * 从左往右尝试，[i...len-1]找最小值
 * 判断str[0,,,,i]是否是回文，
 * 
 * 是的话，把0-i当做分割的第一部分，
 * 计算剩下的str[i+1, ..len-1] 最小分割数然后+1 
 * 每轮结果跟当前最小值比较更新最小值
 * 
 * 不是的话，不参数比较，不符合切割要求
 * 
 * 优化，预处理字符串，获取0-i的字符串是否是回文字符串，
 * 将判断过程转为查表过程
 * 
 * dp[i] 表示从i到len -1 的 最小分割数,切几刀
 * 答案是dp[0]
 * 
 */

const getRecord = str => {
  const len = str.length;
  const dp = (new Array(len).fill(null)).map(e => (new Array(len).fill(0)));
  for(let i = 0; i<len; i++) {
    dp[i][i] = true;
    if(i<len -1) {
      dp[i][i+1] = str[i] === str[i+1];
    }
  }
  let row = len - 3;
  let col = len - 1;
  while(row >=0) {
    while(col <= len -1) {
      dp[row][col] = str[row] === str[col] && dp[row+1][col-1]
      col++
    }
    row--;
    col = row + 2;
  }
  return dp
}
const findMinCut = str => {
  const len = str.length;
  const record = getRecord(str);
  const dp = new Array(len + 1).fill(0);
  dp[len] = -1;
  dp[len - 1] = 0;
  dp[len - 2] = str[len - 1] === str[len-2] ? 0 : 1;
  for(let i = len - 3; i>=0; i--) {
    dp[i] = len - i;
    for(let j = i;j<len;j++) {
      if (record[i][j]) {
        dp[i] = Math.min(dp[i], dp[j + 1] + 1);
      }
    }
  }
  console.log(dp)
  return dp[0]
}


 /***0611 */

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

  // 方法一
  /**
   * pre, 裂开的前一个部分
   * rest, 还剩多少值需要裂开，要求列出来的第一部分不能比pre小
   * 返回裂开方法数
   */
  const process = (pre, rest) => {
    if (rest === 0) {
      return 1; // 之前裂开的方案，构成了1中方法
    };

    if (rest < pre) {
      return 0
    }
    let ways = 0
    for(let i = pre; i<rest; i++) {
      ways +=process(i, rest - i);
    }
    return ways;
  }
  const ways1 = n => {
    if(n<1) {
      return 0;
    }
    return process(1, n);
  }
  
  // 方法二
  // 斜率优化: 当前格子值需要枚举行为时，自己附近几个格子的值能否代表枚举行为
  const ways2 = n => {
    if (n < 1) {
      return n
    }
    const dp = (new Array(n + 1).fill(null)).map(e => (new Array(n + 1).fill(0)));
    for(let pre = 1; pre<n+1;pre++) {
      dp[pre][0] = 1; // 第一列，rest = 0; 算一种方法
      dp[pre][pre] = 1; // 对角线上pre=== rest, 裂开方式就是当前rest他自己，1中方法
    }
    for(let pre = n - 1; pre>0; pre--) {
      for(let rest = pre + 1; rest <= n; rest++) {
        // 暴力递归转换后进行斜率优化
        // dp[pre + 1][rest] 代表了除 dp[pre][rest - pre] 以外其他枚举值之和
        dp[pre][rest] = dp[pre + 1][rest] + dp[pre][rest - pre]
      }
    }
    return dp[1][n]
  }
/**
 * 给定一颗二叉树的头结点head
 * 已知所有节点都不一样，返回其中最大的且符合搜索二叉树条件的最大拓扑结构大小
 * 拓扑结构：不是子树，能连起来的结构都算
 * 
 * 思路：
 * 使用拓扑记录
 * 先求每个子树最大拓扑结构大小，再转换成跟结点最大拓扑大小
 * 再从所以记录中求最大值
 * 
 */

const modifyMap = (n, v, m, s) => {
  if(!n || !m.has(n)) {
    return 0
  }
  const r = m.get(n);
  if ((s && n.value > v) || ((!s) && n.value < v)) {
    m.delete(n);
    return r.l+r.r + 1;
  } else {
    const minus = modifyMap(s ? n.right : n.left, v, m,s);
    if(s) {
      r.r = r.r - minus;
    } else {
      r.l = r.l - minus;
    }
    m.set(n,r);
    return minus;
  }
}

const posOrder = (h, map) => {
  if(!h) {
    return 0;
  }
  const ls = posOrder(h.left, map);
  const rs = posOrder(h.right,map);
  modifyMap(h.left,h.value,map,true);
  modifyMap(h.right,h.value,map,false);
  const lr = map.get(h.left);
  const rr = map.get(h.right);
  const lbst = lr ?lr.l + lr.r + 1:0;
  const rbst = rr ? rr.l + rr.r + 1:0;
  map.set(h, { l: lbst, r: rbst });
  return Math.max(lbst + rbst + 1, Math.max(ls, rs))
}

const bstTopoSize = head => {
  const map = new Map();
  return posOrder(head,map)
}
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
 * '.'匹配任一单一字符，'*' 匹配0个或者多个'*'前面的字符
 * 输入的字符串长度不会超过100，且不为空
 * 
 * 思路：
 * 看当前ei下一个是不是*，
 * 不是*的话，当前匹配的位置si相同往下走，不同则返回true
 * 是*的话看 ei + 2之后能不能跟si之后匹配，继续判断比较
 */
// 方法一： 递归实现
// 检查是否是符合要求的字符串和校验字符串
const isValid = (str, exp) => {
  // 不能有匹配符
  if (str.includes('*') || str.includes('.')) {
    return false
  }
  // 开头不能是*，连续两个不能是*
  for(let i = 0; i<exp.length; i++) {
    if (exp[i] === '*' && (!i || exp[i+1] === '*')) {
      return false
    }
  }
  return true
}

const process = (str, exp, si, ei) => {
  // 比较到最后一个字符了看str是否也到了最后
  if (ei === exp.length) {
    return si === str.length
  }
  // ei 到了最后一个，或者exp下一字符不是*，当前位置相同后，一起往后移动继续比较
  if (ei + 1 === exp.length || exp[ei+1] != '*') {
    return si != str.length && (exp[ei] === str[si] || exp[ei] === '.') && process(str, exp, si+1,ei+1)
  }
  // exp当前字符下一个是*，依次判断*可以代表多少个字符，只要命中一种情况就匹配，返回true
  while(si != str.length && (exp[ei] === str[si] || exp[ei] === '.')) {
    if (process(str, exp, si, ei+2)) {
      return true
    }
    si++
  }
  return process(str, exp, si, ei+2);
}

const isMatch = (str, exp) => {
  if (!str || !exp) {
    return false;
  }
  return isValid(str, exp) && process(str, exp, 0, 0)
}

// 方法二： 递归改动态规划

const initDpMap = (s,e) => {
  const slen = s.length;
  const elen = e.length;
  const dp = (new Array(slen + 1).fill(null)).map(e => (new Array(elen + 1).fill(0)));
  dp[slen][elen] = true;
  for(let j = elen - 2; j > -1; j= j-2) {
    if (e[j] != '*' && e[j + 1] == '*') {
      dp[slen][j] = true
    } else {
      break;
    }
  }
  if (slen > 0 && elen > 0) {
    if (e[elen -1] === '.' || s[slen - 1] === e[elen - 1]) {
      dp[slen -1][elen -1] = true;
    }
  }
  return dp
}

const isMatchDpWay = (str, exp) => {
  if (!str || !exp || !isValid(str, exp)) {
    return false;
  }
  const dp = initDpMap(str,exp);
  for(let i = str.length -1; i > -1; i--) {
    for(let j = exp.length -2; j > -1; j--) {
      if (exp[j + 1] != '*') {
        dp[i][j] = (str[i] === exp[j] || exp[j] === '.') && dp[i + 1][j + 1];
      } else {
        let si = i;
        while(si != str.length && (exp[j] === str[si] || exp[j] === '.')) {
          if (dp[si][j + 2]) {
            dp[i][j] = true;
            break
          }
          si++
        }
        if(!dp[i][j]) {
          dp[i][j] = dp[si][j+2]
        }
      }
    }
  }
  return dp[0][0]
}
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