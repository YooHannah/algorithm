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
const nextIndex = (size, index) => index == size -1 ? 0 : index + 1;
 const no = (n, arr, index) => {
   if(n == 1) {
     return 1
   }
   // 老 = （新 + m -1）% i + 1
   return (no(n-1, arr, nextIndex(arr.length, index)) + arr[index] -1 ) % n + 1
 }
 // 0到n-1个人依次循环取用arr中数字杀n-1轮，返回的活的人编号
 const getLive = (n, arr) => no(n, arr, 0)

console.log(getLive(10, [2,3,4]))
