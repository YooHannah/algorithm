# 问题/背景
table 的 td 内容在内容较多时会自动进行省略处理，然后鼠标滑过弹层显示具体内容

td内容还可以配置在线编辑，鼠标滑过，可以显示小笔图标，点击小笔图标或者td块都可以进行在线编辑然后回车或者鼠标点击输入框之外的地方都可以提交发送给后台

table被包裹在一个div1中,只允许出现水平方向滚动条，不出现垂直方向滚动条
```
.div1{
  overflow-x: auto;
  overflow-y: hidden;
}
```
出现的问题就是，如果最后几行的内容过多，弹层显示具体内容时弹层会被遮挡，不能正常飘出来
<!position1>

# 原理知识
父元素设置position:relative,子元素设置position:absolute,配套使用时，子元素才会会在z轴上相对父元素进行xy面的定位
如果最近父元素没有设置position:relative，那么会往父元素的父元素找，看是否设置，如果设置，则相对爷爷元素进行XY面定位，如果没有继续往上找，以此类推
即会相对父元素及以上元素中靠近自己最近的，设置了position:relative的长辈元素进行相对定位

# 分析
弹层没有按照预期可以弹到div1以外的地方,被困在div1里面，加上div1不能垂直方向滚动，说明弹层没有相对div1定位,
解除div1垂直方向的滚动限制，弹层把div1在垂直方向上撑起来了，滚动滚动条，可以看完整的弹层内容，说明弹层相对div1的子元素定位了，
即从盛装省略内容的标签到div1的标签中，有标签设置了position:relative，

通过查找发现，在线编辑功能的小笔图标使用了position:absolute相对定位，在它最近的div2标签上设置了position:relative，
而div2标签包含了弹层所在标签，属于div1子元素，所以弹层就会相对div2定位，沿Z轴飘在div2这一层上面，就弹不到div1以外了

# 解决
将div2上position:relative去掉，给在线编辑功能的小笔图标设置position:absolute的标签div3外加div4,设置position:relative

```
解决前：
<div1 style='position:relative'>
  <table>
    <tbody>
    <tr>
      <td>
      <div2 style='position:relative'>
        <div3 style="position:absolute"><i class="fa fa-pencil" ></i></div3>
        <popwindow>具体内容</popwindow> /** 组件弹窗div设置有position:absolute**/
      </div2>
      </td>
    </tr>
    </tbody>
  </table>
</div1>

解决后：
<div1 style='position:relative'>
  <table>
    <tbody>
    <tr>
      <td>
      <div2>
        <div4 style='position:relative'>
          <div3 style="position:absolute"><i class="fa fa-pencil" ></i></div3>
        </div4>
        <popwindow>具体内容</popwindow> /** 组件弹窗div设置有position:absolute**/
      </div2>
      </td>
    </tr>
    </tbody>
  </table>
</div1>
```
普通省略内容鼠标滑过
<!position2>
在线编辑内容省略时，鼠标滑过
<!position3>



