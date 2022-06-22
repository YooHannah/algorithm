// const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
// const list = [10,6,20,5,7,4,23,null, null, 12,15,null, null, 21,27];
const list = [1,2,3,4,5,6,7,null, 8];
let i = 0; 
const generateBinaryTree = (data, i) => { // 生成一颗二叉树
  if(i=== data.length) {
    return null
  }
  const value = data[i];
  const left = 2 * i + 1 < data.length ?  generateBinaryTree(data, 2 * i + 1) : null;
  const right =  2 * i + 2 < data.length ? generateBinaryTree(data, 2 * i + 2) : null;
  const node = value ? {
    value,
    left,
    right
  } : null; 
  return node
}
// const root = generateBinaryTree(list, i);

const rotate = (arr, left, mid, half) => {
  const leftPart = arr.slice(left + half, mid +1); //中点左边需要换的一段
  const rightPart = arr.slice(mid+1, mid + half + 1);// 中点右边需要换的一段
  const newPart = [...leftPart.reverse(), ...rightPart.reverse()].reverse()
  arr.splice(left + half, newPart.length, ...newPart);
 }
 const getFinalPos = (pos, len) => {
   const half = Math.floor(len/2);
   if (pos <= half) {
    return 2 * pos
   } else {
     return 2 * (pos - half) -1;
   }

   // return (2 * i) % (len + 1); // 上面逻辑优化
 }
 const cycles = (arr, left,len, k) => {
  const list = arr.slice(left, left + len);
  for(let i = 0;i<k; i++) {
    const pos = Math.pow(3,i);
    let curr = getFinalPos(pos,len);
    let originalValue = list[pos-1];
    while(curr != pos) {
      const temp = list[curr -1];
      list[curr - 1] = originalValue;
      originalValue = temp;
      curr = getFinalPos(curr,len);
    }
    list[pos -1] = originalValue;
  }
  arr.splice(left, len, ...list);
 }
 const shuffle = (arr, left,right) => {
   while(right - left + 1) {
    const length = right - left +1;
    let base = 3;
    let k = 1;
    while(Math.pow(base,k) - 1 <= length) {
      k++;
    }
    k--;
    base = Math.pow(base,k) - 1;
    const mid = Math.floor((right+left)/2);
    const half = base / 2;
    rotate(arr, left, mid, half);
    cycles(arr, left, base, k);
    left = left + base;
   }
 }
 const washCard = arr => {
   const length = arr.length;
   if (arr && length && !(length % 2)) {
    shuffle(arr, 0, length -1);
    return arr
   }
 }


console.log(washCard([1,2,3,4,5,6,7,8,9,10,11,12]));
