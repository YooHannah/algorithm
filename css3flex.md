探索flex布局
盒状弹性布局，盒子大小可以随容器大小变化

# 容器属性

<b>display</b>  决定开始作为弹性容器

—— flex : 将容器设置为弹性伸缩容器
—— inline-flex :使弹性容器成为单个不可分的行内级元素

<b>flex-direction</b> 决定主轴方向
—— row:水平向右，子模块书写顺序横向排列，开头的放在最左端,子模块不设宽度情况下宽度由内容决定
—— row-reverse:水平向左，子模块书写顺序横向排列，开头的放在最右端，子模块不设宽度情况下宽度由内容决定
—— column:从上到下，子模块书写顺序纵向排列，开头的放在最上面，子模块不设高度情况下高度由内容决定
—— column-reverse:从下到上，子模块书写顺序纵向排列，开头的放在最下面，子模块不设高度情况下高度由内容决定
!(flex1.png)[flex1.png]

<b>flex-wrap</b> 对于子模块是否超出最大宽度或高度时要不要换行/列，默认不换行/列,宽/高度自动按所有模块比例缩小
—— nowrap:默认值
—— wrap:换行,水平排列的子模块多出的部分沿column方向排第二行;纵向排列的子模块多出的部分沿row方向排第二列;
—— wrap-reverse:换行，水平排列的子模块多出的部分沿column-reverse方向排第二行；纵向排列的子模块多出的部分沿row-reverse方向排第二列;
!(flex2.png)[flex2.png]
!(flex3.png)[flex3.png]
!(flex4.png)[flex4.png]

<b>flex-flow</b> :[flex-direction][flex-wrap]flex-direction和 flex-wrap的复合属性,
先按flex-direction排列，超出部分用flex-wrap决定
!(flex5.png)[flex5.png]

<b>justify-content</b> 在剩余子模块允许换行或者有剩余宽度或者高度时相对主轴的对齐方式，超出但不换行时，按比例放缩
—— center：按实际间距位于主轴中心
—— flex-start:按实际间距位于主轴开始排列的位置，第一个贴边
—— flex-end :按实际间距和顺序向主轴方向排列，最后一个贴边
—— space-between ：第一个和最后一个挨着边框，其它间距相等
—— space-around：第一个和最后一个离边框距离为子模块间距的一半
!(flex6.png)[flex6.png]

<b>align-items</b> 子模块整体相对侧轴的位置,row和row-reverse侧轴为column,column和column-reverse侧轴为row
—— center：侧轴中心
—— flex-start:侧轴起点位置
—— flex-end :侧轴终点位置
—— stretch：侧轴方向属性值未设置时，拉伸子模块该属性为容器对应属性值，弹性元素被在侧轴方向被拉伸到与容器相同的高度或宽度。
—— baseline:所有模块的内容第一行对齐
!(flex7.png)[flex7.png]

<b>align-content</b> 决定多行或者多列在侧轴排列方式，row和row-reverse侧轴为column,column和column-reverse侧轴为row
—— center：整体在侧轴中心
—— flex-start:整体在侧轴起点位置
—— flex-end :整体在侧轴终点位置
—— stretch：侧轴方向属性值未设置时，拉伸子模块该属性填满容器对应属性值
—— space-between ：第一行/列和最后一行/列挨着边框，其它间距相等
—— space-around:第一行/列和最后一行/列离边框距离为子模块间距的一半
!(flex8.png)[flex8.png]

# 模块属性
<b>align-self</b>  自己决定相对侧轴的位置
属性值同align-items,默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

<b>order</b> 决定模块排列顺序，值越大，越最后被排列

<b>flex-grow</b> 放大比例，当容器空间有剩余时按此比列分配内存空间，填满，比如
宽度1000px的容器，4个子模块一共占了800，剩200，4个模块该值分别设为2 ：1：1：1，
则200被分为5份，一份40，每个模块按比例 分别拿80，40，40，40 放大自己的面积

<b>flex-shrink</b> 缩小比例，当容器空间有不足时按此比列分配缩小子模块，比如
容器宽800，5个模块需要占1000，差200，5个模块该值比为4：1：1：1：1，
则200被分为8份，一份25，，每个模块按比例分别减少100，25，25，25，25 缩小自己的面积

<b>flex-basis</b> 在分配多余空间/缩小之前，项目占据的主轴空间，用于计算一共需要多少空间时放大还是缩小
auto 默认值，子模块本来大小

<b>flex</b>  ：none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ] 以上三项复合属性




