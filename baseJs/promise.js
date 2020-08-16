function PP(){ 
  let promises = new Map();
  let index = 126; // random , 无所谓
  //resolve返回为promise时，之后的状态结果来自返回的promise
  //这里的操作是将后续的then/catch操作放到返回的promise的自己的then/catch操作之后进行
  //如果返回promise的resolve本身为另一个promise的resolve结果，那么进行链式操作
  //将父亲promise的then/catch操作放到返回的儿子的promise的then/catch操作之后
  //沿着链表装载
  function loadLineToList(obj){
      //这一串的状态是相同的了 
      let previous = null;
      let end = obj;
      let temp_end = obj;
      while(previous=temp_end.previous){ 
          previous.state = end.state;
          previous.value = end.value;        
          //把上一个promise下面的节点移到end下面
          if(promises.get(end._id)){
              if(promises.get(previous._id)){
                  // 合并后的节点数组
                  let newPromiseItem = promises.get(end._id).concat(promises.get(previous._id));
                  promises.set(end._id,newPromiseItem);
              }    
          }else{
              //不存在,自己下面没有节点 
              if(promises.get(previous._id)){
                  // 合并后的节点数组
                  promises.set(end._id,promises.get(previous._id));
              }

          }
          temp_end = temp_end.previous;
      }
  }
  app.prototype.resolve = function(data){
      //promise的状态一旦改变就无法变更,如果执行过resolve,再执行的resolve,reject都不作数
      if(this._statusChange){
          return;
      }
      if(!this._statusChange){
          this._statusChange = true;
      }
      let ans = null; // 回调函数的结果
      let promise = null; //每一个子节点中的promise实例
      let items; //一个节点下面的子节点
      // 执行mic任务队列里面的任务 , 这里用setTimeout(fn,0)代替
      setTimeout(()=>{
          if(typeof data == 'object' && data!==null &&  data.__proto__.constructor == app){
            //如果返回值为promise，自己后续的then/catch执行，
            //要等到返回的promise的then/catch执行后在执行
            //即当返回promise时，自身的then/catch由返回的promise引发执行
            //所以现在只是建立链表关系，不执行
            // 装入链表
              data.previous = this;
          }else{      
              // 真正执行
              setTimeout(()=>{
                  this.state = "resolve";
                  this.value = data;
                  loadLineToList(this);
                  if(items=promises.get(this._id)){
                      // 拿出当前promise调用的所有then方法的回调函数,并执行
                      for(let i=0;i<items.length;i++){
                          // then 
                          if(items[i].type == 'then'){
                              try{
                                  // run first resolve
                                  ans = items[i].callback[0].fn(data);
                              }catch(err){
                                  promise = promises.get(this._id)[i].instance;
                                  promise.reject(err);
                                  continue;
                              }  
                          }else{
                              //有这个promise的catch方法,方法不执行
                              ans = data;
                          }
                          promise = promises.get(this._id)[i].instance;

                          // 如果then函数resolve参数参数返回了一个promise
                          if(typeof ans == 'object' && ans!==null &&  ans.__proto__.constructor == app){
                            //同样建立关系，后续的执行看返回的promise
                            ans.previous = promise;
                          }else{
                              if(promise){
                                //如果返回不是promise对象，
                                //继续链式调用后面的resolve函数
                                  promise.resolve(ans);
                              }
                          }
                      }
                  }else{
                      return;
                  }
              },0)
              
          }

      },0)
  }
  app.prototype.reject = function(error){   
      //promise的状态一旦改变就无法变更,如果执行过resolve,再执行的resolve,reject都不作数
      if(this._statusChange){
          return;
      }
      if(!this._statusChange){
          this._statusChange = true;
      }
      
      //向下找promise,直到找到一个catch,至于不是catch的,状态一律变成reject
      let promise,fn;
      setTimeout(()=>{
          this.state = "reject";
          this.value = error;
          loadLineToList(this);
          let list = promises.get(this._id); // 所有子节点
          // 出口  
          if(!list || list.length==0){
              throw new Error("(in promise) "+error);
          }
          for(let i=0;i<list.length;i++){
              promise = list[i].instance;
              type = list[i].type;
              if(type == 'then'){   
                  if(list[i].callback.length == 1){
                      promise.value = error;
                      promise.reject(error);
                      continue;
                  }else{
                      fn = list[i].callback[1].fn;
                  }
              }
              // 拿到catch里面的fn
              if(!fn){
                  fn = list[i].callback[0].fn; 
              }
              let ans = null;
              try{
                  ans = fn(error);
                  fn = null;
              }catch(err){
                  promise.reject(err);
                  continue;
              }
              promise.value = ans;
              if(typeof ans == 'object' && ans!==null &&  ans.__proto__.constructor == app){
                  // 装入链表
                  ans.previous = promise;
              }else{
                  if(promise){
                      promise.resolve(ans);
                  }
              }
          }
      },5) 
      
  }
  // Promise 构造函数
  function app(fn){
      this.state = "pendding";
      this._id = ++index;
      this._statusChange = false;
      try{
          fn(this.resolve.bind(this), this.reject.bind(this));
      }catch(err){
          setTimeout(()=>{
              // q1:同步代码,error在promise的resolve之后,不处理.
              if(this._statusChange){
                  return;
              }
              this.reject(err);
          },0)
      }
      
  }
  //
  app.prototype.then = function(resolveFn, rejectFn){
      let length = arguments.length;
      if(length > 0 && length < 3){
          if(typeof resolveFn !== 'function'){
              throw new Error('arguments error');
          }
          if(rejectFn && typeof rejectFn !== 'function'){
              throw new Error('arguments error');
          }
      }else{
          throw new Error('arguments error');
          return;
      }   
      // 把要发生的事件保存起来 , 并且返回一个新的promise 
      let instance = new app(()=>{});
      /**
       * type: 用来判定这个promise是通过then方法创建的
       * instance: promise实例
       * callback: 保存的事件 
       */
      let item = {
          type : 'then',
          instance : instance,
          callback : length > 1 ? ([{
              status : 'resolve',
              fn : resolveFn
          },{
              status : 'reject',
              fn : rejectFn
          }]) : ([{
              status : 'resolve',
              fn : resolveFn
          }])
      }
      // 这里通过map存储的,两个promise之间的关系就通过promise的_id相互关联.
      let p_item;
      if(p_item=promises.get(this._id)){
          p_item.push(item);
      }else{
          promises.set(this._id,[item])
      }
      return instance;
  }
  app.prototype.catch = function(rejectFn){
      if(typeof rejectFn !== 'function'){
          throw new Error('arguments error');
          return;
      }
      // 把要发生的事件,新的promise保存起来 , 并且返回新的promise 
      let instance = new app(()=>{});
      let item = {
          type : 'catch',
          instance : instance,
          callback : ([{
              status : 'reject',
              fn : rejectFn
          }])
      }
      let p_item;
      if(p_item=promises.get(this._id)){
          p_item.push(item);
      }else{
          promises.set(this._id,[item])
      }
      return instance;
  }
  return app;
}
let Promise = PP();
