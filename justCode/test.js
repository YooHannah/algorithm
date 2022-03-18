const getMid = () => {
  const maxList = [];
  const minList = [];
  return curr => {
    if (!maxList.length && !minList.length) {
      maxList.push(curr)
      return curr;
    }
    const maxInMazList = maxList.sort((a,b)=>b-a)[0];
    if (curr<=maxInMazList) {
      maxList.push(curr);
    } else {
      minList.push(curr);
    }
    const minInMinList = minList.sort((a,b)=>a-b)[0];
    if (Math.abs(maxList.length - minList.length)>= 2) {
      if (maxList.length > minList.length) {
        minList.push(maxInMazList);
        const pos = maxList.findIndex(e => e === maxInMazList);
        maxList.splice(pos, 1);
      } else {
        maxList.push(minInMinList);
        const pos = minList.findIndex(e=> e === minInMinList);
        minList.splice(pos, 1);
      }
    }
    return maxList.length > minList.length ? maxList.sort((a,b)=> b-a)[0] : minList.sort((a,b)=>a-b)[0];
  }
}

const getMidNumber = getMid();

console.log(getMidNumber(0));

console.log(getMidNumber(3));

console.log(getMidNumber(6));

console.log(getMidNumber(7));

console.log(getMidNumber(2));

console.log(getMidNumber(1));