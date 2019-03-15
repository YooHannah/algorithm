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
————head ： 从文本内容头部截取显示省略号。例如： "...efg"
————middle ： 在文本内容中间截取显示省略号。例如： "ab...yz"
————tail ： 从文本内容尾部截取显示省略号。例如： "abcd..."
————clip ： 不显示省略号，直接从尾部截断。
numberOfLines:文本过长时，最多折叠多少行，执行ellipsizeMode设置的效果
onLayout：加载时或者布局变化以后调用，参数为：{nativeEvent: {layout: {x, y, width, height}}}
onLongPress：当文本被长按以后调用此回调函数
onPress：当文本被点击以后调用此回调函数。
llowFontScaling：制字体是否要根据系统的“字体大小”辅助选项来进行缩放。默认值为true。

# TextInput
有些属性仅在multiline为true或者为false的时候有效，例如当multiline=false时，为元素的某一个边添加边框样式（例如：borderBottomColor，borderLeftWidth等）将不会生效
在安卓上长按选择文本会导致windowSoftInputMode设置变为adjustResize，这样可能导致绝对定位的元素被键盘给顶起来。要解决这一问题你需要在AndroidManifest.xml中明确指定合适的windowSoftInputMode( https://developer.android.com/guide/topics/manifest/activity-element.html )值，或是自己监听事件来处理布局变化。
## 属性
placeholder：同input
maxLength:限制文本框中最多的字符数。使用这个属性而不用JS逻辑去实现，可以避免闪烁的现象。
multiline:如果为true，文本框中可以输入多行文字。默认值为false。注意安卓上如果设置multiline = {true}，文本默认会垂直居中，可设置textAlignVertical: 'top'样式来使其居顶显示
numberOfLines:设置输入框的行数
allowFontScaling:控制字体是否要根据系统的“字体大小”辅助选项来进行缩放。默认值为true。
autoCapitalize:控制TextInput是否要自动将特定字符切换为大写
————characters: 所有的字符。
————words: 每个单词的第一个字符。
————sentences: 每句话的第一个字符（默认）。
————none: 不切换。
autoCorrect：如果为false，会关闭拼写自动修正。默认值是true
autoFocus：如果为true，在componentDidMount后会获得焦点。默认值为false。
blurOnSubmit：如果为true，文本框会在提交的时候失焦。对于单行输入框默认值为true，多行则为false。注意：对于多行输入框来说，如果将blurOnSubmit设为true，则在按下回车键时就会失去焦点同时触发onSubmitEditing事件，而不会换行。
caretHidden：如果为true，则隐藏光标。默认值为false。
clearButtonMode：是否要在文本框右侧显示“清除”按钮。仅在单行模式下可用。默认值为never。
clearTextOnFocus：如果为true，每次开始输入的时候都会清除文本框的内容。
defaultValue：
提供一个文本框中的初始值。当用户开始输入的时候，值就可以改变。在一些简单的使用情形下，如果你不想用监听消息然后更新value属性的方法来保持属性和状态同步的时候，就可以用defaultValue来代替。
editable：如果为false，文本框是不可编辑的。默认值为true
enablesReturnKeyAutomatically：如果为true，键盘会在文本框内没有文字的时候禁用确认按钮。默认值为false。
inlineImageLeft：指定一个图片放置在左侧。图片必须放置在/android/app/src/main/res/drawable目录下，经过编译后按如下形式引用（无路径无后缀）
```
<TextInput
 inlineImageLeft='search_icon'
/>
```
inlineImagePadding:给放置在左侧的图片设置padding样式。
keyboardAppearance:指定键盘的颜色。
keyboardType:决定弹出何种软键盘类型

## 响应
onBlur：当文本框失去焦点的时候调用此回调函数。
onChange：当文本框内容变化时调用此回调函数。回调参数为{ nativeEvent: { eventCount, target, text} }
onChangeText：当文本框内容变化时调用此回调函数。改变后的文字内容会作为参数传递。
onEndEditing：当文本输入结束后调用此回调函数。
onKeyPress：当一个键被按下的时候调用此回调。传递给回调函数的参数为{ nativeEvent: { key: keyValue } }，其中keyValue即为被按下的键。会在onChange之前调用。注意：在Android上只有软键盘会触发此事件，物理键盘不会触发。
onSubmitEditing：此回调函数当软键盘的确定/提交按钮被按下的时候调用此函数。如果multiline={true}，此属性不可用。
# Button
样式单一，可能不适合统一UI样式
## 属性
title:按钮名
color：文本的颜色(iOS)，或是按钮的背景色(Android)
disabled：禁用

## 响应
onPress:点击触发

## TouchableHighlight
用来封装可以点击的元素，来制作按钮或者链接。注意此组件的背景会在用户手指按下时变暗。
使其可以正确响应触摸操作。当按下的时候，封装的视图的不透明度会降低，同时会有一个底层的颜色透过而被用户看到，使得视图变暗或变亮
只支持一个子节点（不能没有子节点也不能多于一个）。如果你希望包含多个子组件，可以用一个View来包装它们
### 属性
activeOpacity：指定封装的视图在被触摸操作激活时以多少不透明度显示（0到1之间，默认值为0.85）。需要设置underlayColor。
underlayColor：有触摸操作时显示出来的底层的颜色。
### 响应
onHideUnderlay：底层的颜色被隐藏的时候调用。
onShowUnderlay：当底层的颜色被显示的时候调用。
## TouchableNativeFeedback
用来封装可以点击的元素，在用户手指按下时形成类似墨水涟漪的视觉效果
它只支持一个单独的View实例作为子节点
### 属性
background：决定在触摸反馈的时候显示什么类型的背景,它接受一个有着type属性和一些基于type属性的额外数据的对象。
一般用本组件的几个静态方法来创建这个对象
——————SelectableBackground()：创建一个对象，表示安卓主题默认的对于被选中对象的背景
——————SelectableBackgroundBorderless()：创建一个对象，表示安卓主题默认的对于被选中的无边框对象的背景
——————Ripple(color: string, borderless: boolean)：创建一个对象，当按钮被按下时产生一个涟漪状的背景，你可以通过color参数来指定颜色，如果参数borderless是true，那么涟漪还会渲染到视图的范围之外，




