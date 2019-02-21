关于CSS3样式的一点小结
# border-image
会覆盖border属性设置的边框样式
原理依据border-image-slice将图片切成九宫格
![borderOri](/images/borderOri.jpg)
EFGH位于边框四角，不参与拉伸或重复
ABCD分别在各自所在边上进行拉伸或者重复
I不参加修饰
## border-image-source
图片地址
格式url(imgurl) 
## border-image-slice
从距离top，right,bottom,left边多少切割图片，切4刀，形成9宫格
可为数字(图像的像素（位图图像）或向量的坐标（如果图像是矢量图像）)/百分数(水平/垂直偏移图像宽度的百分之多少)
不设置时，图片整体位于边框四角。
一个值时表示4个距离一致；两个值表示垂直方向两刀和水平两刀距离相同，四个值表示距离四个边各自的距离
特殊情况，
如果距上下边的长度等于高的一半，即在图片水平中线来一刀，则BD两个切片不会被切出来，左右边框会因为没有切片覆盖显示background-color
同理，距左右边的长度等于宽的一半，在图片垂直中线来一刀，则AC两个切片不会被切出来，上下边框会因为没有切片覆盖显示background-color
所以如果仅装饰边框4个角，可以采用距离边等于宽高一半的方法切割图片

## border-image-repeat
水平边要不要repeat 垂直边要不要repeat 默认拉伸
可取值：stretch 默认拉伸；repeat 重复切片；round;重复切片，但会适当调整大小，避免出现半截图片
![borderimg](/images/borderimg.jpg)
![borderimg1](/images/borderimg1.jpg)

# border-radius
设置边框外圆半径
5px ———— 4个角都设半径为5px的圆形圆角
5px/10px  ———— 4个角都设水平半径为5px，垂直半径为10px的椭圆形圆角
5px 10px  左上和右下角半径5px圆形，右上和左下半径10px的圆形圆角
5px 10px 20px  左上角半径5px圆形，右上和左下半径10px的圆形,右下角半径20px圆形圆角
5px 10px 20px 15px 左上角半径5px圆形，右上半径10px的圆形,右下角半径20px圆形,左下15p圆形圆角
5px 10px 20px 15px/10px 15px 25px 20px 四个角同时设置椭圆型圆角

当半径值小于等于边框border宽度时，border内部不会具有圆角效果，内圆半径=外圆半径-边框宽度
若相邻边宽不同，则角会从宽边平滑到窄边
表格table设置圆角时，只有将border-collapse:separate时才正常显示
如果想取消原有圆角设置，可以将对应值设置为0
特殊应用：直接通过设置容器长宽和border-radius绘制圆形，半圆，扇形，椭圆
```
width:300px
height:300px
border-radius:150px;//圆形
border-radius: 0 300px 0px 0px;//扇形

width:600px
height:300px
border-radius:150px;//椭圆形
border-radius: 300px 300px 0px 0px;//半圆
```
# box-shadow
边框阴影，由多个值配置
insert ？ 水平方向偏移（正右负左）垂直偏移（正下负上）模糊半径 伸缩半径(相当于阴影宽度)
设置insert时，设置内阴影，不设时，设置外阴影
内阴影用在img标签上无效
实例应用
1.单边阴影
box-shadow:red 0px -5px 5px -3px,给top边设置了阴影，通过设置伸缩半径-3px防止其他边模糊半径5px效果
2.四边阴影
box-shadow:0 0 10px red;//10px为模糊半径
box-shadow:0 0 0 10px red;//10px为伸缩半径,此效果相当于设置了一个宽10px的红边，但不占文档流
层级关系：外阴影--->背景色--->背景图--->内阴影--->边框
3.多层阴影
每组用逗号隔开，靠前的设置面积（伸缩半径）太大的话会遮盖之后的设置
```
//彩虹色
box-shadow: red 0px 0px 10px 10px, inset orange 0px 0px 10px 15px, inset yellow 0px 0px 10px 30px, inset green 0px 0px 10px 45px, inset blue 0px 0px 10px 60px, inset purple 0px 0px 10px 75px;
```



# background-attachment
背景图是否随页面滚动条滚动，始终不会随容器滚动条滚动
scroll ———— 滚动
fixed ———— 不滚动
# background-image

1.起始位置
background-color始终从border与margin交界线的左上角(用A表示)开始
background-image默认从padding与border交界线的左上角(用B表示)开始,但是可以通过设置background-position决定起始点
2.在Z轴上，覆盖顺序
background-color ——> background-image ——> border,conten的背景色
background-repeat值为repeat和no-repeat时,对覆盖有不同影响

## background-repeat

图片比容器小时，重复方式
no-repeat ———— 仅从B点开始铺一次,background-image不会填充border部分的background-color,图片不够大时会显示background-color
![bgimg2](/images/bgimg2.png)
repeat ———— 从B点开始,先垂直重复，再整体水平重复，background-image会覆盖border部分的background-color,图片起点还是B,然后垂直重复,整体水平重复
![bgimg1](/images/bgimg1.png)
repeat-x ———— 从B点开始，仅水平重复，不再整体垂直重复，覆盖border
repeat-y ———— 从B点开始，仅垂直重复，不再整体水平重复,覆盖border

## background-position

背景图片开始位置在padding与border交界线什么地方
两个值为长度或者百分数时，第一个值表示容器水平方向的位置，相对于left边位置；第二个值表示容器垂直方向的位置，相对于TOP边位置，可以混用
但只设一个值时，表示距离left位置，垂直方向默认为居中
两个值为关键字时，left,right,center表示水平位置，top,bottom,center表示垂直位置，
前后位置可随意，left bottom 等于 bottom left
仅设置一个值时，另一个方向默认center,例left 相当于left center,背景图位于左边垂直中间位置；center，即水平垂直居中
![bgimg3](/images/bgimg3.png)

## background-origin

同样可以重置图片开始位置，指定居于哪条线，
同时指定background-position时，先根据background-origin确定线，依线根据background-position确定位置
border-box ———— margin与border交界线
padding-box ———— border与padding交界线,默认值
content-box ———— padding与内容块交界线

## background-clip
设置背景色background-color铺设范围
border-box ———— 从margin与border交界线开始铺
padding-box ———— 从border与padding交界线开始铺
content-box ———— 从padding与内容块交界线开始铺

## background-size
以background-origin设置的值为容器,设置图片大小
auto 原始尺寸
具体长度值1个或2个
百分数1个或2个 相对容器的百分之多少，不是图片大小
contain
cover



