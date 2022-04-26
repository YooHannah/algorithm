const judge = (a,b) => {
  const doubleA = a + a;
  const doubleB = b + b;
  return doubleA.includes(b) && doubleB.includes(a);
}
console.log(judge('ab2cd', 'bcda'));
