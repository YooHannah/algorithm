/**
 * 给定一个非负整数N,代表二叉树的结点个数，返回能形成多少种不同的二叉树结构
 * 
 */

/**
 * 二叉树每个结点都有一个int型的权值，给定一颗二叉树，
 * 要求计算出根结点到叶结点的所有路径中
 * 权值和最大的值为多少
 */

 /**
  * 将给定数转成字符串，原则如下，1对应a，2对应b, ...26对应z, 
  * 例如12258，可以转换成‘abbeh’, 'aveh', 'abyh', 'lbeh' 和‘lyh’ 个数为5
  * 现在给任一数字，返回可以转换成不同字符串的个数
  * 
  */

/**
 * 一个完整的括号字符串定义如下
 * 1.空字符串是完整的，
 * 2.如果s是完整的字符串，那么（s）也是完整的
 * 3.如果s和t是完整字符串，那么他们拼接起来st也是完整的
 * 例如： ‘(()())’ 和‘(())()’是完整的字符串
 * ‘（））’， ‘（）（’ 和‘）’ 是不完整的括号字符串
 * 现在想要将不完整的任意一个括号字符串转化成一个完整的括号字符串，请问至少要添加多少个括号
 * 
 * 思路：
 * 分别统计当前字符'(' 和')' 个数，统计过程去掉可以配对的个数，二者之和就是需要添加的左右括号之和
 * 
 * 
 */

 /**
  * 对于上面的括号字符串定义深度
  * 1. 空字符串深度是0
  * 2. 如果X字符串深度是x,Y的深度是y,那么二者合起来的字符串'XY'的深度为max(x,y)
  * 3. 如果X字符串深度是x,那么‘（X）’的深度是x+1
  * 例如‘（）（）（）’ 深度是1，‘（（（）））’ 深度是3
  * 请算出合法括号字符串的深度
  */

 /**
  * 给定一个数组arr.求差值为K的去重数字对
  * 
  */

/**
 * 给定两个集合a和b,分别包含整数元素个数 n 和 m 个
 * 定义magic 操作，】
 * 从一个集合中取出一个元素，放到另一个集合中，
 * 且操作过后，两个集合的平均值大于操作前
 * 注意：
 * 1. 不可以把一个集合的元素取空，这样就没有平均值了
 * 2. 值为x 的元素从集合b取出放入集合a.但集合a中已经有值为x的元素，则a的平均值不变
 *    因为集合元素不会重复，b的平均值可能会改变，因为x被取出了
 * 问最多可以进行多少次magic操作
 * 
 */


/**
 * 对一个栈里的整型数据，按升序进行排序，
 * 即排序前，栈里的数据是无须的，排序后最大元素位于栈顶
 * 要求最多只能使用一个额外的栈存放临时数据，但不得将元素复制到背的数据结构中
 * 
 */

/**
 * 给定一个元素为非负数的二维数组，每行每列都是从小到大有序的，
 * 给定一个非负整数aim, 检查aim 是否在二维数组中
 */