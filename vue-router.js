/**
 * 工作流程：
 * URL改变->出发监听事件->改变vue-router里的current变量->
 * 触发current变量的监听者->获取新组件->render新组件
 */
class HistoryRoute{
  constructor(){
    this.current=null
  }
}
class vueRouter{
  constructor(options){
    this.history= new HistoryRoute;
    this.mode = options.mode || 'hash'
    this.routes = options.routes || []
    this.routesMap = this.createMap(this.routes)
    this.init()
  }
  Init(){
    if(this.mode=='hash'){
      //如果没有#号，自动加上#
      location.hash?"":location.hash='/'
      //监听hash改变
      window.addEventListener('load',()=>{
        //slice去掉#号
        this.history.current=location.hash.slice(1)
      })
      window.addEventListener('hashchange',()=>{
        this.history.current=location.hash.slice(1)
      })
    }else{
      location.pathname?"":location.pathname='/'
      window.addEventListener('load',()=>{
        this.history.current=location.pathname
      })
      window.addEventListener('hashchange',()=>{
        this.history.current=location.pathname
      })
    }
  }
  //将路由对象[{path:'xxx',component:a}]转成：{xxx:a}
  createMap(routes){
    return routes.reduce((memo,current)=>{
      memo[current.path] = current.components
      return memo
    })
  }  
}
//定义属性标签 get set ===>供VUE.use使用
//VUE.use(xxxx) xxx是一个函数时直接运行xxx函数，xxx是一个对象或者类时，运行其上面的install方法
vueRouter.install = function(Vue){
  Vue.mixin({
    beforeCreate(){
      //this指向当前组件实例，this.$options指向创建VUE实例时传入的配置项
      if(this.$options&&this.$option.router){
        //把当前实例挂在_root上
        this._root = this
        this._router = this.$options.router
        Vue.util.defineReactive(this,'current',this._router.history) //双向绑定，对路由变化进行监听，
      }
      Object.defineProperty(this,"$router",{ //能够获取$router但不能修改的原理。防止用户修改_router
        get(){
          return this._root._router;
        }
      })
    }
  })
  Vue.components('router-view',{
    render(r){
      //拿到当前路径
      //this指向proxy,当前组件代理对象；this._self当前组件实例化对象；this._self._root当前组件对象
      let current = this._self._root._router.history.current
      let routeMap = this._self._root._router.routeMap
      return r(routeMap[current])
    }
  })
}
module.exports = vueRouter
