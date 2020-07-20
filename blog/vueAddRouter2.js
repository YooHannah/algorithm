import Vue from 'vue'
import Router from 'vue-router'
// import utils from '../common/cookieUtils'
import { cookies } from '@/common/cookieUtils'
import {Message} from 'iview'
import productBox from '@/components/products/product-box'
import httpRequestEntrance from '../common/httpRequestEntrance.js'
//静态路由
let staticRouter = [{},{},{},{},]
//默认路由 等待 与动态路由合并
let defaultRouter = {
  path: '/',
  name: 'index',
  redirect: '/portal',
  meta: {
    title: '首页',
  },
  component: () => import('@/components/index'),
  children: [{...},{....}],//待更新路由
}
Vue.use(Router)

const createRouter = () => new Router({
  routes: staticRouter,
  scrollBehavior: () => ({ // 滚动条滚动的行为，不加这个默认就会记忆原来滚动条的位置
    y: 0
  }),
})

const router = createRouter()

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

function $Message(content) {
  Message.info({
    content: content,
    duration: 5,
    closable: true
  })
}
//将动态路由拼接到默认路由中
async function createRoutes() {
  let dynamicRouters = await getDynamicRoutes()
  defaultRouter.children = defaultRouter.children.concat(dynamicRouters)
  //将待添加的路由，以数组形式传入
  return [defaultRouter,{ //404要放最后
    path: '*',
    name: 'page404',
    component: () => import('@/components/page404'),
    title: '招商云'
  }]
}

let hasMenus = false
router.beforeEach(async(to, from, next) => {
  //拉取动态路由
  if(!hasMenus){
    hasMenus = true
    let temp = await createRoutes() //拿到数据
    router.addRoutes(temp) //添加路由
    if(!to.name){ //处理刷新，刷新时，当前页面name会变成null
      next({name:to.path.substring(1)})
    }
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