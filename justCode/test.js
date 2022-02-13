 const originarr = [10,3,6,7,78];
 const generateDoubleLink = (originarr)=> {
   const link = {};
   originarr.forEach((value, i) => {
     const currentNode = i ? link[i-1].next : {
         value: value,
         next: null,
         last: null
       };
      link[i] = currentNode;
     if(i != originarr.length - 1) {
       const nextValue = originarr[i+1]
       const nextNode = {
         value: nextValue,
         next: null,
         last: null
       };;
       currentNode.next = nextNode;
     }
     if(i) {
       const lastNode = link[i-1];
       currentNode.last = lastNode;
     }
   })
   Object.keys(link).forEach(key => {
     const node = link[key];
     node.rand = link[parseInt(Math.random() * 5)]
   })
   return link;
 }
 
 const link = generateDoubleLink(originarr);
//  console.log(link);
const printLink = (head) => {
  let node = head;
  let str = ''
  while(node) {
    str+=`--->${node.value}/${node.next && node.next.value}/${node.rand && node.rand.value}`;
    node = node.next;
  }
  console.log(str);
}
const copyRandomLink = (head) => {
  let currentNode = head;
  while(currentNode) {
    const nextNode = currentNode.next;
    const currentCopyNode = {...currentNode};
    currentNode.next = currentCopyNode;
    currentCopyNode.next = nextNode;
    currentNode = nextNode;
  }
  currentNode = head;
  while(currentNode) {
    const copyNode = currentNode.next;
    const randomNode = currentNode.rand;
    copyNode.rand = randomNode.next;
    currentNode = copyNode.next;
  }
  const copyLinkHead = head.next;
  currentNode = head;
  while(currentNode) {
    const currentCopyNode = currentNode.next;
    const nextNode = currentCopyNode.next;
    currentNode.next = nextNode;
    currentCopyNode.next = nextNode && nextNode.next;
    currentNode = nextNode;
  }
  printLink(head);
  printLink(copyLinkHead);
  return copyLinkHead
}
copyRandomLink(link['0']);