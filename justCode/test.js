
 const washProcess = (drinks, i, washtime, dissolvetime, washWattingTime) => {
  if (i === drinks.length -1) {
    const wash = Math.max(drinks[i], washWattingTime) + washtime;
    const dissolve = drinks[i] + dissolvetime;
    return Math.min(wash,dissolve);
  }
  // 如果选择洗咖啡杯，用时
  const wash = Math.max(drinks[i], washWattingTime) + washtime;
  // 选择洗咖啡杯的话，
  // 剩下的人因此造成的完成时间最少和我完成的过程用时的最大值是整体最少用时
  const restTime = washProcess(drinks, i+1,washtime, dissolvetime, wash);
  const washAllTime = Math.max(wash, restTime);
  const dissolve = drinks[i] + dissolvetime;
  const dissolveAlltime = Math.max(dissolve, washProcess(drinks, i+1, washtime, dissolvetime, washWattingTime));
  return Math.min(washAllTime, dissolveAlltime);
 }
 /**
  * 
  */
 const enjoyCoffee = (machine, count,washtime, dissolvetime) => {
   // 存放咖啡机在什么时间可用，
   // key值为咖啡机煮咖啡时间，value为要等的时间
   // 二者相加表示用户喝完咖啡的时间
   // 整体里面每组相加和最小，就是该用户当前最少喝完咖啡要用的时间
   const machineAvaliableTime = new Map();
   machine.forEach(time => {
     machineAvaliableTime.set(time, 0);
   });
   const drinks = [];
   for(let i = 0;i<count;i++) {
     let mintime = Number.MAX_SAFE_INTEGER;
     let minKey = -1;
     machineAvaliableTime.forEach((value, key) => {
       const makeCoffeTime = key + value;
       if (makeCoffeTime < mintime) {
         mintime = makeCoffeTime;
         minKey = key;
       }
     })
     machineAvaliableTime.set(minKey, mintime);
     drinks[i] = mintime;
   }
   return washProcess(drinks, 0, washtime, dissolvetime, 0);
 }

 console.log(enjoyCoffee([5,10, 15, 2],3, 4, 5))
