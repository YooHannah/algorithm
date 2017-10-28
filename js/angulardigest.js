function Scope() {
  this.$$watchers = [];//监控器集合
  this.$$asyncQueue = [];//异步/延迟执行任务集合
  this.$$postDigestQueue = [];//digest结束后执行的任务集合
  this.$$phase = null;//执行进度标记
}

Scope.prototype.$beginPhase = function(phase) { //设置执行进度标记
  if (this.$$phase) {
    throw this.$$phase + ' already in progress.';
  }
  this.$$phase = phase;
};

Scope.prototype.$clearPhase = function() { //移除进度标记
  this.$$phase = null;
};

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) { //注册监控器
  var self = this;
  var watcher = {
    watchFn: watchFn,//监控函数，返回新值
    listenerFn: listenerFn || function() { },//监听函数，对变化做出响应
    valueEq: !!valueEq//定制新旧值判断方法
  };
  self.$$watchers.push(watcher);
  return function() { //销毁监控器函数
    var index = self.$$watchers.indexOf(watcher);
    if (index >= 0) {
      self.$$watchers.splice(index, 1);
    }
  };
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue); //值判断，能深度判断套嵌的值是否改变
  } else {
    return newValue === oldValue || //引用判断，套嵌数据无法辨别值是否改变
      (typeof newValue === 'number' && typeof oldValue === 'number' &&
       isNaN(newValue) && isNaN(oldValue));//对NaN特殊情况处理
  }
};

Scope.prototype.$$digestOnce = function() {//脏检查具体步骤
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {//循环每个监控器
    try {
      var newValue = watch.watchFn(self);
      var oldValue = watch.last;
      if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) { //发生变化就执行对应监听函数
        watch.listenerFn(newValue, oldValue, self);
        dirty = true;
      }
      watch.last = (watch.valueEq ? _.cloneDeep(newValue) : newValue);//新值赋值为旧值
    } catch (e) {
      (console.error || console.log)(e);
    }
  });
  return dirty;
};

Scope.prototype.$digest = function() { //循环脏检查
  var ttl = 10;//迭代次数
  var dirty;
  this.$beginPhase("$digest");
  do {
    while (this.$$asyncQueue.length) { //执行延迟队列
      try {
        var asyncTask = this.$$asyncQueue.shift();
        this.$eval(asyncTask.expression);
      } catch (e) {
        (console.error || console.log)(e);
      }
    }
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) { //限制迭代次数
      this.$clearPhase();
      throw "10 digest iterations reached";
    }
  } while (dirty);
  this.$clearPhase();

  while (this.$$postDigestQueue.length) { //digest结束执行任务
    try {
      this.$$postDigestQueue.shift()();
    } catch (e) {
      (console.error || console.log)(e);
    }
  }
};

Scope.prototype.$eval = function(expr, locals) { //立即执行
  return expr(this, locals);
};

Scope.prototype.$apply = function(expr) { //集成成外部代码，然后执行digest
  try {
    this.$beginPhase("$apply");
    return this.$eval(expr);
  } finally {
    this.$clearPhase();
    this.$digest();
  }
};

Scope.prototype.$evalAsync = function(expr) { //注册异步执行任务
  var self = this;
  if (!self.$$phase && !self.$$asyncQueue.length) {
    setTimeout(function() { //保证没注册一次任务就执行一次digest
      if (self.$$asyncQueue.length) {
        self.$digest();
      }
    }, 0);
  }
  self.$$asyncQueue.push({scope: self, expression: expr});
};

Scope.prototype.$$postDigest = function(fn) {//注册digest结束任务
  this.$$postDigestQueue.push(fn);
};

