
const minBags = n => {
  const allBigBag = Math.ceil(n/8);
  const countList = [];
  for(let i = allBigBag;i>=0;i--) {
    const rest = n - i * 8;
    if(rest < 0 || rest%6) {
      countList[i] = -1;
      continue;
    } 
    const smallBag = rest/6;
    countList[i] = i + smallBag;
  }
  return countList.filter(e => e != -1).sort((a,b) => a-b)[0] || -1;
}
for (let i = 1; i<100;i++) {
  console.log(i, minBags(i));
}
console.log(minBags(48));
