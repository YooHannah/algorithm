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
function isdanger(row,k,chess){
  var flag1,flag2,flag3,flag4,flag5 = 0;
  for(var i = 0;i<8;i++){
    if(chess[i][k]!=0){
      flag1 =1;
      break;
    }
  }

  for(var i=row,j=k;i>-1&&j>-1;i--,j--){
    if(chess[i][j]!=0){
      flag2 =1;
      break;
    }
  }
  for(var i=row,j=k;i<8&&j<8;i++,j++){
    if(chess[i][j]!=0){
      flag3 =1;
      break;
    }
  }
  for(var i=row,j=k;i>-1&&j<8;i--,j++){
    if(chess[i][j]!=0){
      flag4 =1;
      break;
    }
  }
  for(var i=row,j=k;i<8&&j>-1;i++,j--){
if(chess[i][j]!=0){
flag5 =1;
      break;
    }
  }
  if(flag1||flag2|flag3|flag4|flag5){
    return 0;
  }else{
    return 1;
  }
}
function EightQueen(row,n,chess){
  var chess1 = [];
  chess1 = chess.slice();
  if(row == 8){
    console.log("第"+count+1+"种方法")；
    for(var j = 0;j<8;j++){
      console.log(chess1[j]);
    }
    count++;
  }else{
    for(var k = 0;k<n;k++){
      if(isdanger(row,k,chess1)){
        for(var i=0;i<8;i++){
          chess1[row][i]=0;
        }
        chess1[row][k];
        EightQueen(row+1,n,chess1);
      }
    }
  }
}
EightQueen(0,8,chess);