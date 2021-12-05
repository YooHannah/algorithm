// 堆排序


/**
 * 根结点与叶子结点在数组中位置关系
 * 
 * 已知当前根结点位置为i,
 * 那么其左叶子结点位置为 2*i + 1
 * 右叶子结点位置为 2*i + 2
 * 
 * 已知当前叶子结点位置为i,
 * 那么其根结点位置为parseInt((i-1)/2)
 * 
 */


/**
 * 大根堆；根是整棵树最大值
 * 小根堆：根是整棵树最小值
 */

// heapInsert过程 【重点重点】
// 某个数现在处在index位置，往上继续移动形成大根堆
const heapInsert = (arr, index) => {
  while(arr[index] > arr[(index - 1)/2]) { // 自己比自己的根结点大
    swap(arr, index, (index-1)/2);
    index = (index - 1)/2;
  }
}


// heapify 过程 【重点重点】
// 某个数现在处在index位置， 向下移动形成大根堆
const heapify = (arr, index, heapSize) => {
  const left = index * 2 + 1;
  while(left < heapSize) {
    let largest = left + 1 <heapSize && arr[left + 1] > arr[left] ?
    left + 1 : left; // 左右叶子中数据较大的位置
    largest = arr[largest] > arr[index] ? largest : index;
    if(largest === index) {
      break;
    }
    swap(arr, largest, index); // 如果叶子比根大，则把根交换下来
    index = largest;// 当前数据的位置换成叶子结点的位置，继续判断是否需要向下移动
    left = index * 2 + 1 // left变成下以一个左叶子结点位置
  }
}



const heapSort = arr => {
  if(arr === null || arr.length <2) {
    return arr;
  }
  // 依次将数组中数据根据位置关系调整成大根堆
  for (let i = 0; i< arr.length; i++) { // O(N)
    heapInsert(arr, i); // O(logN)
  }

  // 如果随便给一个数组只是形成大根堆，可以直接
  // 从后往前heapify, 比用heapInsert更快一些
  // for (let i = arr.length -1; i>=0 ; i--) { // O(N)
  //   heapify(arr, i, arr.length);
  // }

  const heapSize = arr.length;
  // 将最大值和最后一个数做交换，最大值跑到最右边，
  // 位置确定，不再参与排序
  swap(arr, 0, --heapSize)
  // 从0 ~ n-2继续找最大值
  while(heapSize > 0) { 
    heapify(arr, 0, heapSize); // O(logN) 将最大值拱到第一个位置
    swap(arr, 0, --heapSize); // O(1) 交换，截断
  }
}

/**
 * 应用
 * 
 * 如果对某个位置的数进行替换，也不知道比原来数大还是小，如果保证整棵树还是一个大根堆？
 * 
 * 比较替换前后数据，
 * 如果比原数大，利用heapInsert往上拱
 * 如果比原数小，利用heapify往下移动
 * 
 * 
 */

// 插入一个数调整的时间复杂度是O（logN)
// 删除一个数调整的时间复杂度是O(logN)