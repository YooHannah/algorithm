 Slot复用
# 背景
项目列表组件需要实现点击自动增加一行,可展示自定义内容的可扩展内容
列表table组件被应用在page组件，page组件被应用在具体业务页面，slot的具体内容在业务页面传递进去
问题难点
1.多层组件slot传递
2.同一个slot在table组件中循环使用在多处时，不会被渲染
# 原理
1.slot 只能一层一层传递，所以解决多层传递，就是在page层应用table时，增加slot接收业务页面传递进来的slot具体内容
2.同名slot不能在同一组件被重复渲染，即不允许有重名slot
```
重名的 Slots 移除
同一模板中的重名 <slot> 已经弃用。当一个 slot 已经被渲染过了，那么就不能在同一模板其它地方被再次渲染了。如果要在不同位置渲染同一内容，可一用 prop 来传递。
```
# 回归问题

##多层组件slot传递
在page层使用table组件时将&lt;slot&gt;&lt;/slot&gt;放在table组件中，将slot内容当作table的slot传递给table
```
1.业务页面具体自定义内容传入
<PageComponent :pageConfig="pageConfig" ref="child">
    <div slot='tableExtend'>
    <extendTable :detailConfig="pageConfig.table.isExtend.detailConfig"
        v-if="pageConfig.table.isExtend.detailConfig[0].data.length>0">
    </extendTable>
    <div style="padding: 10px;" v-if="pageConfig.table.isExtend.detailConfig[0].data.length === 0">暂无数据</div>
    </div>
</PageComponent>

2.page组件table部分
<section class="page-table">
    <tableTemp :table="pageConfig.table" :pageConfig="pageConfig" @sendIds="receiveIds" ref="refTest">
        <slot :name='pageConfig.table.isExtend.slot' v-if="pageConfig.table.isExtend"></slot> //将slot放在这里
    </tableTemp>
</section>
3.table部分
 利用template实现列表行和扩展行一对一
 <template v-for="(value,index) in table.tableData"> 
    <tr :key="index">
        <td v-for="(val,i) in table.tableEle" v-if="val.display" :key="i">
            <div class="extendStyle" v-if='table.isExtend && i==firstShow'>
                <a v-show="index != currentActive" @click="loadDetail(value,index)"><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a> //loadDetail去调父组件函数获取详情数据
                <a v-show="index === currentActive" @click="loadDetail(value,index)" class="active"><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a>
            </div>
            <div v-if='!table.isExtend'>
            ...
            </div>
        </td>
    </tr>
    //在组装行的时候增加备用扩展行，利用第三方变量控制扩展行显示隐藏
    <tr v-if="index === currentActive" :key="index+0.5" class='bgc'>  
        <td :colspan='tdNumber' id='extend1'>//合并单元格
            <slot :name='table.isExtend.slot'></slot>//直接这样是不能渲染的，因为这样通过循环会出现多个同名slot
        </td>
    </tr>
</template> 
//去调父组件函数获取详情数据
loadDetail(item, index) {
    this.currentActive = this.currentActive === index ? -1 : index
    this.$store.commit('changeTableExtendActive',this.currentActive)
    if(this.currentActive === -1){
        return
    }
    let func = this.pageConfig.table.isExtend.func
    this.$parent.$parent[func](item,index)
},
```
## slot重用

### 方法一 作用域插槽
在子组件中将slot中用到的数据传递给slot标签的data属性,
父组件借助slot-scope属性,获取子组件中slot标签的data属性传递的数据
即可应用在slot模板中，另外slot模板中如果用到点击事件回调函数，可以直接在父组件中定义，直接调用

注意slot-scope绑定的变量在使用时,子组件传递的实际值被包含在一个data属性中，所以需要通过slotscope.data.xxxxx去获取
```
爷爷组件
<PageComponent :pageConfig="pageConfig" ref="child">
    <template slot-scope="isExtend">
        <extendTable :detailConfig="isExtend.data.detailConfig" //包含的data中
            v-if="isExtend.data.detailConfig[0].data.length>0">
        </extendTable>
        <div style="padding: 10px;" v-if="isExtend.data.detailConfig[0].data.length === 0">暂无数据</div>
    </template>
</PageComponent>
父组件
<section class="page-table">
    <tableTemp :table="pageConfig.table" :pageConfig="pageConfig" @sendIds="receiveIds" ref="refTest">
        <slot :data='pageConfig.table.isExtend' v-if="pageConfig.table.isExtend"></slot>
    </tableTemp>
</section>
子组件
<tr v-if="index === currentActive" :key="index+0.5" class='bgc'> 
    <td :colspan='tdNumber' id='extend1'>
        <slot :data='table.isExtend'></slot> //直接使用
    </td>
</tr>
```
# 插曲
一个业务场景需要同时渲染多个table,即通过一次配置，可渲染多个table的组件，
一个同事将循环table的逻辑放在了table组件本身里面，造成table本身是一个可循环输出多个table的组件
这样如果一开始在爷爷组件放入多个具名slot,因为不能在子组件slot标签添加name属性（会循环出同名slot），
那所有的slot都会出现在每一个table组件中
因此有了方法二

### 方法二
利用page层传递slot到table组件思想，在table中使用slot时，将其包裹在一个新组件中，
利用新组件复用，实现slot组件复用，(相当于将slot传递到新组件------->待查原理)
而新组件通过render函数依据slot节点生成
```
子组件
 <tr v-if="(indexx+'-'+index) === currentActive" :key="index+0.5" class='bgc'>
    <td :colspan='itemConfig.config.length'>
        <!-- slot标签要放在tdslot标签充当slot,否则详情数据拉回来之后不会进行更新组件 -->
        <tdSlot :name='itemConfig.isExtend.slot'> <slot :name='itemConfig.isExtend.slot'></slot> </tdSlot>
        <!-- tdslot在main.js中定义 -->
    </td>
</tr>
loadDetail(item, indexx, index) {
    this.currentActive = this.currentActive === indexx+'-'+index ? -1 : indexx+'-'+index //通过多层key判断展开
    if(this.currentActive === -1){
        return
    }
    let func = this.detailConfig[indexx].isExtend.func
    this.$parent.$parent[func](item,indexx, index)
}
新组件带着slot生成
Vue.component('tdSlot', {

  render(createElement) {
    function deepClone(vnodes, createElement) {
      function cloneVNode (vnode) {对slot节点进行深度复制
        const clonedChildren = vnode.children && vnode.children.map(vnode => cloneVNode(vnode))
        const cloned = createElement(vnode.tag, vnode.data, clonedChildren)
        cloned.text = vnode.text
        cloned.isComment = vnode.isComment
        cloned.componentOptions = vnode.componentOptions
        cloned.elm = vnode.elm
        cloned.context = vnode.context
        cloned.ns = vnode.ns
        cloned.isStatic = vnode.isStatic
        cloned.key = vnode.key

        return cloned
      }
      const clonedVNodes = vnodes.map(vnode => cloneVNode(vnode))
      return clonedVNodes
    }
    var slots = this.$parent.$slots.default //从父组件拿到slot
    var slot = null
    for(let i=0;i<slots.length;i++){
      if(slots[i].data && this.name === slots[i].data.slot){ //多个slot，拿到自己table.isExtend配置的那一个
        slot = slots[i]
        break
      }
    }
    return createElement('div',{class:'tdslot'},deepClone([slot], createElement)) //做一下深度复制
    <!-- return createElement('div',{class:'tdslot'},[slot]) --> 这样也可以
  },
  props:{
    name:{
      type:String,
      default:''
    }
  }
})

父组件
<detailsTable v-if="detailPageConfig.detailConfig" :detailConfig="detailPageConfig.detailConfig">
    <slot v-for='(item,index) in detailPageConfig.detailConfig' v-if='item.isExtend' :name='detailPageConfig.detailConfig[index].isExtend.slot' ></slot>
</detailsTable>
爷爷组件
<detailsPage :detailPageConfig="detailPageConfig">
    <div slot='tableExtend-1'> //多个slot 并列写即可
    <detailsTable :detailConfig="detailPageConfig.detailConfig[1].isExtend.detailConfig"
        v-if="this.detailPageConfig.detailConfig[1].isExtend.detailConfig[0].data.length>0">
    </detailsTable>
    <div v-if="this.detailPageConfig.detailConfig[1].isExtend.detailConfig[0].data.length<1">暂无数据</div>
    </div>
</detailsPage>
```
# 方法三
其实之所以会出现重名slot是因为table的大循环逻辑放在了自己组件内，
其实输出多个table的逻辑放在page层即可，table还是独立的table，
这样插入slot时就不是同名slot，各自slot,插入各自table
```
父组件
<template v-for='(item,index) in detailPageConfig.detailConfig'>
    <detailsTable :detailConfig="item" :key='index'>
    <slot v-if='item.isExtend' :name='item.isExtend.slot' ></slot>
    </detailsTable>
</template>
子组件
<tr v-if="index === currentActive" :key="index+0.5" class='bgc'>
    <td :colspan='detailConfig.config.length'>
        <slot></slot>//只要将自己的slot放进来即可
    </td>
</tr>
```
[参考资料](https://www.jianshu.com/p/c735cc612e63)
[参考资料](https://cnodejs.org/topic/58c0ad17d282728c0ec4029a)
[参考资料](https://segmentfault.com/a/1190000010913794)
