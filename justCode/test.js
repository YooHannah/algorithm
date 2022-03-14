const getMaxProfit = (costs, profits, K, W) => {
  const originList = costs.map((c, i) => ({
    c,
    p: profits[i]
  }));
  const minCosts = originList.sort((a,b) => b.c-a.c);
  let maxProfits = [];
  for(let i = 0; i< K; i++) {
    while(minCosts.length && minCosts[minCosts.length - 1].c <= W) {
      maxProfits.push(minCosts.pop());
    }
    maxProfits = maxProfits.sort((a,b) => a.p - b.p);
    if (!maxProfits.length) {
      return W
    }
    W += maxProfits.pop().p; 
  }
  return W;
}
console.log(getMaxProfit([1,1,2,2,3,4], [1,4,3,7,2,10], 4,1));
