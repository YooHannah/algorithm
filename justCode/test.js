// const list = [1,2,3,4,5,6,7, null, 8, null, null, 9];
// const list = [10,6,20,5,7,4,23,null, null, 12,15,null, null, 21,27];
const list = [5,3,7,6,4,12,9];
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
const root = generateBinaryTree(list, i);
console.log(root)
const modifyMap = (n, v, m, s) => {
  if(!n || !m.has(n)) {
    return 0
  }
  const r = m.get(n);
  if ((s && n.value > v) || ((!s) && n.value < v)) {
    m.delete(n);
    return r.l+r.r + 1;
  } else {
    const minus = modifyMap(s ? n.right : n.left, v, m,s);
    if(s) {
      r.r = r.r - minus;
    } else {
      r.l = r.l - minus;
    }
    m.set(n,r);
    return minus;
  }
}

const posOrder = (h, map) => {
  if(!h) {
    return 0;
  }
  const ls = posOrder(h.left, map);
  const rs = posOrder(h.right,map);
  modifyMap(h.left,h.value,map,true);
  modifyMap(h.right,h.value,map,false);
  const lr = map.get(h.left);
  const rr = map.get(h.right);
  const lbst = lr ?lr.l + lr.r + 1:0;
  const rbst = rr ? rr.l + rr.r + 1:0;
  map.set(h, { l: lbst, r: rbst });
  return Math.max(lbst + rbst + 1, Math.max(ls, rs))
}

const bstTopoSize = head => {
  const map = new Map();
  return posOrder(head,map)
}

console.log(bstTopoSize(root));
