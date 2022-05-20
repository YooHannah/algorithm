
const f1 = () => Math.random() * 10 + 1; // 返回1-10之间的数字
const r01 = () => f1() > 7 ? 1:0;
const equal01 = (f) => {
  do {
   res = (f() << 1) + f()
  } while ( !res  || res === 3)
  return res === 1 ? 1 : 0
 }
console.log(equal01(r01));
