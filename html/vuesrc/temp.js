import Vue from 'vue'
import Router from 'vue-router'
// import utils from '../common/cookieUtils'
import { cookies } from '@/common/cookieUtils'
import {Message} from 'iview'
import productBox from '@/components/products/product-box'
import httpRequestEntrance from '../common/httpRequestEntrance.js'
//静态路由
let staticRouter = [
  {
   
  },
  {
 
  },
  {
  
  },
  {
    path: '/console',
    name: 'console',
    redirect: '/ecsManage',
    component: () => import('@/components/console/index'),
    title: 'xxx',
    children: [
     
    ]
  },
]
//默认路由 等待 与动态路由合并
let defaultRouter = {
  path: '/',
  name: 'index',
  redirect: '/portal',
  meta: {
    title: 'xxxx',
  },
  component: () => import('@/components/index'),
  children: [
    
  ]
}
Vue.use(Router)

const createRouter = () => new Router({
  routes: staticRouter,
  scrollBehavior: () => ({ // 滚动条滚动的行为，不加这个默认就会记忆原来滚动条的位置
    y: 0
  }),
})

const router = createRouter()

function getDynamicRoutes(){
  return httpRequestEntrance.httpRequestEntrance('GET', '', '', resData => {
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

async function createRoutes() {
  let dynamicRouters = await getDynamicRoutes()
  defaultRouter.children = defaultRouter.children.concat(dynamicRouters)
  return [defaultRouter,{
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
    let temp = await createRoutes()
    router.addRoutes(temp)
    if(!to.name){ //处理刷新
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