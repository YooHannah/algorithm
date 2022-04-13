const getMaxHappy = node => {
  if(!node.nexts.length) {
     return {
       come: node.happy,
       absent: 0
     }
   }
  const { happy, nexts } = node;
  let come = happy;
  let absent = 0;
  for(let i = 0; i<nexts.length; i++) {
    const result =  getMaxHappy(nexts[i]);
    const max = Math.max(result.come, result.absent);
    absent +=max;
    come +=result.absent;
  }
  return {
    absent,
    come
  }
 }
const node = {
  happy: 20,
  nexts: [
    {
      happy: 3,
      nexts: [
        {
          happy: 5,
          nexts: []
        },
        {
          happy: 7,
          nexts: []
        }
      ]
    },
    {
      happy: 4,
      nexts: [
        {
          happy: 10,
          nexts: []
        },
        {
          happy: 2,
          nexts: []
        }
      ]
    }
  ]
}
console.log(getMaxHappy(node))