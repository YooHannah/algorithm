function createElement(type, pops, ...childen) {
  return {
    type,
    props:{
      ...props,
      children: children.map(child=>{
        return typeof child === 'object'?child : createTextElemnet(child)
      })
    }
  }
}

/***
 *  文本类型的虚拟dom 创建
 */

function createTextElemnet(text) {
  return {
    type:'TEXT',
    props:{
      nodeValue:text,
      children:[]
    }
  }
}
/**
 * 通过虚拟dom,新建dom元素
 * @param {虚拟dom} vdom 
 */
function createDom(vdom){
  const dom = vdom.type === 'TEXT' 
  ? document.createNode('')
  :document.createComment(vdom.type)
  updateDom(dom,{},vdom.props)
  return dom
}

function updateDom(dom,prevProps,nextProps){
  //1.规避children属性
  //2.老的存在，取消
  //3.新的存在新增，并没有做新老相等的判定
  // @todo 兼容性
  Object.keys(prevProps)
    .filter(name=>name!='children')
    .filter(name=>!(name in nextProps))
    .forEach(name=>{
      if(name.slice(0,2)=='on'){
        //onClick =>click
        dom.removeEvenListener(name.slice(0,2).toLowerCase(),pevPops[name],false)
      } else{
        dom[name] = ''
      }
    })
    Object.keys(prevProps)
    .filter(name=>name!='children')
    .forEach(name=>{
      if(name.slice(0,2)=='on'){
        //onClick =>click
        dom.addEvenListener(name.slice(0,2).toLowerCase(),pevPops[name],false)
      } else{
        dom[name] = nextProps[name]
      }
    })
}
/**
 * 
 * @param {虚拟dom} vdom 
 * @param {容器} container 
 */
function render(vdom,container){
  wipRoot = {
    dom:container,
    props:{
      children:[vdom]
    },
    base:currentRoot
  }
  delletions = []
  nextUnitOfWork = wipRoot
  // vdom.props.children.forEach(child=>{
  //   render(child,dom)
  // })
  //container.innerHTML = `<pre>${JSON.stringify(vdom,null,2)}</pre>`
}

function commitRoot(){
  delletions.forEach(commitWorker)
  commitWorker(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}
function commitWorker(filter) {
  if(!fiber){
    return
  }
  //向上查找
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom
  if(fiber.effectTag=='PLACEMENT' && fiber.dom !=null){
    domParent.appendChild(fiber.dom)
  }else if(fiber.effectTag =='DELETION'){
    commitDeletion(fiber, domParent)
    // domParent.removeChild(fiber.dom)
  }else if(fiber.effectTag == 'UPDATE' && fiber.dom!=null){
    //更新dom
    updateDom(fiber.dom,fiber.base.props,fiber.props)
  }
  domParent.appendChild(fiber.dom)
  commitWorker(fiber.child)
  commitWorker(fiber.slibing)
}

function commitDeletion(fiber,domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.dom)
  }else{
    commitDeletion(fiber.child,domParent)
  }
}
// 下一个单元任务
// render 会初始化第一个任务
let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let delletions = null//待删除的结点集合
// 调度我们的diff 或者渲染任务
function workLoop(deadline){
  // 又一个任务，并且当前帧还没有结束
  while(nextUnitOfWork && deadline.timeRemaining()>1){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if(!nextUnitOfWork && wipRoot){
    //没有任务了，并且根节点还在
    commitRoot()
  }
  requestIdleCallback(workLoop)
}
// 启动空闲时间处理
requestIdleCallback(workLoop)
/**
 * 
 * @param {
 * dom:  真的dom,
 * parent:父亲
 * child: 第一个子元素
 * slibing:兄弟
 * } fiber
 *  
 */
function performUnitOfWork(fiber){
  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent){
    updateFunctionComponent(fiber)
  }else{
    updateHostComponent(fiber)
  }
 
  // 找下一个任务
  // 先找子元素
  if(fiber.child) {
    return fiber.child
  }
  //没有子元素了，就找兄弟元素
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.slibing){
      return nextFiber.slibing
    }
    //没有兄弟元素了，找父元素
    nextFiber = newFiber.parent
  }
}
let wipFiber = null
let hookIndex = null
function useState(init){
  const oldhooks = wipFiber.base && wipFiber.base.hooks && wipFiber.base.hooks[hookIndex]
  const hook = {
    state:oldHooks?oldHooks.state:init,
    queue:[]
  }
  const actions = oldHooks? oldHooks.queue:[]
  actions.forEach(action=>{
    hook.state = action
  })
  const setState = action=>{
    hook.queue.push(action)
    wipRoot = {
      dom:currentRoot.dom,
      props:currentRoot.props,
      base:currentRoot
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }
  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state,setState]
}
function updateFunctionComponent() {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
   // 获取下一个任务
  // 根据当前的任务，获取下一个
  if(!fiber.dom){
    //不是入口
    fiber.dom = createDom(fiber)
  }
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  const elements = fiber.props.childen
  reconcileChildren(fiber,elements)

}
function reconcileChildren(wipFiber,elements) {
  // 构建fiber结构
  let index = 0
  let oldFiber = wipFiber.base && wipFiber.base.child
  let prevSlibing = null
  while(index<element.length && oldFiber != null){
  // while(index<elements.length){
    let element = elements[index]
    const newFiber = null

    // 对比oldfiber的状态和当前element
    // 先比较类型
    const sameType = oldFiber && element && oldFiber.typr == element.type
    if(sameType){
      // 复用结点，更新
      newFiber = {
        type:oldFiber.type,
        props:element.props,
        dom:oldFiber.dom,
        parent:wipFiber,
        base:oldFiber,
        effectTag:'UPDATE'
      }
    }
    if(!sameType && element){
      // 替换
      newFiber = {
        type:element.type,
        props:element.props,
        dom:null,
        parent:wipFiber,
        base:null,
        effectTag:'PLACEMENT'
      }
    }
    if(!sameType && oldFiber){
      // 删除
      oldFiber.effectTag = "DELETION"
      delletions.push(oldFiber)
    }
    if(index == 0){
      //第一个元素，是父Fiber的child属性
      wipFiber.child = newFiber
    }else{
      prevSlibing.slibing = newFiber
    }
    prevSlibing = newFiber
    index++
    // fiber基本结构构建完毕
  }
}

class Component {
  constructor(props){
    this.props = props
  }
}

// 把类组件，转成函数组件，利用hooks实现setState
function transfer(comments){
  return function(props){
    const component = new Component(props)
    let [state,setState] = useState(component.state)
    component.props = props
    component.state = state
    component.setState = setState
    return component.render()
  }
}
export default {
  createElement,
  render,
  
}