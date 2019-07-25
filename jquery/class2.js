/**
 * 0.jquery对象与Element对象转换
 * 
 * Element对象转jquery对象
 * var domObj = document.getElementById('id')
 * var $obj = $(domObj)//jQuery对象
 * 
 * jquery对象转Element对象
 * var $box = $('.box')
 * var box = $box[0]
 * 
 * 1.常用jQuery选择器接口
 * 
 * 传入对象 , 例$(document)，把传入的对象包装成jQuery对象
 * $(this}
 * 
 * 传入函数 , 这个是在页面DOM文档加载完成后加载执行的，等效于在DOM加载完毕后执行了${document).ready()方 法。
 * $ (function (){})
 * 
 * 传入字符串 ，査询D0M节点包装成jQuery对象
 * $(.box)
 * 
 * 传入空
 * $()创建jQuery对象
 * 
 * 2.如何把创建的Dom结点包装成jQuery对象
 * contetx.createElement创建DOM节点存储在数组中，调用merge方法把数组中存储的DOM节点的成员添加到jQuery实例对象上
 * 
 * 3.jQuery实例对象length属性作用
 * 存储DOM节点的数组对象平滑地添加到jQuery实例对象上
 * 
 * 4.存储DOM节点的数组对象平滑地添加到jQuery实例对象上
 * 合并数组
 * 把数组成员合并在有length属性的对象上
 * 
 * 5.$(document).ready()与$(function(){})的关系
 * $(document).ready()是对document.DOMContentLoaded事件的封装
 * $(function(){})每次调用$()传入的参数会收集在readyList数组中，
 * 当document.DOMContentLoaded事件触发时依次执行readyList中收集的处理函数
 */