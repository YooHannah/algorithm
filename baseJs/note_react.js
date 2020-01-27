/**
 * q1：请说明vue和React两者的区别和共同点。
 * q2:什么是JSX,为什么浏览器无法读取JSX
 * q3:你是如何理解Virtual DOM的原理的？
 * q4:React 中 key 是做什么的？
 * q5:你是如何理解 React 组件的生命周期的
 * q6:什么是Props?
 * q7:React中的状态是什么？它是如何使用的？
 * q8:调用setState之后发生了什么？
 * q9:父子组件嵌套后的生命周期是怎样的
 * q10:请实现一个父子组件通信
 * q11:请实现一个跨级组件通信
 * q12:请说出你对受控组件与非受控组件的理解
 * q13:与 ES5 相比，React 的 ES6 语法有何不同
 * 一、新增箭头函数
 * 箭头函数解决的问题
 * 简化了写法。箭头函数适用于函数体只有一行的情况；当有多行时，可用普通函数增加可读性。  少打代码，结构清晰
 * 明确了this。传统JS的this是在运行的时候确定的，而不是在定义的时候确定的；而箭头函数的this是在定义时就确定的，不能被改变，也不能被call,apply,bind这些方法修改。       明确运行时候this指向谁，不用运行时判断this指向                         注：箭头函数没有自己的this，他的this就是外层的this，指向上一个不是箭头函数的函数的this。因为js的机制，所以指向的是一个非箭头函数的函数的作用域。
 * 箭头函数与普通函数的区别
 * 普通function的声明在变量提升中是最高的，箭头函数没有函数提升
 * 箭头函数没有this，函数体内部的this对象就是定义的时候所在的对象而不是使用时所在的对象
 * 箭头函数没有arguments对象，该对象在函数体内不存在，如果要用，可以使用rest参数
 * 箭头函数不能作为构造函数，不能被new，没有property
 * call和apply方法只有参数，没有作用域
 * 不可以使用yield命令，因此箭头函数不能做Generator函数
 * 二、块级作用域
 * ES6中的let命令，声明变量，用法和var差不多，但是let是为JavaScript新增了块级作用域，ES5中是没有块级作用域的，并且var有变量提升的概念，但是在let中，使用的变量一定要进行声明；const声明常量
 * ES6中变量的结构赋值，比如：var [a,b,c] = [0,1,2];
 * 三、类继承
 * ES6中不再像ES5一样使用原型链实现继承，而是引入Class这个概念，听起来和Java中的面向对象编程的语法有些像，但是二者是不一样的。
 * 四、设置默认函数参数
 * ES6中可以设置默认函数参数，如function A（x,y=9）{};
 * 五、promise
 * promise产生背景：解决回调地狱问题，处理异步请求
 * promise用法：链式调用，成功和失败的回调，三个状态，pending状态改变时触发。状态一旦改变就不会再变。
 * 六、模板字符串
 * 七、赋值结构
 * q13:什么是高阶组件，他有哪些优缺点
 * q14:为什么react要新增hook新特性？
 * 1.组件维护变得容易：
 * 2.提高性能：
 * 3.props层级变浅
 * q15:hook规则，为什么要有这些规则？
 * 1、最高级使用 Hook，不要在循环、条件或者嵌套函数中调用 Hook。；遵循这个规则，能够保证每次组件呈现的时候，都能够以相同的顺序调用 Hook。这也是能够保证 React 在多个 useState 和useEffect 调用之间也能够保留 Hook 的 state 的原因。
 * 2、只在 React Function 中使用 Hooks；不要在常规的 JavaScript 函数中调用 Hook。通过遵循这个规则，你可以确保组件中的所有有状态逻辑从其源代码中清晰可见。
 * 
 * q16:自定义hook必须以“use”开头，这个说法正确吗？为什么？
 * 与 React 组件不同的是，自定义 Hook 不需要具有特殊的标识。我们可以自由的决定它的参数是什么，以及它应该返回什么（如果需要的话）。换句话说，它就像一个正常的函数。但是它的名字应该始终以 use 开头，这样可以一眼看出其符合 Hook 的规则
 *
 * q17:在两个组件中，使用相同的hook，会共享state吗？
 * 不会。自定义 Hook 是一种重用状态逻辑的机制(例如设置为订阅并存储当前值)，所以每次使用自定义 Hook 时，其中的所有 state 和副作用都是完全隔离的
 * 
 * q18:hook 会替代 render props 和高阶组件吗？
 * 在一个函数中定义的state，竟然可以直接拿到另一个函数中使用，然而有了Hooks，这种看似不可能的语法确实行得通。Hooks的优势不仅体现在代码量上，从风格上来说，也显得语义更清晰、结构更优雅（相比之下，高阶组件和renderProps的语法都显得比较诡异）。更重要的是，上述两种模式所拥有的种种缺点，它一个都没有。
 * 
 * q19:请说明Redux的实现流程。
 * q20:请说明Redux和vuex的异同点
 * q21:请问Redux的三大原则是什么？
 * q22:如何在 Redux 中定义 Action？
 * q23:请解释 Reducer 的作用。
 */
 

 /* 
 * 1.作为变量得DOM结构只是Dom结构，没有生命周期，是死的，不能动态改动得，但作为组件生成得Dom结构有生命周期，可传入变量进行改动
 * 2.Diff策略将O(n^3)复杂度得问题，转换成O(n)复杂度得问题 通过设置key得策略对element diff 进行算法优化
 * 3.
 * ReactDom.unmountComponentAtNode() 在节点下删除清空组件
 * ReactSom.render() 在节点下挂载组件
 * 
 
 */
//定义loading组件 通过方法调用组件 
//---------------思路可适用于：loading,input,confirm(确认框),tooltip(全局提示),meaasge相关弹窗提示类的功能
//在antDesign中有应用
class Loading extends React.Component{
  render(){
    return (
      <div className='loading'>
        loading
      </div>
    )
  }
}
let node = null
const loading = {
  show(){
    node = document.createElement('div')
    document.body.appendChild(node)
    ReactDom.render(<Loading />,node)
  },
  hide(){
    if(node){
      ReactDom.unmountComponentAtNode(node)
      document.body.removeChild(node)
    }
  }
}
export default loading

//使用
import loading from './loading'
class Loading extends React.Component{

  componentDidmount(){
    loading.show()
    requestMethod().then(()=>{
      loading.hide()
    })
  }
}

/**
 * 4.es6的...在属性中使用
 */
class Rest extends React.Component{
  render(){
    let {name,age,...rest} = this.props
    return (
      //相当于<div style={{color:'red'}} onClick={()=>{alert('hello')}}>
      <div {...rest}>   
        {name} - {age}
      </div>
    )
  }
}
class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      name:'jim',
      age:24
    }
  }
  render(){
    let {name,age} = this.state
    return (
      <div>
        <Rest name={name} age={age} style={{color:'red'}} onClick={()=>{alert('hello')}}/>
      </div>
    )
  }
}

/**
 * 5.通过类继承实现组件继承  ----- 生命周期过程 子类父类的挂载，更新过程？
 */
class LoadingComponent extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      loading:false
    }
  }
  showLoading(){
    this.setState({
      loading:true
    })
  }
  hideLoading(){
    this.setState({
      loading:false
    })
  }
  render(){
    const {
      loading
    } = this.state
    return (
      <div className='loading'>
        {loading?'loading....':''}
      </div>
    )
  }
}
class App extends LoadingComponent{
  render(){
    return (
      <div> 
        {/* 渲染父组件的内容 即loading...,不写的话，子类的render方法 会覆盖父类的render方法，只渲染'app' */}
        {super.render()}
        app
      </div>
    )
  }
  componentDidmount(){
    this.showLoading()
    setTimeout(()=>{
      this.hideLoading()
    },3000)
  }
}
/**
 * 6.通过装饰器实现继承  装饰器知识点？
 */

let Loading = (Com) =>{
  class LoadingComponent extends Com{
    constructor(props) {
      super(props)
      this.state = {
        loading:false
      }
    }
    showLoading(){
      this.setState({
        loading:true
      })
    }
    hideLoading(){
      this.setState({
        loading:false
      })
    }
    render(){
      const {
        loading
      } = this.state
      return (
        <div>
          {/* 继承关系转换，在子类渲染父类 */}
          {super.render()}
          {loading?'loading....':''}
        </div>
      )
    }
  }
  return LoadingComponent
}


@loading //相当于 newCom = loading(app)
class App extends LoadingComponent{
  render(){
    return (
      <div> 
        app
      </div>
    )
  }
  componentDidmount(){
    this.showLoading()
    setTimeout(()=>{
      this.hideLoading()
    },3000)
  }
}

/**
 * Icon组件
 */
import React,{Component} from 'React'
import PropTypes from 'prop-types'
import '../../font/iconfont.css'

class Icon extends Component{
  static propTypes = {
    name:PropTypes.string
  }

  static defaultProps = {
    name:'aaa'
  }
  render(){
    const {
      name,
      ...rest
    } = this.props
    return (
      <span {...rest} className={`icon iconfont icon-${name}`}></span>
    )
  }
}
export default Icon

/**
 * Button 组件
 */

//不同样式
// @import "../theme/index.scss" //主题颜色定义 $primarycolor:blue;$warningcolor:yellow
// .react-ui__btn{
//   &--primary{
//     background:$primarycolor
//   }
//   &--warning{
//     background:$warningcolor
//   }
// }


import React,{Component} from 'React'
import PropTypes from 'prop-types'
import Icon from '../Icon'
import './index.scss'
class Button extends Component{
  static propTypes = {
    icon:PropTypes.string,
    type:PropTypes.string
  }

  static defaultProps = {
    icon:'dianpu',
    type:'primary'
  }
  render(){
    const {
      icon,
      children,
      ...rest
    } = this.props
    return (
      <button clasName={`react-ui__btn--${type}`}>
        <Icon name={icon}/>
        {children}
      </button>
    )
  }
}
export default Button

//使用 <Button type='warning' icon='dianpu'></Button>

/**
 * Input 组件
 */
//不同样式
// @import "../theme/index.scss" //颜色定义
// .react-ui__input{
//   border:1px solid #d2d2d2;
//   input{
//     outline:none,
//     border:none
//   }
//   &.focus{
//     border-color:blue
//   }
//   &.size-large input{
//    line-height:40px;
//    font-size:18px
//   }
//   &.size-small input{
//    line-height:20px;
//    font-size:12px
//   }
//   &.size-middle input{
//    line-height:30px;
//    font-size:14px
//   }
//   &--primary{
//     background:$primarycolor
//   }
//   &--warning{
//     background:$warningcolor
//   }
// }
import React,{Component} from 'React'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Icon from '../Icon'
import './index.scss'
class Button extends Component{
  constructor(props){
    super(props)
    this.state = {
      focus:false,
      innerValue:''
    }
  }
  static propTypes = {
    value:PropTypes.string,
    size:PropTypes.string,
    onChange:propTypes.func
  }

  static defaultProps = {
    value:'',
    size:'middle'
  }
  get isControl(){
    return 'value' in this.props
  }
  get value(){
    if(this.isControl){
      return this.props.value
    }else{
      return this.state.innerValue
    }
  }
  componentDidMount(){
    this.setState({
      innerValue:this.props.defaultValue
    })
  }
  render(){
    const {focus} = this.state
    const {
      icon,
      children,
      size,
      prefix,
      suffix,
      rule,
      message,
      ...rest
    } = this.props
    let cls = classNames({
      input:true,
      focus,
      [`size-${size}`]:true,
      'react-ui__input':true
    })
    return (
      <div>
      <div className={cls}>
        {prefix && <Icon name={prefix} />}
        <input 
          value= {this.value}
          onFocus={e=>{
            this.setState({focus:true})
          }}
          onBlur={e=>{
            this.setState({focus:false})
          }}
          onChange={e=>{
            if(!this.isControl){
              this.setState({
                innerValue:e.target.value
              })
            }
            this.props.onChange(e)
          }}
        />
        {suffix && <Icon name={suffix} />}
      </div>
      <p>
        {!rule.test(this.value) && message}
      </p>
      </div>
    )
  }
}
export default Input

/**
 * 使用
 * 受控组件必须VALUE和onchange同时使用
 * <Input size='small' value={this.state.value} onChaneg={e=>{this.setState({value:e.target.value})}}
 * 非受控组件可以不配置onChange,而且绑定值可以不放在state里面
 * <Input size='small' rule={/\d/} message='只允许输入数字' defaultValue={this.value} onChaneg={e=>{this.value = e.target.value})}}
 */

 /**
  * Table组件
  */
 import React,{Component} from 'React'
 import PropTypes from 'prop-types'
 import Icon from '../Icon'
 import './index.scss'
 class ColumnItem extends Component{
    render(){
      const {
        render = ()=>'占位符',
        title
      } = this.props.item
      return (
        <td>{title}</td>
      )
    }
 }
 class Columns extends Component{
  render(){
    const {
      columns
    } = this.props
    return(
      <thead>
      <tr>
        {columns.map(item =><ColumnItem item={item} key={item.key}/>)}
      </tr>
      </thead>
    )
  }
 }
 class DataSourceItem extends Component{
  render(){
    const {
      dataItem,
      columns,
      index
    } = this.props
    const tds = columns.map((item)=><td>{item.render?item.render(dataItem[item.dataIndex],dataItem,index):dataItem[item.dataIndex]}</td>)
    return (
      <tr>{tds}</tr>
    )
  }
}
 class dataSource extends Component{
  render(){
    const {
      columns,
      dataSource,
    } = this.props
    let trs = dataSource.map((item,index )=> <DataSourceItem dataItem = {item} index={index} columns={columns}/>)
    return(
      <tbody>
        {columns.map(item =><ColumnItem item={item} key={item.key}/>)}
      </tbody>
    )
  }
 }
 class Table extends Component{
   static propTypes = {
     columns:PropTypes.array,
     dataSource:PropTypes.array
   }
 
   static defaultProps = {
    columns:[],
    dataSource:[]
   }
   render(){
     const {
      columns,
      dataSource,
       ...rest
     } = this.props
     return (
      <div>
        <table>
          <Columns columns={columns}></Columns>
        </table>
      </div>
     )
   }
 }
 export default Table

/**
 * 7.有状态组件的可复用问题
 */
class Provider extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      name:'provider-user'
    }
  }
  render(){
    return this.props.render(this.state.name)
  }
}
class User extends React.Component{
  render(){
    return (
      <div>
        {this.props.data}
      </div>
    )
  }
}

class App extends React.Component{
  render(){
    return (
      // User组件数据来源于Provider组件，不是来自APP，即可以给User套不同的组件，通过不同组件灌进数据
      <Provider render={(data)=><User data={data}/>}> </Provider> 
    )
  }
}

/**
 * 8. 属性代理
 * 用于预先将业务组件，进行数据的封装，便于我们方便获取数据 应用：redux mobix 数据管理框架
 */
import React,{Component} from 'React'
import PropTypes from 'prop-types'

const connect = key => Com =>{
  class connectComponent extends Component { 
    constructor(props){
      super(props)
      this.state = {
        [key]:store[key]
      }
    }
    render(){
      return <Com {...this.state} />
    }
    componentDidMount(){
      let that = this
      window.test = new Proxy(test,{
        get: function(target,key,receiver) {
          return Reflect.get(target,key,receiver)
        },
        set:function(target,key,value,receiver){
          that.setState({
            [key]:value
          })
          return Reflect.set(target,key,value,receiver)
        }
      })
    }
  }
  return connectComponent
}

let store = {
  name:'hello',
  age:10
}

@connect('age')
class User extends Component{
  render(){
    return <div>{this.props.age}</div>
  }
}
//相当于 User= connect('age')(User)
class App extends Component{
  render(){
    return <User />
  }
}
/**
 * 9.反向代理 主要用于交互的封装
 */
const loading = Com =>{
  class LoadingComponent extends Com { //继承Com组件，相当于给Com组件添加额外方法
    // render(){ //render劫持 会覆盖掉 Com组件本而来要渲染的内容 
    //   return (
    //     <div>
    //       Loading-Component
    //       {super.render()} //引入Com组件要渲染的内容
    //     </div>
    //   )
    // }
    showLoading(){
      console.log('loading....')
    }
    hideLoading(){
      console.log('hide')
    }
  }
  return LoadingComponent
}
@loading
class User extends Component{
  render(){
    return <div>User</div>
  }
  componentDidMount(){
    this.showLoading() //使用子类的方法
    this.hideLoading()
  }
}
class App extends Component{
  render(){
    return <User />
  }
}

/**
 * 属性代理：继承原始组件类Component；必须写render函数，并将数据传入参数组件Com ；用于数据管理，将数据进行全局封装，然后供子组件使用
 * 反向继承：继承参数组件类Com      ；避免写render函数，防止覆盖Com原有Dom结构  ；用于业务封装，将相同该功能附到多个组件
 */

 /**
  * 9.react HOOKS通过函数实现组件编写，实现class声明组件的过程 主要用于实现公共部分的功能
  */
 import React,{useState,useEffect} from 'react'

 const App = (props)=>{
   /**
    * 通过useState函数声明组件内state数据
    * 参数表示初始值
    * 返回一个数组，数组第一项表示声明的state变量，第二项表示更新数据的函数
    * 调用更新数据函数时需要注意 如果声明的数据是一个数组，需要对齐进行展开处理(传递一个具有新地址的数组)，否则无法检测到数组是否发生了变化
    * 例 let [data,setData] = useState([1,2,3]) 
    * (val)=>{data.push(val) ; setData([...data])}
    */
   let [time,setTime] = useState(0) 
   
   let [value,setValue] = useState('js')
   /**
    * 通过useEffect函数定义各个生命周期函数，
    * 不传递第二个参数时，表示componentDidMount 和componentDidUpdate 都会调用第一个参数传进的函数
    * 当传递第二个参数是一个空数组时，表示第一个参数传进的函数仅在componentDidMount的时候被调用
    * 当传递第二个参数里面函数变量名时，表示当该变量发生变化时，调用第一个参数的方法，相当于在shouldComponentUpdate内根据参数决定是否更新
    * 当第一个参数返回了一个函数时，这个函数会在componentWillUnMount时期被调用
    */
   useEffect(()=>{
     console.log('hell')
     return ()=>console.log('willUnmount')
   })
   return (
     <div>

       <p>{props.name}</p> /**通过props参数传进数据 */
       hello world {time}
       <button onClick={(e)=>setTime(time+1)}></button>
       <input value={value} onChange={(e)=>setValue(e.target.value)}/>
     </div>
   )
 }
 export default App
 /**
  * 9. ts 与react 
  */
 //create-react-app my-app --scripts-version=react-script-ts && cd my-app 可以创建使用ts的react 项目
 //.jsx与.js区别，.tsx与.ts区别？