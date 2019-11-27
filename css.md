# 两个css问题解决
## input样式兼容
在safari浏览器中给input设置样式不能直接被使用，会依旧使用浏览器默认样式，
此时需要给样式添加
```
-webkit-appearance: none;/*去除系统默认appearance的样式*/
line-height: normal;
```
## 子元素 position:fixed ，但宽度要和父元素一致
### 背景
父元素宽度随屏幕大小变化，而且margin-left有一个固定值，假设为320px
子元素position:fixed
如果直接设置子元素宽度为100%
则会导致子元素有320px的宽度在可视区域外
[!calc.png](calc.png)
### 知识点
css3的函数calc() 可以用来计算属性值
特点：
1.浏览器解析calc()结果还是calc(),不会计算参数表达式的值，
  意味着浏览器中的值可以更加灵活，能够响应视口的改变，即实际渲染结果始终调用calc计算结果
2.可以使用加减乘除，可以套嵌使用，即calc参数表达式中可以包含calc函数调用
3.可以进行不同单位间的计算,可以混合绝对单位(如百分比与视口单元)与相对单元(比如像素)
应用
```
1.居中
//居中设置原来
.center {
  position: absolute
  top: 50%;
  left: 50%;
  marging-top: -150px;
  margin-left: -150px;
}

//使用calc
.center {
  position: absolute
  top: calc(50% - 150px);
  left: calc(50% - 150px);
}

2.设置字体，在页面上的任何文本，将会根据视口自动缩放，
相同比例的视口总会显示相同的文本数量，不管视口的真实尺寸是多少。
html {  
    font-size: calc(100vw / 30);
}
```
```
width:calc(100%-320px)
```