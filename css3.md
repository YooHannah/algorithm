#文本换行
1.pre标签自动换行
```
pre{
    white-space:pre;
    word-wrap:break-word
}
```
2.td自动换行
```
table{
    table-layout:fixed;
    width:***px;
}
table td{
    overflow:hidden;
    word-wrap:break-word;
}
```
3.除以上两种标签自动换行
```
element{
    overflow:hidden;
    word-wrap:break-word;
}
```
4.标签内容强制不换行
```
element{
    white-space:nowrap;
    word-break:keep-all;
}
```

# 多列布局
column-width —— 列宽,不设置时由其他属性决定
column-count —— 列数,不设置时由其他属性决定
columns —— column-width column-count

column-gap —— 列间距
column-rule —— 间距线，位于列间距中间，介于background和content之间，宽度大于列间距时消失
宽度 样式 颜色

column-fill —— 各列宽度
auto 随内容自动调整 |balance 以内容最多一列统一高度
column-span —— 子元素是否合并列
none/all
静态布局：尺寸不变，布局不变
自适应布局：为不同尺寸屏幕设计不同静态布局
流式布局：通过更改模块大小，保证整体布局
响应式布局：针对不同尺寸屏幕，设计不同流式布局
弹性布局：可以设置模块大小放缩保证布局，也可以固定模块大小，更改布局
[各种布局概念区分](https://www.cnblogs.com/yanayana/p/7066948.html)

# transition
过度属性(css样式)none/all，具备过渡效果的属性，color,阴影，渐变
过渡时间 s/ms 整个变化持续时间
过度函数 ease|linear|ease-in|ease-out|ease-in-out|step,以上函数表示以什么样的速度变化，都可以用三次贝塞尔曲线实现
延迟时间 s/ms 变化延迟多长时间再开始，赋值为负值时，立即开始，之前的变换被截断
配置多项时，每组配置逗号隔开
终状态一般定义于各种触发伪类：hover,active,focus,checked
或者根据媒体查询结果

# @keyframes
定义动画每一帧样式
@keyframes 取个名字apple{ 
   0%{动画第一帧样式}
   各种百分数{动画过渡帧样式}
   100%{动画最后一帧样式}
}

# animation
animation各个子属性
animation-name:@keyframes声明的动画帧的名字，例如apple
animation-duration:播放一遍的时间
animation-timing-function:播放方式
animation-delay:延迟多长时间再播放
animation-iteration-count:播放次数
animation-direction:倒放还是正放动画normal正放alternate倒放
animation-play-state:播放状态running播放|paused暂停
animation-fill-mode:结束定格在哪一帧

#@media
媒体查询
@media 10种媒体类型 and (13种设备特性) and (13种设备特性){样式}

# @font-face
从服务器加载字体类型

```
@font-face{
    font=family:xxx;
    src:url()
}
```

