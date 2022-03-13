class trieNode {
  constructor() {
    this.pass = 0;
    this.end = 0;
    this.nexts = {};
  }
}

class Trie {
  constructor () {
    this.root = new trieNode;
  }
  // 将字符串加入树中
  insert(str) {
    if(!str) {
      return;
    }
    const list = str.split('').filter(e=>e);
    let node = this.root;
    node.pass++;
    let index = 0;
    for(let i = 0; i< list.length;i++) { // 从左往右遍历字符串
      const char = list[i]; // 由字符对应成走向哪条路
      if (!node.nexts[char]) {
        node.nexts[char] = new trieNode()
      }
      node = node.nexts[char];
      node.pass++;
    }
    node.end++
  }
  // str 之前加入过几次
  search(str) {
    if(!str) {
      return 0;
    }
    let node = this.root;
    const list = str.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(node.nexts[char]) {
        node = node.nexts[char];
      } else {
        return 0;
      }
    }
    return node.end;
  }
  // 所有加入的字符串中，有几个是以pre这个字符串作为前缀的
  prefixNumber(pre) {
    if(!pre) {
      return 0;
    }
    let node = this.root;
    const list = pre.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(node.nexts[char]) {
        node = node.nexts[char];
      } else {
        return 0;
      }
    }
    return node.pass;
  }
  // 删除已经加在树里面的字符串
  delete(str) {
    if(!this.search(str)) {
      return;
    }
    let node = this.root;
    node.pass--
    const list = str.split('').filter(e=>e);
    for(let i = 0; i<list.length; i++) {
      const char = list[i];
      if(!(--node.nexts[char].pass)) {
        delete node.nexts[char];
        return
      }
      node = node.nexts[char];
    }
    node.end--;
  }
}
const tree = new Trie();
const arr = ['abf', 'abc', 'abe', 'bkg', 'bsd'];
for(let i = 0; i<arr.length; i++) {
  tree.insert(arr[i]);
}
console.log(tree);