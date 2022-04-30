
const divSumAndCount = n => {
  let sum = 0;
  let count = 0;
  for(let i = 2; i<=n; i++) {
    while(n % i == 0) {
      sum +=i;
      count++;
      n /= i;
    }
  }
  return [sum, count];
}
const isPrim = n => {
  for(let i = 2; i<=n; i++) {
    if(n % i == 0) {
      return false
    }
  }
  return true;
}
const minOps = n => {
  if (n < 2) {
    return 0;
  }
  if (isPrim(n)) {
    return n - 1;
  }
  const [sum, count] = divSumAndCount(n);
  return sum - count;
}
 console.log(minOps(6))
