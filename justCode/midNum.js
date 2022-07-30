/**
 * 中位数相关
 */

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
