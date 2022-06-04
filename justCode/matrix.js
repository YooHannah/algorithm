
/**
 * 从宏观去思考解决办法
 * 
*/

  /**
   * 用螺旋的方式打印矩阵，比如如下的矩阵
   * 0 1 2 3
   * 4 5 6 7
   * 8 9 10 11
   * 打印顺序为： 0 1 2 3 7 11 10 9 8 4 5 6
   * 
   * 思路：
   * 把矩阵看成画中画结构，一圈一圈的打印
   * 利用左上角和右下角两个点确定一圈
   */
  const startPrint = (matrix, x1, y1, x2, y2) => {
    if (x1 == x2) {
      for(let i = y1;i <= y2; i++) {
        console.log(matrix[x1][i])
      }
    } else if (y1 == y2) {
      for(let i = a1;i <= a2; i++) {
        console.log(matrix[i][y1])
      }
    } else {
      let currX = x1;
      let currY = y1;
      while(currY != y2) {
        console.log(matrix[x1][currY]);
        currY++
      }
      while (currX != x2) {
        console.log(matrix[currX][y2]);
        currX++
      }
      while(currY != y1) {
        console.log(matrix[x2][currY]);
        currY--
      }
      while (currX != x1) {
        console.log(matrix[currX][y1]);
        currX--
      }
    }

  }
  const printMatrix = matrix => {
    let startX = 0;
    let startY = 0;
    let endX = matrix.length -1;
    let endY =  matrix[0].length -1; 
    while(startX <= endX && startY <= startY) {
      startPrint(matrix, startX++, startY++, endX--, endY--);
    }
  }
  console.log(printMatrix(
    [[0, 1, 2 ,3], [4,5,6,7],[8,9,10,11]] 
   ))
   /**
   * 用zigag的方式打印矩阵，比如如下的矩阵
   * 0 1 2 3
   * 4 5 6 7
   * 8 9 10 11
   * 打印顺序为： 0 1 4 8 5 2 3 6 9 10 7 11
   * 
   * 思路： 
   * 利用对角线
   * 定义两个点从原点出发，一个往右边走，一个往下面走
   * 二者如果能形成对角线，打印对角线上的元素
   * 设置flag切换从上往下打印，还是从下往上打印
   * 
   */
  const  printDuijiaoxian = (matrix,ar,ac,br,bc,fromUp)=> {
    if (fromUp) {
      while (ar != br + 1) {
        console.log(matrix[ar++][ac--])
      }
    } else {
      while (br != ar - 1) {
        console.log(matrix[br--][bc++])
      }
    }
  }
  const zigagPrint = arr => {
    let ar = 0;
    let ac = 0;
    let br = 0;
    let bc = 0;
    const endR = arr.length-1;
    const endC = arr[0].length -1;
    let fromUp = false;
    while (ar != endR + 1) {
      printDuijiaoxian(arr,ar,ac,br,bc,fromUp);
      ar = ac == endC ? ar + 1: ar;
      ac = ac == endC ? ac : ac + 1;
      bc = br == endR ? bc + 1 : bc;
      br = br == endR ? br : br + 1;
      fromUp = !fromUp;
    }
  }
 console.log(zigagPrint(
  [[0, 1, 2, 3], 
   [4, 5, 6, 7],
   [8, 9, 10, 11]] 
 ))

 /**
  * 给定一个正方形矩阵，只用有限几个变量，实现矩阵中每个位置的顺时针90度旋转
  * 例如
  * 0 1 2 3
  * 4 5 6 7
  * 8 9 10 11
  * 12 13 14 15
  * 旋转后结果为
  * 12 8 4 0
  * 13 9 5 1
  * 14 10 6 2
  * 15 11 7 3
  * 思路：
  * 一圈一圈的旋转
  * 里面圈的元素肯定不会旋转到外面来
  * 所以旋转完一圈，再转里面的圈
  * 旋转一圈时，以4个角为基准，
  * 4个角算一组
  * 4个角顺时针旋转下一个元素算一组
  * 再下一个元素一组
  * ...
  * 将圈上数字分组
  * 相同组的的数字进行位置互换
  */
 const rotateEdge = (m,a,b,c,d) => {
  let temp = 0;
  for (let i = 0; i < d-b ;i++) {
    temp = m[a][b+i];
    m[a][b+i] = m[c-i][b];
    m[c-i][b] = m[c][d-i];
    m[c][d-i] = m[a +i][d];
    m[a+i][d] = temp
  }
}

const rotate = matrix => {
  let tr = 0;
  let tc = 0;
  let dr = matrix.length -1;
  let dc = matrix[0].length - 1;
  while(tr < dr) {
    rotateEdge(matrix, tr++, tc++, dr--, dc--);
  }
  return matrix;
}
 console.log(rotate(
  [[0, 1, 2, 3], 
   [4, 5, 6, 7],
   [8, 9, 10, 11],
   [12,13,14,15]
  ] 
 ))

/**
 * 给定一个元素为非负数的二维数组，每行每列都是从小到大有序的，
 * 给定一个非负整数aim, 检查aim 是否在二维数组中
 * 
 * 思路：
 * 从右上角开始，大于当前数往左走，小于当前数往下走
 * 
 * [
 *  [1,3,6,10],
 *  [5,8,9,15],
 *  [7,12,14,20],
 * ] 
 * 
 */

const judgeExist = (number,matrix) => {
  const height = matrix.length;
  const width = matrix[0].length;
  let curX = width -1;
  for(let i = 0; i< height; i++) {
    for(let j = curX; j>= 0; j--){
      if(matrix[i][j] === number) {
        return true;
      }
      if (matrix[i][j] < number) {
        curX = j
        break;
      }
    }
  }
  return false;
}

/**
 * 类似题目
 * 一个二维数组，里面的每行元素由0和1组成，且1一定全部在0的右边且连续
 * 例如
 * [
 *  [0,0,0,1,1,1,1]
 *  [0,0,0,1,1,1,1]
 *  [0,0,0,0,1,1,1]
 *  [0,1,1,1,1,1,1]
 * ]
 * 求含有1最多的行数和个数
 * 
 * 思路：
 * 同样从右上角开始
 * 是1就一直往左走，碰到0往下走，同时更新最大值
 */
const findMaxOne = (matrix) => {
  let lines = [];
  let maxCount = 0;
  const height = matrix.length;
  const width = matrix[0].length;
  let curX = width -1;
  for(let i = 0; i< height; i++) {
    let orignal = maxCount;
    for(let j = curX; j>= 0; j--){
      if(!matrix[i][j]) {
        if (j<curX && maxCount === orignal) {
          lines.push(i)
        } else if(maxCount > orignal) {
          lines = [i];
        }
        curX = j+1;
        break;
      }
      if (matrix[i][j] && width - maxCount > j) {
        maxCount++;
      }
    }
  }
  return {
    lines,
    maxCount
  }
}

 /**
  * 给定一个整型矩阵，返回子矩阵中最大累计和
  * 
  * 思路：
  * 使用压缩矩阵成数组的思路
  * 假如现在有一个8 * 9 矩阵
  * 依次计算出
  * 0 ~ 0
  * 0 ~ 1  
  * 0 ~ 2
  * ...
  * 2 ~ 8
  * ...
  * 8 ~ 8
  * 这些行组成的矩阵的累计和
  * 只有一行，累计和即为各位置上的原有数字，转成数组累计和
  * 多行则是相同col位置上累计和，再转成数组累计和
  * 每种情况算出累计和最大值后，从中找大小
  */
 const addResult = (result, sumArr) => {
  const length = sumArr.length;
  for(let i = 0;i<length;i++) {
    let init = sumArr[i];
    result.push(init)
    for (let j = i+1; j<length;j++) {
      init +=sumArr[j];
      result.push(init)
    }
  }
  return result;
}
const getSum = (arr1, arr2) => {
  const length = arr1.length;
  const result = [];
  for(let i = 0;i<length; i++) {
    const sum = arr1[i] + arr2[i];
    result.push(sum);
  }
  return result;
}
 const getMaxMatrixSum = matrix => {
   const height = matrix.length;
   const width = matrix[0].length;
   let result = [];
   for(let i = 0; i< height;i++) {
    const line = matrix[i];
    let sumArr = line.slice();
    result = addResult(result, sumArr);
    for(let j = i+1; j< height; j++) {
      const nextLine = matrix[j];
      sumArr = getSum(sumArr,nextLine);
      result = addResult(result, sumArr);
    }
   }
   return result.sort((a,b) => b-a)[0]
 }