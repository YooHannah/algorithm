import Vue from 'vue'
import Router from 'vue-router'
import {Message} from 'iview'
import productBox from '@/components/products/product-box'
let staticRouter = [{...},{...},{...},{...},{
  path: '/',
  name: 'index',
  redirect: '/portal',
  meta: {
    title: '首页',
  },
  component: () => import('@/components/index'),
  children: [] //待更新路由
},{
  path: '*',
  name: 'page404',
  component: () => import('@/components/page404'),
  title: '404页面'
}]
Vue.use(Router)

const createRouter = () => new Router({
  routes: staticRouter,
  scrollBehavior: () => ({ // 滚动条滚动的行为，不加这个默认就会记忆原来滚动条的位置
    y: 0
  }),
})

const router = createRouter() //生成VUE使用的路由对象
//获取动态路由
function getDynamicRoutes(){
  return httpRequestEntrance.httpRequestEntrance('GET', '', '', resData => {
    let routerArr = resData.map(item => { //整理动态路由
      return  {
        path: item.url,
        name: item.url,
        meta: {productId: item.id},
        component: productBox, //动态获取的组件
        title: item.title
      }  
    })
    return routerArr
  })
}

function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}
//将动态路由拼接到静态路由中
async function createRoutes() { 
  let dynamicRouters = await getDynamicRoutes()
  staticRouter[4].children = staticRouter[4].children.concat(dynamicRouters)
  return staticRouter
}
//重写addRoutes方法
router.$addRoutes = (params) => { 
  router.matcher = new Router().matcher
  //去重
  let routes = params[4].children
  for(let i = 0;i<routes.length;i++){
    let name = routes[i].name
    let arr = routes.slice(i+1)
    for(let j=0;j<arr.length;j++){
      if(arr[j].name === name){
        arr.splice(j,1)
        routes.splice(j+i+1,1)
        j--
      }
    }
  }
  router.addRoutes(params)
}
//只获取一次动态路由标志
let hasMenus = false
router.beforeEach(async(to, from, next) => {
  //刷新逻辑---静态路由
  if(from.path !='/' && to.path != from.path){
    localStorage.removeItem('DPath')
  }
  //刷新逻辑---动态路由
  if(localStorage.getItem('DPath')){
    let {path:DPath,meta} = JSON.parse(localStorage.getItem('DPath')) //在动态路由加载后将当前路由存到localStorage
    if(DPath === location.hash.substr(1)){
      if(!staticRouter[4].children.includes(item=>item.name === DPath.substring(1))){ //如果当前路由配置不含有当前动态路由配置
        staticRouter[4].children = staticRouter[4].children.concat([{ 
          path: DPath,
          name: DPath.substring(1),
          meta: meta,
          component: productBox,
          title: '招商云'
        }])
      }
      localStorage.removeItem('DPath')
      router.$addRoutes(staticRouter) //先把当前路由加到配置里面
      router.replace({path:DPath}) 
    }
  }
  //拉取动态路由
  if(!hasMenus){
    try {
      await createRoutes()
      router.$addRoutes(staticRouter)
      // 还有一种情况----直接在地址栏里输入动态路由，但是localStorage里并没有存储这个地址，此时会跳到404， 需要解决这种场景
      if (from.path == '/' || to.path == from.path) {
        if (staticRouter[4].children.findIndex(item=>item.name === location.hash.substr(2)) > -1) {
          localStorage.removeItem('DPath')
          router.replace({path:location.hash.substr(1)})
        }
      }
    } catch (error) {
      resetRouter()
    }
    hasMenus = true
  }
  if (to.matched.some(res => res.meta.requireAuth)) {// 判断是否需要登录权限
    cookies.getAuthorization().then(token=>{
      if(!token){
        next({
          name: 'login',
          params: {from: to.name}
        })
      }else{
        next()
      }
    })
  } else {
    next()
  }
})
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  // const targetPath = router.history.pending.fullPath
  if (isChunkLoadFailed) {
    // router.replace(targetPath)
    $Message('系统更新，页面将进行刷新操作！')
    window.location.reload()
  }
})
export default router
