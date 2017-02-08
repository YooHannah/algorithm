var string = "9ababaaaba";
var str = "3aaa"
function getnext(T,next){
  next[0]=0;
  var i = 1;
  var j = 0;
  next[1] = 0;
  while(i<T[0]){
    if(j==0 || T[i] == T[j]){
      i++;
      j++;
      if(T[i]!=T[j]){
        next[i]=j;//字符不连续相同
      }else{
        next[i]=next[j];//字符连续相同时,将前缀等值过去
      }
    }else{
      j = next[j];
    }
  }
  console.log(next);
}
//S主串，T子串，poi开始查找位置
function KMP(S,T,poi){
  var i= poi;
  var j = 1;
  var next = [];
  getnext(T,next);
  while(i<=S[0]&& j<=T[0]){
    if(j==0 ||S[i]==T[j]){
      i++;
      j++
    }else{
      j = next[j]
    }
  }
  if(j>T[0]){
    var temp = i-T[0]+1;
    console.log("从第"+temp+"个位置开始匹配")
    return i-T[0];
  }else{
    console.log("两个字符串一点也不匹配!")
    return 0;
  }
}
 KMP(string,str,1);