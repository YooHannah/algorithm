

```
let moduleA = {
  namespaced: true,
  state(){ 
    return{
      counta: 0, //分别在模块b和全局下被使用，直接返回对象会通过引用被共享，防止模块间数据污染，使用函数，每次生成新对象，原理同vue的data
    }
  },
  getters:{
    getCount(...args){ //this.$store.getters['b/aa/getCount'] 作为b子模块时
      console.log(args)
      return  'this is a getter~~~~~'
    }
  },
  mutations: { // this.$store.commit('b/aa/increment') 仅触发模块b下面的aa子模块  
    increment (state) { //this.$store.commit('a/increment') 仅触发全局的模块a 对应的子模块 
      state.counta++
    },
    incrementaaa (state) { //在被引用时，套嵌层如果都没有namespaced: true,可以直接用this.$store.commit('incrementaaa')调用进行更改
      state.counta++
    }
  }
}

let moduleB = {
  namespaced: true,
  state: { 
    countb: 0,//this.$store.state.b.countb
  },
  getters:{
    getCount(...args){ //this.$store.getters['b/getCount'] 因为设置了namespaced所以可以重名
      console.log(args)
      return  'this is a getter~~~~~'
    }
  },
  mutations: {
    increment (state) { //如果不加namespaced，执行this.$store.commit('increment')，会同时执行
      state.countb++
    }
  },
  modules: {//如果moduleB不加namespaced，aa可以访问数据但不能调用this.$store.commit('b/aa/increment')进行更改
    aa: moduleA,//this.$store.state.b.aa.counta
  }
}
// vuex相关代码
const store = new Vuex.Store({
  state: { 
    count: 0, //this.$store.state.count
  },
  getters:{
    getCount(...args){ //this.$store.getters.getCount
      console.log(args)
      return  'this is a getter'
    }
  },
  mutations: {
    increment (state) { //this.$store.commit('increment') 子模块有相同函数时，都会触发执行
      state.count++
    }
  },
  modules: {
    a: moduleA, //this.$store.state.a.counta
    b: moduleB //this.$store.state.b.countb
  }
})

```
以上面store结构为例，分析vuex源码
# new Store
```
 var Store = function Store (options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue);
    }
    var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
    var strict = options.strict; if ( strict === void 0 ) strict = false;

    // 一些内部参数
    this._committing = false;
    this._actions = Object.create(null);
    this._actionSubscribers = [];
    this._mutations = Object.create(null);
    this._wrappedGetters = Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = Object.create(null);
    this._subscribers = [];
    this._watcherVM = new Vue();
    this._makeLocalGettersCache = Object.create(null);

    //绑定 commit 和 dispatch 的执行对象始终指向自己，防止外界重新绑定
    var store = this;
    var ref = this;
    var dispatch = ref.dispatch;
    var commit = ref.commit;
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    };
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    };

    // 严格模式
    //使 Vuex store 进入严格模式，在严格模式下，任何 mutation 处理函数以外修改 Vuex state 都会抛出错误。
    this.strict = strict;
    //拿到处理后的state
    var state = this._modules.root.state;

    // 初始化全局module
    // 同时递归注册所有子模块
    // 收集this._wrappedGetters中的所有模块的getters
    installModule(this, state, [], this._modules.root);

    // 初始化store vm, 用于数据响应
    // 同时注册 _wrappedGetters 作为计算属性)
    resetStoreVM(this, state);

    // 使用插件处理
    plugins.forEach(function (plugin) { return plugin(this$1); });
    //options.devtools为某个特定的 Vuex 实例打开或关闭 devtools。
    //对于传入 false 的实例来说 Vuex store 不会订阅到 devtools 插件。可用于一个页面中有多个 store 的情况
    var useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools;
    if (useDevtools) {
      devtoolPlugin(this);
    }
  };
```
# install
```
function install (_Vue) {
  if (Vue && _Vue === Vue) {
    //Vue.use(Vuex) should be called only once
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}
function applyMixin (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit }); //使用beforeCreate将$store绑定到每个VueComponent 上
  } else {
    //小于版本2的用_init初始化
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store; //当前组件$store指向父组件$store，递归指向，从而保证唯一性
    }
  }
}
```
#  ModuleCollection
```
var ModuleCollection = function ModuleCollection (rawRootModule) {
    // 根据new Store 传入的参数，注册根模块
    this.register([], rawRootModule, false);
  };
  // new store 时传入的参数 [], rawRootModule, false
  ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;
    var newModule = new Module(rawModule, runtime);
    //{runtime:false,_children:{},_rawModule:rawModule,state:rawModule上面的state,__proto__:一系列方法}
    if (path.length === 0) {
      this.root = newModule; //初始化根模块
    } else { //初始化子模块
      var parent = this.get(path.slice(0, -1)); //拿到父模块
      parent.addChild(path[path.length - 1], newModule); //给父模块_children属性增加子模块
    }

    // 注册嵌套模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, function (rawChildModule, key) {
        this$1.register(path.concat(key), rawChildModule, runtime); //递归注册
      });
    }
  };
  ```
  ```
  var Module = function Module (rawModule, runtime) {
    this.runtime = runtime;
    // Store some children item
    this._children = Object.create(null);
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule;
    var rawState = rawModule.state;

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
  };

  Module.prototype.addChild = function addChild (key, module) {
    this._children[key] = module;
  };
  Module.prototype.getChild = function getChild (key) {
    return this._children[key]
  };
  ```
  所以这一步结束后
  ```
  this._modules = new ModuleCollection(options);
  ```

  this._modules为如下对象
  ```
  ModuleCollection {
    root: Module {
      runtime: false,
      _children: {a: Module, b: Module}
      _rawModule: {state: {…}, mutations: {…}, modules: {…}}
      state: {count: 0}
      __proto__: Object
    }
    __proto__: Object
  }
  ```


  ModuleCollection对象上的其他方法
  ```
  ModuleCollection.prototype.get = function get (path) {
    return path.reduce(function (module, key) {
      return module.getChild(key)
    }, this.root)
  };

  ModuleCollection.prototype.getNamespace = function getNamespace (path) {
    var module = this.root;
    //对设置了namespaced的模块进行拼接
    return path.reduce(function (namespace, key) {
      module = module.getChild(key); //从_children取出子模块
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  };

  ModuleCollection.prototype.update = function update$1 (rawRootModule) {
    update([], this.root, rawRootModule);
  };
  ModuleCollection.prototype.unregister = function unregister (path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    if (!parent.getChild(key).runtime) { return }

    parent.removeChild(key);
  };

```
# installModule 
```
//初始化调用时传参 （this, state, [], this._modules.root)
function installModule (store, rootState, path, module, hot) {
  //根模块时，参数分别为store本身，根模块state, [], 根模块，undefined
  //递归子模块时，参数为 store本身，根模块state,子模块在modules对象中的路径key值
  var isRoot = !path.length; //空数组即根模块
  //ModuleCollection.prototype.getNamespace 根模块返回空字符串''
  var namespace = store._modules.getNamespace(path); 

  //如果模块设置了命名空间 在store._modulesNamespaceMap属性中注册
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && "development" !== 'production') {
      console.error(("[vuex] duplicate namespace " + namespace + " for the namespaced module " + (path.join('/'))));
    }
    store._modulesNamespaceMap[namespace] = module;
  }

  //对子模块state进行数据劫持处理
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      {
        if (moduleName in parentState) {
          console.warn(
            ("[vuex] state field \"" + moduleName + "\" was overridden by a module with the same name at \"" + (path.join('.')) + "\"")
          );
        }
      }
      Vue.set(parentState, moduleName, module.state); //将子模块state按照模块名添加到父模块state中
    });
  }
  //根据有无namespace
  //截取state,getter的get,
  //封装触发函数dispactch和commit,有namespace拼接后再触发
  var local = module.context = makeLocalContext(store, namespace, path);

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
```
## forEachValue
公共方法
```
 function forEachValue (obj, fn) {
    Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
  }
```

## 注册 Mutation
```
Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
//参数：store本身，经过namespace拼接后的类型标记，具体对应的mutation,当前模块上封装好的state,getters,commit,dispatch
function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload);
  });
}
```
小结：将当前模块的mutations上的各个mutations结合namespace存储到store._mutations属性上
可见，如果子模块没有namespace,同名的mutation会跟根模块的mutation存储在相同的type下面
所以当触发commit的时候会一起执行，
如果子模块设置了namespace，这时存储的type会包含该模块对应的名称，
即使同名的mutation也被存放在不同的type中，实现了隔离

## 注册 Action
```
Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}
```
小结：将当前模块的actions上的各个action结合namespace存储到store._actions属性上

## 注册 Getter
```
Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    {
      console.error(("[vuex] duplicate getter key: " + type));
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // 当前模块state
      local.getters, // 当前模块 getters
      store.state, // 根模块 state
      store.getters // 根模块 getters
    )
  };
}
```
小结：将当前模块的getters上的各个getter结合namespace存储到store._wrappedGetters属性上

## 注册 Module

递归调用installModule注册子模块
```
Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

module.forEachChild(function (child, key) {
  installModule(store, rootState, path.concat(key), child, hot);
});
```

## makeLocalContext
优化 dispatch, commit, getters and state
如果没有设置namespace, 就使用根模块的名称
```
  function makeLocalContext (store, namespace, path) {
    var noNamespace = namespace === '';

    var local = {
      dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;

        if (!options || !options.root) {
          type = namespace + type;//有namespace拼接后再触发
          if (!store._actions[type]) {
            console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
            return
          }
        }

        return store.dispatch(type, payload)
      },

      commit: noNamespace ? store.commit : function (_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;

        if (!options || !options.root) {
          type = namespace + type; //有namespace拼接后再触发
          if (!store._mutations[type]) {
            console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
            return
          }
        }

        store.commit(type, payload, options);
      }
    };

    // getters and state object must be gotten lazily
    // because they will be changed by vm update
    Object.defineProperties(local, {
      getters: {
        get: noNamespace
          ? function () { return store.getters; }
          : function () { return makeLocalGetters(store, namespace); }
      },
      state: {
        get: function () { return getNestedState(store.state, path); }
      }
    });

    return local
  }

function makeLocalGetters (store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store.getters).forEach(function (type) {
      // skip if the target getter is not match this namespace
      if (type.slice(0, splitPos) !== namespace) { return }

      // extract local getter type
      var localType = type.slice(splitPos);

      // Add a port to the getters proxy.
      // Define as getter property because
      // we do not want to evaluate the getters in this time.
      Object.defineProperty(gettersProxy, localType, {
        get: function () { return store.getters[type]; },
        enumerable: true
      });
    });
    store._makeLocalGettersCache[namespace] = gettersProxy;
  }

  return store._makeLocalGettersCache[namespace]
}
function getNestedState (state, path) {
  return path.reduce(function (state, key) { return state[key]; }, state)
}
```

## 小结

该步骤完成后

store对象长这样

```
commit: ƒ boundCommit(type, payload, options)
dispatch: ƒ boundDispatch(type, payload)
strict: false
_actionSubscribers: []
_actions: {} //存放所有模块的action
_committing: false
_makeLocalGettersCache: {}
_modules: ModuleCollection {
  root: Module
  context: //新增根据namespace处理后的触发函数
    commit: ƒ boundCommit(type, payload, options)
    dispatch: ƒ boundDispatch(type, payload)
    getters: (...)
    state: (...)
    get getters: ƒ ()
    get state: ƒ ()
    __proto__: Object
  runtime: false
  state: //将子模块state集中到根模块state
    a: {counta: 2329}
    b:
      aa: {counta: 2329}
      countb: 0
      __proto__: Object
    count: 0
    __proto__: Object
  _children: //对子模块递归过程挂载context属性
    a: Module {runtime: false, _children: {…}, _rawModule: {…}, state: {…}, context: {…}}
    b: Module {runtime: false, _children: {…}, _rawModule: {…}, state: {…}, context: {…}}
  _rawModule: {state: {…}, mutations: {…}, modules: {…}}
  namespaced: (...)
  __proto__: Object
__proto__: Object
}
_modulesNamespaceMap: {b/: Module} //存放设置了namespace的模块
_mutations: {increment: Array(1), incrementaaa: Array(1), b/increment: Array(1), b/incrementaaa: Array(1)} //存放所有模块的mutation
_subscribers: []
_watcherVM: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
_wrappedGetters: {} //存放所有模块的getters
state: (...) //对局部变量做了处理，还没有挂到store上
```

# resetStoreVM
利用vue的数据处理逻辑，解决getters和state之间订阅发布关系
```
function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}
function resetStoreVM (store, state, hot) {
    var oldVm = store._vm;
    //绑定存储公共的getters
    store.getters = {};
    // 重置内部getters缓存到_makeLocalGettersCache
    store._makeLocalGettersCache = Object.create(null);
    var wrappedGetters = store._wrappedGetters;
    var computed = {};
    forEachValue(wrappedGetters, function (fn, key) {
      //如果直接使用，闭包里面会包含oldVm
      computed[key] = partial(fn, store);
      Object.defineProperty(store.getters, key, {
        get: function () { return store._vm[key]; },//直接调用vue的compute属性
        enumerable: true // for local getters
      });
    });

    //使用vue实例存放state和getters
    var silent = Vue.config.silent;
    /* Vue.config.silent暂时设置为true的目的是在new一个Vue实例的过程中不会报出一切警告 */
    Vue.config.silent = true
    store._vm = new Vue({
      data: {
        $$state: state
      },
      computed: computed
    });
    Vue.config.silent = silent;

     /* 使能严格模式，保证修改store只能通过mutation */
    if (store.strict) {
      enableStrictMode(store);
    }

    if (oldVm) {
      if (hot) {
        // dispatch changes in all subscribed watchers
        // to force getter re-evaluation for hot reloading.
        store._withCommit(function () {
          oldVm._data.$$state = null;
        });
      }
      Vue.nextTick(function () { return oldVm.$destroy(); });
    }
  }

```
# store上的其他方法
```
Store.prototype.commit = function commit (_type, _payload, _options) {
  var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
  var type = ref.type;
  var payload = ref.payload;
  var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    {
      console.error(("[vuex] unknown mutation type: " + type));
    }
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  });

  this._subscribers
    .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
    .forEach(function (sub) { return sub(mutation, this$1.state); });

  if (
    options && options.silent
  ) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    );
  }
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
      var this$1 = this;

    // check object-style dispatch
    var ref = unifyObjectStyle(_type, _payload);
      var type = ref.type;
      var payload = ref.payload;

    var action = { type: type, payload: payload };
    var entry = this._actions[type];
    if (!entry) {
      {
        console.error(("[vuex] unknown action type: " + type));
      }
      return
    }

    try {
      this._actionSubscribers
        .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
        .filter(function (sub) { return sub.before; })
        .forEach(function (sub) { return sub.before(action, this$1.state); });
    } catch (e) {
      {
        console.warn("[vuex] error in before action subscribers: ");
        console.error(e);
      }
    }

    var result = entry.length > 1
      ? Promise.all(entry.map(function (handler) { return handler(payload); }))
      : entry[0](payload);

    return result.then(function (res) {
      try {
        this$1._actionSubscribers
          .filter(function (sub) { return sub.after; })
          .forEach(function (sub) { return sub.after(action, this$1.state); });
      } catch (e) {
        {
          console.warn("[vuex] error in after action subscribers: ");
          console.error(e);
        }
      }
      return res
    })
  };

  Store.prototype.subscribe = function subscribe (fn) {
    return genericSubscribe(fn, this._subscribers)
  };

  Store.prototype.subscribeAction = function subscribeAction (fn) {
    var subs = typeof fn === 'function' ? { before: fn } : fn;
    return genericSubscribe(subs, this._actionSubscribers)
  };

  Store.prototype.watch = function watch (getter, cb, options) {
      var this$1 = this;

    {
      assert(typeof getter === 'function', "store.watch only accepts a function.");
    }
    return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
  };

  Store.prototype.replaceState = function replaceState (state) {
      var this$1 = this;

    this._withCommit(function () {
      this$1._vm._data.$$state = state;
    });
  };

  Store.prototype.registerModule = function registerModule (path, rawModule, options) {
      if ( options === void 0 ) options = {};

    if (typeof path === 'string') { path = [path]; }

    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
      assert(path.length > 0, 'cannot register the root module by using registerModule.');
    }

    this._modules.register(path, rawModule);
    installModule(this, this.state, path, this._modules.get(path), options.preserveState);
    // reset store to update getters...
    resetStoreVM(this, this.state);
  };

  Store.prototype.unregisterModule = function unregisterModule (path) {
      var this$1 = this;

    if (typeof path === 'string') { path = [path]; }

    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }

    this._modules.unregister(path);
    this._withCommit(function () {
      var parentState = getNestedState(this$1.state, path.slice(0, -1));
      Vue.delete(parentState, path[path.length - 1]);
    });
    resetStore(this);
  };

  Store.prototype.hotUpdate = function hotUpdate (newOptions) {
    this._modules.update(newOptions);
    resetStore(this, true);
  };

  Store.prototype._withCommit = function _withCommit (fn) {
    var committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  };
  
  function genericSubscribe (fn, subs) {
    if (subs.indexOf(fn) < 0) {
      subs.push(fn);
    }
    return function () {
      var i = subs.indexOf(fn);
      if (i > -1) {
        subs.splice(i, 1);
      }
    }
  }

  function resetStore (store, hot) {
    store._actions = Object.create(null);
    store._mutations = Object.create(null);
    store._wrappedGetters = Object.create(null);
    store._modulesNamespaceMap = Object.create(null);
    var state = store.state;
    // init all modules
    installModule(store, state, [], store._modules.root, true);
    // reset vm
    resetStoreVM(store, state, hot);
  }
```