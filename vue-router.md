# 一些vueRouter官方文档看到的

## 复用组件
当使用路由参数时，例如从 /user/foo 导航到 /user/bar，原来的组件实例会被复用。
因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。不过，这也意味着组件的生命周期钩子不会再被调用。

复用组件时，想对路由参数的变化作出响应的话，可以简单地 watch (监测变化) $route 对象

参数或查询的改变并不会触发进入/离开的导航守卫。
可以通过观察 $route 对象来应对这些变化，或使用 beforeRouteUpdate 的组件内守卫。

## 参数组合
如果提供了 path，params 会被忽略，query 并不会被忽略。你需要提供路由的 name 或手写完整的带有参数的 path
 path-----query   name-----params

## beforeRouteUpdate
如果目的地和当前路由相同，只有参数发生了改变 (比如从一个用户资料到另一个 /users/1 -> /users/2)，你需要使用 beforeRouteUpdate 来响应这个变化 (比如抓取用户信息)

## router-view标签
<router-view> 没有设置名字，那么默认为 default；如果设置了name，那么该视图显示路由中components中配置的name值对应的组件

## 重定向
重定向三种形式
```
1.
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: '/b' }
  ]
})

2.命名的路由
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: { name: 'foo' }}
  ]
})
3.方法，动态返回重定向目标：
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: to => {
      // 方法接收 目标路由 作为参数
      // return 重定向的 字符串路径/路径对象
    }}
  ]
})
```
导航守卫并没有应用在跳转路由上，而仅仅应用在其目标上,为 /a 路由添加一个 beforeEach 或 beforeLeave 守卫并不会有任何效果

“重定向”的意思是，当用户访问 /a时，URL 将会被替换成 /b，然后匹配路由为 /b，
/a 的别名是 /b，意味着，当用户访问 /b 时，URL 会保持为 /b，但是路由匹配则为 /a，就像用户访问 /a 一样。
```
const router = new VueRouter({
  routes: [
    { path: '/a', component: A, alias: '/b' }
  ]
})
```

## props
通过配置props属性实现多路由复用组件
```
1.如果 props 被设置为 true，route.params 将会被设置为组件属性。
const User = {
  props: ['id'],
  template: '<div>User {{ id }}</div>'
}
const router = new VueRouter({
  routes: [
    { path: '/user/:id', component: User, props: true },

    // 对于包含命名视图的路由，你必须分别为每个命名视图添加 `props` 选项：
    {
      path: '/user/:id',
      components: { default: User, sidebar: Sidebar },
      props: { default: true, sidebar: false }
    }
  ]
})

2.如果 props 是一个对象，它会被按原样设置为组件属性。当 props 是静态的时候有用
const router = new VueRouter({
  routes: [
    { path: '/promotion/from-newsletter', component: Promotion, props: { newsletterPopup: false } }
  ]
})

3.创建一个函数返回 props
const router = new VueRouter({
  routes: [
    { path: '/search', component: SearchUser, props: (route) => ({ query: route.query.q }) }
  ]
})
URL /search?q=vue 会将 {query: 'vue'} 作为属性传递给 SearchUser 组件
```
请尽可能保持 props 函数为无状态的，因为它只会在路由发生变化时起作用。如果你需要状态来定义 props，请使用包装组件，这样 Vue 才可以对状态变化做出反应

## 路由生命周期
### 全局配置
router.beforeEach:当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 等待中
```
三个参数
to: 即将要进入的目标 路由对象
from: 当前导航正要离开的路由的路由对象
next：一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数
      next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
      next(false): 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
      next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。
      next(error): 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调
```

router.beforeResolve:在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被调用

router.afterEach:不会接受 next 函数也不会改变导航本身

### 路由配置
```
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      beforeEnter: (to, from, next) => {
        // ...
      }
    }
  ]
})
```
### 组件内
```
const Foo = {
  template: `...`,
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this` 
    // 因为守卫在导航确认前被调用,因此即将登场的新组件还没被创建。
    //可以通过传一个回调给 next来访问组件实例。在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数。
    next(vm => { //是支持给 next 传递回调的唯一钩子，beforeRouteUpdate，beforeRouteLeave都不支持，因为可以访问的到
      // 通过 `vm` 访问组件实例
    })
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
```
### 完整的导航解析流程

1. 导航被触发。
2. 在失活的组件里调用离开守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
5. 在路由配置里调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

## 数据获取
### 导航完成后获取数据
```
created () {
  // 组件创建完后获取数据，
  // 此时 data 已经被 observed 了
  this.fetchData()
},
watch: {
  // 如果路由有变化，会再次执行该方法
  '$route': 'fetchData'
},
```
### 在导航完成前获取数据

```
beforeRouteEnter (to, from, next) {
  getPost(to.params.id, (err, post) => {
    next(vm => vm.setData(err, post))
  })
},
// 路由改变前，组件就已经渲染完了
// 逻辑稍稍不同
beforeRouteUpdate (to, from, next) {
  this.post = null
  getPost(to.params.id, (err, post) => {
    this.setData(err, post)
    next()
  })
},
methods: {
  setData (err, post) {
    if (err) {
      this.error = err.toString()
    } else {
      this.post = post
    }
  }
}
```
## 滚动行为
scrollBehavior 这个功能只在支持 history.pushState 的浏览器中可用。
```
const router = new VueRouter({
  routes: [...],
  scrollBehavior (to, from, savedPosition) {

    // return 期望滚动到哪个的位置
    if (to.hash) {
      return {
        selector: to.hash //模拟“滚动到锚点”的行为
      }
    }
    if (savedPosition) {
      return savedPosition //返回 savedPosition，在按下 后退/前进 按钮时，就会像浏览器的原生表现那样
    } else {
      return { x: 0, y: 0 } //让页面滚动到顶部
    }
    return new Promise((resolve, reject) => { //返回一个 Promise 来得出预期的位置描述
      setTimeout(() => {
        resolve({ x: 0, y: 0 })
      }, 500)
    })
  }
})
```
