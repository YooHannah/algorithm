二级菜单实现

# 背景
page A是一个管理页面，数据通过table 展示
page B是一个详情页面，通过page A 中的一条数据跳转链接进来
page B数据获取时的参数需要在page A跳转时带进来
page B 本来只是一个简单页面,现在要在page B中添加一列菜单，可以导航多个不同内容详情
即现在page A要跳转的是一个带菜单的页面，点击每个菜单跳转不同的页面

# 原理
1.vue-router配置时，children属性配置的子页面，在访问时，会在父页面的router-view标签部分进行填充
如果父页面没有router-view标签子页面内容就没地方展示
菜单就放在父页面，点击跳转子页面路由
2.因为页面跳转完成后，当前路由对象不会携带自己的children属性，给子路由配置title，父页面拿不到
所以父页面的菜单映射关系需要在其他地方配置，传递进来
# 解决

## 方案一
子菜单名和对应路由的映射，放在page A跳转配置中，page A 配置的点击跳转的页面是其中一个子路由
```
{title: '名称', value: 'name', display: true,
      shadow: {path: 'Adetail_C', key: '',title:'AAAA',submenu:[{
        path:'Adetail_C',name:'C'
      },{
        path:'Adetail_D',name:'D'
      }]}, 
    },
```

新增子菜单路由页面page A-detail-router,子菜单映射页面page C和page D

页面page A-detail-router中，可以通过this.$route对象拿到page A配置的菜单映射关系，从而渲染菜单
切换子页面时,需要增加把参数传递到子页面中的逻辑

page C和page D根据路由中传递过来的page A点击数据的信息进行数据请求和页面渲染

在项目路由配置文件中配置路由

```
{ path: 'A',  name: 'A', title: 'XX管理', meta: {keepAlive: true}, component: () => import('@/pageA') },
{ path: 'AdetailRouter',  name: 'AdetailRouter', title: 'XX详情', meta: {keepAlive: true}, component: () => import('@/A-detail-router'), 
    children:[{
    path:'/Adetail_C',name: 'Adetail_C',meta: {previousMenu: 'A'}, component: () => import('@/Adetail_C')
    },{
    path:'/Adetail_D',name: 'Adetail_D',meta: {previousMenu: 'A'},component: () => import('@/Adetail_D')
    }]
},
```
children配置path时，以‘/’开头和不以‘/’开头区别：
以'/'开头最终访问路径就是配置路径‘#/子path’，相当于子路由当一级路由
但不以‘/’开头最终的访问路径是‘#/父path/子path’,
这里使用‘/’开头是因为更外层菜单，在跳转page A同级路由时使用的是push({path:xxx})
如果使用不以‘/’开头的配置，跳转page A同级路由，路径就会变成‘#/父path/xxx’，即父路径下跳转
会因为没有相应配置路由找不到页面，所以使用‘/’开头，当作父路由跳转
其实在跳转page A同级路由时使用的是push({name:xxx}),就可以直接解决‘#/父path/xxx’问题，
跳转正确页面

缺点：
直接通过浏览器刷新子页面时，路由对象的params属性数据清空，
路由页面菜单映射没有数据支持，菜单没有内容
子页面路由因此也拿不到参数，无法请求数据
动作流向只有利用路由对象的meta属性的previousMenu跳转回page A

## 方案二
子菜单名和对应路由的映射放在单独json文件中，利用子菜单名字获取映射关系
```
//submenu.json
{
    Adetail:{
        title:'AAAA'
        submenu:[{
            name:'Adetail_C',//路由里配置的name
            label:'C',
            show:true //之后根据路由参数query决定是否显示该菜单
        },
        {
            name:'Adetail_  D',
            label:'D',
            show:true
        }]
    }
}
```
在路由页面page A-detail-router中根据访问的子菜单路由名获取二级菜单,这样解决刷新页面菜单数据无处获取的问题

使用动态路由传递参数id保证页面刷新时子页面params至少有一个属性可以依赖来获取数据
更改路由配置
```
{ path: 'A',  name: 'A', title: 'XX管理', meta: {keepAlive: true}, component: () => import('@/pageA') },
{ path: 'Adetail',  name: 'Adetail', title: 'XX详情', meta: {keepAlive: true}, component: () => import('@/A-detail-router'), 
    children:[{
    path:'C/:id',name: 'Adetail_C',meta: {previousMenu: 'A'}, component: () => import('@/Adetail_C')
    },{
    path:'D/:id',name: 'Adetail_D',meta: {previousMenu: 'A'},component: () => import('@/Adetail_D')
    }]
},
```
‘：id’对应路由对象中params属性的id属性，所以访问时，一定要在跳转的路由中配置{params:{id:xxxxxx}}
更改路由页面page A-detail-router中跳转其他路由页面时,参数配置
```
gotoPage (val,index) {
    this.active = index
    this.$router.push({
        name: val.name,
        params:{id:this.$route.params.id}, //给其他子页面传递id
        query:this.$route.query//其他自定义参数
    })
},
```
这样访问子页面时路径就变成'#/Adetail/C/xxxxxxxxxxxxxxxx'
以上处理基本解决掉方案一问题

后续需要根据page A 数据的其他属性值决定菜单显示,所以在配置跳转时配置要传递的属性key
在跳转时，根据KEY获取值，组装成都对象，放在query中使用
```
//配置：
{title: '名称', value: 'dbname', display: true,link: {path: 'databaseDetail_outline', key: 'dbinstance_id',query:['dbtype.dbtype']}}
link属性即与跳转相关的配置，
path:跳转路由名
key:以数据哪个属性当id，字符串
query:需要传递的其他参数，字符串数组
//列表点击跳转
jump (item, val) {
     //根据key获取值，key对应的可能不是子属性，而是孙属性，或者更深层次属性，valueFromExpression函数用于获取深层属性值
    let id = valueFromExpression(item, val.link.key) 
    let router = {
        name: val.link.path,
        params: {id: id}
    }
    if(val.link.query){//根据key值组装传参对象
        router.query = val.link.query.map(key=>{return {[key]:valueFromExpression(item, key)}}).reduce((result,item)=>{return Object.assign(result,item)},{})
    }
    this.$router.push(router)
    },
```
因为打算将路由页面page A-detail-router作为公共页面，page A同级页面的其他页面也可以使用
所以将判断子菜单是否显示的逻辑放在跳转的那个子页面

```
//page A-detail-router
<template>
    <div class="subcontainer" v-if="submenuConfig">
      <div class="submenu">
        <!-- <div  class="subTitle" @click="goBack()">{{submenuConfig.title}}</div> -->
        <div  class="subTitle" @click="goBack()"><i class="fa fa-chevron-left"></i></div>
        <template v-for="(item,index) in submenuConfig.submenu">
          <div v-if='item.show' @click="gotoPage(item,index)" :key="index" class="subbtn" :class="active===index?'subactive':''">
            <a>{{item.label}}</a>
          </div>
        </template>
      </div>
      <div class="content">
        <router-view></router-view>
      </div>
  </div>
</template>
<script>
  import submenuText from '../../../common/submenu'
  export default { 
    name: 'submenu_detail',
    data() {
      return {
        submenuConfig:null,
        active:0
      }
    },
    mounted() {
      let routeName = this.$route.name
      this.submenuConfig = submenuText[routeName.split('_')[0]] //获取菜单配置
      this.active = this.submenuConfig.submenu.findIndex((item)=>{return item.name === routeName})
    },
    methods: {
      gotoPage (val,index) {
        this.active = index
        this.$router.push({
          name: val.name,
          params:{id:this.$route.params.id},
          query:this.$route.query
        })
      },
      goBack(){
        this.$router.push({
          name:this.$route.meta.previousMenu
        })
      }
    },
    components: {
    }
  }
</script>
<style lang="less" scoped>
  .subcontainer{
    display: flex;
    flex-grow: row  nowrap;
    justify-content: space-between;
    align-content:stretch;
    margin: -20px;
    .submenu{
      display: flex;
      flex-flow: column;
      align-content: center;
      width: 200px;
      flex:none;
      background-color: #EAEDF1;
      height: 100%;
      position: absolute;
      .subTitle{
        //内容为标题时样式
        // font-weight: bold;
        // text-indent: 20px;
        // height: 70px;
        // line-height: 70px;
        // background: #D9DEE4;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;
        font-weight: bold;
        height: 70px;
        line-height: 70px;
        background: #D9DEE4;
        font-size: 20px;
        color: #546478;
        text-align: center
      }
      .subTitle:hover{
        color: #0080FF;
      }
      .subbtn{
        width: 100%;
        font-size: 15px;
        text-align: center;
        padding: 10px 0px;
        a{
          color:#000;
        }
      }
      .subbtn:hover{
        background-color: #f8f8f8;
        background: #f8f8f8;
      }
      .subactive{
          background-color: #fff;
        background: #fff;
      }
    }
    .content{
      flex:1;
      padding: 20px;
      margin-left: 200px;
    }
  }
</style>

//子菜单页面
mounted() {
      if(this.$route.query['dbtype.dbtype'] != 'mysql'){
        this.$parent.submenuConfig.submenu[1].show = false
      }else{
        this.$parent.submenuConfig.submenu[1].show = true
      }
      this.getDetail(this.$route.params.id)
    },
```