动态添加路由

# 背景
需要将动态路由添加到当前静态路由的子路由中
即在路由的children属性中添加新路由
# 原理
使用router.addRoutes方法API进行添加
# 解决办法

在beforeEach方法中请求动态路由进行添加，
通过设置flag,保证动态路由仅请求一次

# 问题

## 直接增加同名路由无法覆盖

添加路由记录时，如果之前已经添加过，则只会警告，不会更新
所以如果想通过传入不同的children进行子路由更新无法实现
```
function addRoutes (routes) {
  createRouteMap(routes, pathList, pathMap, nameMap);
}

routes.forEach(function (route) {
  addRouteRecord(pathList, pathMap, nameMap, route);
});

function addRouteRecord ( pathList, pathMap, nameMap ) {
  if (name) {
    if (!nameMap[name]) { 
      nameMap[name] = record;
    } else if ( !matchAs) { //直接警告，不更新
      warn(
        false,
        "Duplicate named routes definition: " +
          "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

```
解决办法一

拼接好路由后，通过重新生成matcher对象，清空原始路由信息，再将最终路由添加进去
[详见]()
缺点：容易引发各种问题，且引起重复路由

解决办法二

按照API规则添加路由
```
router.addRoutes(routes: Array<RouteConfig>)
动态添加更多的路由规则。参数必须是一个符合 routes 选项要求的数组。
```
将待更新的路由对象抽离，拿到动态路由拼接好后，与404路由组成数组，直接添加路由
[详见]()

## 刷新后页面路由name为null,无法正常跳转
如果直接再在next函数中添加跳转信息会引起无线循环
```
History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
var queue = [].concat(
  // in-component leave guards
  extractLeaveGuards(deactivated),
  // global before hooks
  this.router.beforeHooks,
  // in-component update hooks
  extractUpdateHooks(updated),
  // in-config enter guards
  activated.map(function (m) { return m.beforeEnter; }),
  // async components
  resolveAsyncComponents(activated)
);

this.pending = route;
var iterator = function (hook, next) {
  if (this$1.pending !== route) {
    return abort()
  }
  try {
    hook(route, current, function (to) { 
      if (to === false || isError(to)) {
        // next(false) -> abort navigation, ensure current URL
        this$1.ensureURL(true);
        abort(to);
      } else if (
        typeof to === 'string' ||
        (typeof to === 'object' &&
          (typeof to.path === 'string' || typeof to.name === 'string'))
      ) {
        // next('/') or next({ path: '/' }) -> redirect
        abort();
        if (typeof to === 'object' && to.replace) { 
          this$1.replace(to);
        } else { 
          this$1.push(to); //引起递归调用
        }
      } else {
        // confirm transition and pass on the value
        next(to);
      }
    });
  } catch (e) {
    abort(e);
  }
};
}
History.prototype.push = function push (location, onComplete, onAbort) {
  var this$1 = this;

  var ref = this;
  var fromRoute = ref.current;
  this.transitionTo(location, function (route) {
    pushState(cleanPath(this$1.base + route.fullPath));
    handleScroll(this$1.router, route, fromRoute, false);
    onComplete && onComplete(route);
  }, onAbort);
};
History.prototype.transitionTo = function transitionTo (
  location,
  onComplete,
  onAbort
) {
  var this$1 = this;
  var route = this.router.match(location, this.current);
  this.confirmTransition(...)
}
```
在next具体路由后再调用next(),可实现中止导航，即暂停递归

```
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
  next() //终止递归
}
```

# 小结

多读源码总是用好处的