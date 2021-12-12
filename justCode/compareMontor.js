// 比较器

/***
 * 比较器的实质就是重载比较运算符
 * 比较器可以很好的应用在特殊标准的排序上
 * 比较器可以很好的应用在根据特殊标准排序的结构上
 */

/**
 * 应用场景： 定义复杂的排序的比较逻辑
 * 
 */

// 比如,对于普通排序，谁应该放在前面
// 应用在堆排序时，谁应该排在树的上面
const IdAscendingComparator = (a,b) => a.id - b.id

Array.sort(arr, IdAscendingComparator)