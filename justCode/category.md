# 常见排序

[选择冒泡排序](https://github.com/YooHannah/algorithm/blob/master/justCode/choosebubble.js)

[异或运算巧用](https://github.com/YooHannah/algorithm/blob/master/justCode/bitOperate.js)

[插入排序](https://github.com/YooHannah/algorithm/blob/master/justCode/insertSort.js)

[二分法](https://github.com/YooHannah/algorithm/blob/master/justCode/dichotomy.js)

[对数器](https://github.com/YooHannah/algorithm/blob/master/justCode//logMonitor.js)

[递归算法(动态规划)](https://github.com/YooHannah/algorithm/blob/master/justCode/recursion.js)

[归并排序](https://github.com/YooHannah/algorithm/blob/master/justCode/merge.js)

[快排](https://github.com/YooHannah/algorithm/blob/master/justCode/quickSort.js)

[堆排](https://github.com/YooHannah/algorithm/blob/master/justCode/heap.js)

[比较器](https://github.com/YooHannah/algorithm/blob/master/justCode/compareMontor.js)

[桶排序](https://github.com/YooHannah/algorithm/blob/master/justCode/radixSort.js)

## 小结
### 排序算法的稳定性

同样值的个体之间，如果不因为排序而改变相对次序，这个排序就是具备稳定性的，否则就没有

不具备稳定性的排序：
选择，快排，堆排

具备稳定性的排序：
冒泡，插入，归并，一切桶思想下的排序

### 以上排序之间的比较

类型 | 时间复杂度 | 空间复杂度 | 稳定性
 :-: | :-: | :-: | :-:
选择 | O(N^2) | O(1) | 不
冒泡 | O(N^2) | O(1) | 稳
插入 | O(N^2) | O(1) | 稳
归并 | O(NlogN) | O(N) | 稳
快排 | O(NlogN) | O(logN) | 不
堆 | O(NlogN) | O(1) | 不
桶(基数) | O(NlogN) | O(N) | 不

小结：
1.基于比较的排序，时间复杂度没有低于O(NlogN)的
2.时间复杂度在O(NlogN)，且空间复杂度在O(N)的算法不能做到稳定性

### 一些坑的问题

1.归并排序的额外空间复杂度可以变成O(1), 但同时会失去稳定性，不如用堆

2.不使用额外空间的'原地归并算法'会让时间复杂度变成O(N^2),不如用插入

3.快排可以具备稳定性，但相应空间复杂度会变成O(N), 且需要论文学术层面的验证推导，比较复杂， 不如用归并

4.目前没有找到时间复杂度O(NlogN),额外空间复杂度O(1) 且又稳定的排序

5.题目要求奇数放数组左边，偶数放数组右边，还要求原始相对次序不变，比较复杂。
(快排算法在0/1标准下的分层可以做到奇数放左边偶数放右边，但是没有稳定性)

### 工程上对算法进行改良的方向
1.充分利用O(NlogN)和O(N^2) 排序算法各自的优势
2.对稳定性进行考量

# 数据结构

[链表](https://github.com/YooHannah/algorithm/blob/master/justCode/box.js)
[二叉树/树型DP](https://github.com/YooHannah/algorithm/blob/master/justCode/binaryTree.js)
[图](https://github.com/YooHannah/algorithm/blob/master/justCode/graph.js)

# 其他
[贪心算法](https://github.com/YooHannah/algorithm/blob/master/justCode/greedy.js)
[大数据相关](https://github.com/YooHannah/algorithm/blob/master/justCode/bigData.js)
[单调栈结构](https://github.com/YooHannah/algorithm/blob/master/justCode/monotonicStack.js)
[斐波那契数列套路](https://github.com/YooHannah/algorithm/blob/master/justCode/Fibonacci.js)
[矩阵处理相关题目](https://github.com/YooHannah/algorithm/blob/master/justCode/matrix.js)
[字符串处理相关题目](https://github.com/YooHannah/algorithm/blob/master/justCode/str.js)
[异或运算相关题目](https://github.com/YooHannah/algorithm/blob/master/justCode/xor.js)
[尝试相关题目](https://github.com/YooHannah/algorithm/blob/master/justCode/try.js)
[中位数相关题目](https://github.com/YooHannah/algorithm/blob/master/justCode/midNum.js)
[应用思考分析类题目](https://github.com/YooHannah/algorithm/blob/master/justCode/thinking.js)


