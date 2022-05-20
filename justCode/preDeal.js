/**
 * 预处理方法
 * 根据题目要求，对输入数值进行一定规则预处理，方便逻辑的执行
 */

/**
 * 【题目】
 *  现有有一些排成一行的正方形，每个正方形已经被染成红色或者绿色，比如RGRGR
 *  你可以选择任意一个正方形将其涂成红色或者绿色，最终涂完色后，
 *  每个红色R的正方形要比每个绿色G的正方形距离最左侧近，求最少需要涂几个正方形来实现
 *  例如RGRGR，将第二个G和最后一个R分别涂成R和G就可以实现且是最少的
 *  涂完结果是RRRGG，R连续在左边就能保证，每个红色都比绿色更靠近左边
 * 
 *  思路：
 *  提前根据输入情况，整理出两个信息数组
 *  一个存放当前位置正方形左侧有几个绿色G的正方形
 *  一个存放当前位置正方形右侧有几个红色R的正方形
 *  遍历原数组，找到到左侧绿色正方形个数和右侧红色正方形个数和数最小的位置，
 *  这个和就是最小需要染色的正方形个数
 */
const maxSquare = matrix => {
  const height = matrix.length;
  const width = matrix[0].length;
  // 初始化时注意每个子数组不要是指向同一个
  let sideRightMatrix = (new Array(height).fill(null)).map(e => (new Array(width).fill(0)));
  let sideDownMatrix = (new Array(height).fill(null)).map(e=>(new Array(width)).fill(0));
  for(let i = 0; i<height; i++) {
    for(let j = 0; j<width; j++) {
      let downCount = 0;
      let row = i + 1;
      while(row< height && matrix[row][j]) {
        row++;
        downCount++;
      }
      sideDownMatrix[i][j] = downCount;
      let rightCount = 0;
      let col = j + 1;
      while(col < width && matrix[i][col]){
       rightCount++;
       col++;
      }
      sideRightMatrix[i][j] = rightCount;
    }
  }
  const validSquareSide = [];
  for(let i = 0; i<height; i++) {
    for(let j = 0; j<width; j++) {
      if(!matrix[i][j] ) {
       continue;
      }
      const side = Math.min(sideRightMatrix[i][j], sideDownMatrix[i][j]);
      const bottomSide = sideRightMatrix[i+side][j];
      const rightSide = sideDownMatrix[i][j+side];
      if(Math.min(bottomSide, rightSide) >= side) {
        validSquareSide.push(side);
      }
    }
  }
  return validSquareSide.sort((a,b)=> b-a)[0] + 1;
}

 /**
  * 【题目】
  * 给定一个N*M的矩阵，只有0和1两种值，返回边框1的最大的正方形的边长长度
  * 例如：
  * 0 1 1 1 1
  * 0 1 0 0 1
  * 0 1 0 0 1
  * 0 1 1 1 1
  * 0 1 0 1 1
  * 其中边框全是1的最大的正方形大小为4 * 4，所以返回4
  * 
  * 思路：
  * 根据输入情况准备两个矩阵
  * 一个用来存放原来矩阵相同位置上右侧连续是1的个数，包括自己
  * 一个用来存放原来矩阵相同位置上下方连续是1的个数，包括自己
  * 如果右侧连续1的个数和下方连续1的个数相同，则相对当前点来说可能组成正方形
  * 相同的个数就是边长，进而继续验证，
  * 当前点边长最右边点的down矩阵上值漫步满足是不是都是1
  * 最下边的点的right矩阵的值满不满足是不是都是1
  */

const maxSquare = matrix => {
  const height = matrix.length;
  const width = matrix[0].length;
  let sideRightMatrix = (new Array(height)).fill((new Array(width)).fill(0));
  let sideDownMatrix = (new Array(height)).fill((new Array(width)).fill(0));
  for(let i = 0; i<height; i++) {
    for(let j = 0; j<width; j++) {
      let downCount = 0;
      for(let line = i + 1; line <height; line++) {
        if(matrix[line][j]){
          downCount++
        } else {
          break;
        }
      }
      let rightCount = 0;
      for(let col = j+1; col < width; col++) {
        if(matrix[i][col]){
          rightCount++
        } else {
          break;
        }
      }
      sideRightMatrix[i][j] = rightCount;
      sideDownMatrix[i][j] = downCount;
    }
  }
  const validSquareSide = [];
  for(let i = 0; i<height; i++) {
    for(let j = 0; j<width; j++) {
      const side = Math.min(sideRightMatrix[i][j], sideDownMatrix[i][j]);
      const bottomSide = sideRightMatrix[i+side][j];
      const rightSide = sideDownMatrix[i][j+side];
      if(Math.min(bottomSide, rightSide) >= side) {
        validSquareSide.push(side);
      }
    }
  }
  return validSquareSide.sort((a,b)=> b-a)[0]
}


/**
 * 【题目】
 * 给定一个函数f,可以等概率的返回一个1~5的数字，请加工出能够等概率返回1~7的函数
 * 给定一个函数f,可以等概率的返回一个a~b的数字，请加工出能够等概率返回c~d的函数
 * 给定一个函数f,能够以概率P返回0，以1-p概率返回1，请加工出等概率返回0和1的函数
 * 
 * 思路：
 * 利用二进制表示整数
 * 先将原等概率函数f改造成等概率返回1和0的函数f1
 * 1~3的数字都能用2位2进制表示，5~7都要用3位的2进制表示
 * 1~7的数字用2进制表示的话，3位二进制上每一位都可能是0或者1
 * 让f1 返回3次的值组成最终的1~7范围内的数即可
 * 
 * 将f转成返回1和0的函数f1，看0 ~ d-c用二进制表示需要几位
 * 需要几位调几次f1，将每次返回结果组成的二进制的数转成10进制然后加上d-c
 * 
 * 计算两次f,只有当两次结果是01或者10时才算得到0和1返回，
 * 因为f 拿到01的概率是p * (1-p),拿到10的概率是(1-p) * p,这俩概率相等
 * 就可以把拿到结果为01 按0返回，10按1返回
 * 如果拿到的是00或者11，那么不返回重新计算两次ff，拿到一对组合
 * 
 */
// 问题1
const f1 = () => Math.random() * 5 + 1; // 返回1-5之间的数字
const r10 = () => { // 等概率返回 0和1
  let res = 0;
  do {
    res = f1();
  } while (res == 3);
  return res < 3 ? 0 : 1
}

const g = () => {
  let res = 0;
  do {
    res = (r10() << 2) + (r10() << 1) + r10(); // 等概率返回0 - 6 整数，等于7 的话重新掷骰子
  } while( res === 7)
  return res + 1
}

// 问题二

const transforfunc = (f,lessLeft,lessRight, aimLeft,aimRight) => {
  const lessMid = (lessLeft + lessRight ) / 2;
  const r01 = () => { // 等概率 0 1
    let res = 0;
    do {
      res = f()
     } while(res === lessMid);
    return res < lessMid ? 0 : 1;
  }
  const diff = aimRight - aimLeft;
  const count = Math.ceil(Math.log2(diff));
  let res = 0;
  do {
    res = 0;
    let time = count;
    while(time) {
      res += r01() << (time -1);
      time--;
    }
  } while (res > diff);
   return res + aimLeft
}

// 题目三
const f1 = () => Math.random() * 10 + 1; // 返回1-10之间的数字
const r01 = () => f1() > 7 ? 1:0;
const equal01 = (f) => {
  do {
   res = (f() << 1) + f()
  } while ( !res  || res === 3)
  return res === 1 ? 1 : 0
}
console.log(equal01(r01));



