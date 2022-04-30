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
  while(arr[index] > arr[parseInt((index - 1)/2)]) { // 自己比自己的根结点大
    let rootPos = parseInt((index - 1)/2)
    swap(arr, index, rootPos);
    index = rootPos;
  }
}


// heapify 过程 【重点重点】
// 某个数现在处在index位置， 向下移动形成大根堆

// 形成大根堆的过程会使跟排序失去稳定性 eg.[5 4 4 6]

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
// 使用堆结构在处理数据时要注意
// A；扩容不会影响性能，只会在扩容的时候会使运算变慢一些，但是整体不会造成影响
// B；各种语言提供的堆结构黑盒。有时候不会支持，在变更某个位置数据后依然保持堆结构
// 所以在实际解决问题时，有时需要自己手写堆结构维护函数


/***
 * 小分堆思想应用
 * 
 * 已知一个几乎有序的数组，几乎有序是指，如果把数组排好序的话
 * 每个元素移动的距离可以不超过k, 并且k 相对于数组来说比较小
 * 请选择一个合适的排序算法针对这个数据进行排序
 * 
 * 主要思想就是因为在一个可范围和下一个K范围顺序已知
 * 首先构建k个数的小根堆，将小根堆第一个数，也就是k范围内的最小值
 * 从0位置开始放到原始数组中，放一个往后移一个，小根堆里面的数始终是k个
 * 最后对K个数每次进行小分堆处理，取第一个数然后放到原始数组中
 * 
 */
// 将数组构建成一个小分堆结构
function smallRootHeapCreat(arr) {
  let {length} = arr;
  for(let i = 0; i< length; i++) {
    let curr = i;
    let left = curr * 2 + 1;
    while(left < length) {
      const right = left + 1;
      let min = right <length && arr[right] <arr[left] ? right : left;
      min = arr[min] <arr[curr] ? min : curr;
      if(min === curr) {
        break;
      } 
      [arr[min], arr[i]] = [arr[i], arr[min]]
      curr = min;
      left = min * 2 +1;
    }
  }
}   

const sortedArrayDistanceLessK = (arr, k) => {
  const heap = [];
  let index = 0;
  for(; index< Math.min(arr.length, k);index++) {
    heap.push(arr[index]);
    smallRootHeapInsert(heap)
  }
  let i = 0; 
  for(;index < arr.length; i++, index++) {
    heap.push(arr[index]);
    smallRootHeapInsert(heap);
    arr[i] = heap.shift();
    smallRootHeapInsert(heap);
  }
  while(heap.length) {
    arr[i++] = heap.shift();
    smallRootHeapInsert(heap);
  }
}

sortedArrayDistanceLessK([3,2,1,6,4,5,9,7,8], 4)

/**
 * 给定一个字符串类型数组arr, 求其中的出现次数最多的前K个
 * 
 * 思路：
 * 统计数据个数中维护一个小根堆，小根堆大小就是k
 * 每统计一个字符串类型，看当前类型个数是否大于小根堆对顶类型的个数
 * 大于就移除当前小根堆堆顶数据类型，把当前数据类型移入小根堆
 * 这样小根堆始终保持着数量对多的k个
 */

/**
 * 实现一种结构，提供可以添加字符串进去的方法，同时可以提供可以获取top K 的字符串的方法
 * 思路： 同上，整理成class数据结构可以提供add 和 getK方法
 */