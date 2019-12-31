
# 两种释放内部对象且能防止外部修改的方式
## 方式一
通过创建中间对象挂载到实例上，通过中间对象的set方法进行拦截
出自vue.js
```
  function initGlobalAPI (Vue) {
    var configDef = {};
    configDef.get = function () { return config; }; //config对象是vue对象构建过程的内部对象，存储全局配置项
    {
      configDef.set = function () {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);
  }
```
[Vue.config.optionMergeStrategies](https://cn.vuejs.org/v2/api/#optionMergeStrategies) 应用中
Vue.config可以get,得到的即内部的config，但如果进行Vue.config = xxxx set操作就会报错
通过Vue.config可以获得内部config，从而可以修改内部config对象上的属性，从而修改到全局配置

## 方式二


