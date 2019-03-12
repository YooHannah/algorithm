# Text
相当于span,但可以被'\n'换行
用作子元素时，
如果父元素为Text时，多个Text子元素尽可能放一行，一行装不下时，自动换行，子元素Text标签会继承父元素Text一部分样式
如果父元素为View时，每个Text子元素成为flex布局的一个块，当容器不够宽时，每个块自动换行，块与块之间不影响
必须把文本放在Text组件中，不能直接放在View中
## 属性
selectable:是否可以长按选择文本，以便复制和粘贴
selectionColor[Andorid]：选中时高亮颜色
suppressHighlighting[IOS]：设为true时，当文本被按下会没有任何视觉效果。默认情况下，文本被按下时会有一个灰色的、椭圆形的高光
ellipsizeMode:表示当 Text 组件无法全部显示需要显示的字符串时如何用省略号进行修饰
    该属性有如下 4 种取值:
    head - 从文本内容头部截取显示省略号。例如： "...efg"
    middle - 在文本内容中间截取显示省略号。例如： "ab...yz"
    tail - 从文本内容尾部截取显示省略号。例如： "abcd..."
    clip - 不显示省略号，直接从尾部截断。
numberOfLines:文本过长时，最多折叠多少行，执行ellipsizeMode设置的效果
onLayout：加载时或者布局变化以后调用，参数为：{nativeEvent: {layout: {x, y, width, height}}}
onLongPress：当文本被长按以后调用此回调函数
onPress：当文本被点击以后调用此回调函数。
llowFontScaling：制字体是否要根据系统的“字体大小”辅助选项来进行缩放。默认值为true。

