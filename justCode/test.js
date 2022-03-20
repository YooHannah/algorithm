const process1 = (weights, values, i, alreadyweight, bag) => {
  if(alreadyweight > bag) {
    return 0;
  }
  if(i == weights.length) {
    return 0;
  }
  return Math.max(
    process1(weights, values, i + 1, alreadyweight,bag),
    values[i] + process1(weights, values, i + 1, alreadyweight + weights[i],bag)
  );
}

const process2 = (weights, values, i, alreadyWeight,alreadyValue,bag) => {
  if (alreadyWeight > bag) {
    return 0;
  }
  if(i == values.length) {
    return alreadyValue;
  }
  return Math.max(
    process2(weights, values, i+1,alreadyWeight,alreadyValue,bag),
    process2(weights, values, i+1,alreadyWeight + weights[i], alreadyValue + values[i],bag)
  )
}

console.log(process2([1,30,15,10],[30,12,10,50], 0, 0, 0, 45))