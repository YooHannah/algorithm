// 在8*8格的国际象棋上摆放八个皇后,使其不能互相攻击,
// 即任意两个皇后都不能处于同一行，同一列或同一斜线上,问有多少种摆法
var chess = [];
var count = 0;
for(var i=0;i<8;i++){
  chess[i]=[];
  for(var j=0;j<8;j++){
    chess[i][j]=0;
  }
}

function isdanger(row,j,chess){
  var flag1= 0,flag2= 0,flag3= 0,flag4= 0,flag5 = 0;
  //所在列
  for(var i = 0;i<8;i++){
    if(chess[i][j]!==0){
      flag1 = 1;
      break;
    }
  }
// 左上方
  for(var i1=row,k1=j;i1>=0 && k1>=0;i1--,k1--){
    if(chess[i1][k1]!==0){
      flag2 = 1;
      break;
    }
  }
  //右下方
  for(var i2=row,k2=j;i2<8 && k2<8;i2++,k2++){
    if(chess[i2][k2]!==0){
      flag3 =1;
      break;
    }
  }
  //右上方
  for(var i3=row,k3=j;i3>=0 && k3<8;i3--,k3++){
    if(chess[i3][k3]!==0){
      flag4 =1;
      break;
    }
  }
  //左下方
  for(var i4=row,k4=j;i4<8 && k4>=0;i4++,k4--){
    if(chess[i4][k4]!==0){
      flag5 =1;
      break;
    }
  }
  if(flag1||flag2||flag3||flag4||flag5){
    return 0;
  }else{
    return 1;
  }
}
//n表示列数；
//row表示起始行
function EightQueen(row,n,chess){
  var chess1 = [];
  chess1 = chess.slice();
  if(row == 8){
    var temp = count+1;
    console.log("第"+temp+"种方法");
    for(var j = 0;j<8;j++){
      console.log(chess1[j]);
    }
    count++;
  }else{
    for(var j = 0;j<n;j++){
      if(isdanger(row,n,chess)){
        for(var i=0;i<8;i++){
          chess1[row][i]=0;
        }
        chess1[row][j] = 1;
        EightQueen(row+1,n,chess1);
      }
    }
  }
}
EightQueen(0,8,chess);
console.log("总共有"+count+"种方法")