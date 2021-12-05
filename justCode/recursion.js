// 递归
/**
 * 递归的时间复杂度可以用满足Master公式条件的Master公式来求
 *
 * Master公式： T(N) = a*T(N/b) + O(N ^ d)
 * 即主程序由几个均分的子程序组成，子程序必须是一样的时间复杂度
 * 满足这种关系的递归过程可以这样计算时间复杂度： 
 * （log以b为底a的对数表示为log(b,a))
 *  如果log(b,a) < d => O(N^d)
 *  如果log(b,a) > d => O(N^log(b,a))
 *  如果log(b,a) = d => O(N^d * logN)
 */
// 以下面这个例子解释
const getMax = arr => {
  return ProcessingInstruction(arr, 0, arr.length-1);
}

// arr[L...R]范围上最大值

const process = (arr, L, R) => {
  if ( L === R) {
    return arr[L];
  }

  const mid = L + ((R - L) >>1); // 计算中点位置，防止R+L越界
  const leftMax = process(arr, L, mid);
  const rightMax = process(arr, mid+1, R);
  return Math.max(leftMax, rightMax);
}

/**
 * process的Master公式就是
 * T(N) = 2T(N/2) + O(N ^ 0) // 只有1句计算中点的语句所以是O(1) => O(N ^ 0)
 * a = 2, b = 2, d = 0
 * log(b, a) = 1 > d
 * 这个递归的时间复杂度就是 O(N^log(b,a)) => O(N)
 */

