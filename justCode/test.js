const validLength = str => {
  const dp = (new Array(str.length)).fill(0);
  let matchPos = 0;
  let maxLength = 0;
  for(let i = 1; i < str.length; i++) {
    if (str[i] === ')') {
      matchPos = i - dp[i-1] -1;
      if(matchPos >=0 && str[matchPos] === '(') {
        dp[i] = dp[i-1] + 2 + (matchPos ? dp[matchPos -1] : 0);
      }
    }
    maxLength = Math.max(maxLength, dp[i]);
  }
  return maxLength;
}
 console.log(validLength(')) ((()))()())))()()'));
