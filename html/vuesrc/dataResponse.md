```
Vue.prototype._init = function (options) {
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  );
  initState(vm);
 }
```
# 转换
第一步转换成内置函数
```
 function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child);
    }
    
    if (typeof child === 'function') {
      child = child.options;
    }

    // ... normalizeProps, normalizeInject, normalizeDirectives

    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    //在上面的循环中会遍历到配置的options参数里的data属性，则会调用到strats.data
    function mergeField (key) { 
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }
  //
  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      //...vm就是VUE实例，所以不会走这里
      return mergeDataOrFn(parentVal, childVal)
    }
    return mergeDataOrFn(parentVal, childVal, vm)
  };

  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      ...
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }
```
这一步结束后
```
vm.$options.data = function mergedInstanceDataFn () {
  //声明时传递进来的data属性值,是函数则执行拿到对象
  var instanceData = typeof childVal === 'function' 
    ? childVal.call(vm, vm)
    : childVal;
  //内部属性没有data属性，所以 defaultData 为undefined
  var defaultData = typeof parentVal === 'function'
    ? parentVal.call(vm, vm)
    : parentVal;
  if (instanceData) {
    return mergeData(instanceData, defaultData)
  } else {
    return defaultData
  }
}
function mergeData (to, from) {
  if (!from) { return to }
  ...//省略若干逻辑
}
```
# 初始化
第二步进行真正初始化
```

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
}

function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    //得到的data不是object对象
    if (!isPlainObject(data)) {
      data = {};
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
        warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking(调用) data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }
```
