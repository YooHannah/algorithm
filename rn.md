# react-navigation
## 安装
```
yarn add react-navigation
yarn add react-native-gesture-handler
react-native link react-native-gesture-handler //Link 所有的原生依赖
```
## 配置
```
APP.js
import React from "react"; 
import { View, Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation"; 
class HomeScreen extends React.Component {
     render() {
          return (
               <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}> 
                    <Text>Home Screen</Text> 
               </View> ); 
    } } 
const AppNavigator = createStackNavigator(
    {
        HomeComponent: { screen: HomeScreenComponent } //screen属性设置组件路由,HomeScreen只是一个组件
        Home: HomeScreen,//直接配置页面路由
        Details: DetailsScreen
    },
    {
        initialRouteName: "Home"//指定默认路由
        defaultNavigationOptions: { //指定全局默认标题样式
            headerStyle: {
                backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        },
    });
const AppContainer = createAppContainer(AppNavigator);
export default class App extends React.Component {
  someEvent() {
    // call navigate for AppNavigator here:
    this.navigator &&
      this.navigator.dispatch( //在 App 容器中使用 dispatch，可以使用 ref 来调用 dispatch 方法
        NavigationActions.navigate({ routeName: someRouteName })
      );
  }
  render() {
    return <AppContainer
        //每当导航器管理的 navigation state 发生变化时，都会调用该函数 
        onNavigationStateChange={handleNavigationChange} 
        uriPrefix="/app"//应用可能会处理的 URI 前缀， 在处理一用于提取传递给 route 的一个 深度链接时将会用到
        ref={nav => {
          this.navigator = nav;
        }}
    />;
  }
}
```
## 跳转
this.props.navigation.navigate(路由名,传参对象)//跳转其他页，如果跳转本页，没反应
this.props.navigation.push(路由名)//可以重新加载当前页
每次调用 ' push ' 时, 我们会向导航堆栈中添加新路由。 
当你调用 ' navigate ' 时, 它首先尝试查找具有该名称的现有路由, 并且只有在堆栈上没有一个新路由时才会推送该路由。
读取页面组件中的参数的方法：
this.props.navigation.state.params
this.props.navigation.getParam(key值)

如果当前页面可以执行返回操作，则 stack navigator 会自动提供一个包含返回按钮的标题栏
如果导航堆栈中只有一个页面，则没有任何可返回的内容，因此也不存在返回键。
this.props.navigation.goBack() //手动返回上一页

如果处在堆栈深处，上面有多个页面，此时想要将上面所有的页面都销毁，并返回第一个页面。 
在这种情况下，我们知道我们要回到' Home '，所以我们可以使用' navigate('Home') ',而不是` push `
另一个选择是' navigation.popToTop() '，它可以返回到堆栈中的第一个页面。

如何发现用户离开和回来的某页面？
一个包含 页面 A 和 B 的 StackNavigator ，当跳转到 A 时，componentDidMount 方法会被调用； 当跳转到 B 时，componentDidMount 方法也会被调用，但是 A 依然在堆栈中保持 被加载状态，他的 componentWillUnMount 也不会被调用。
当从 B 跳转到 A，B的 componentWillUnmount 方法会被调用，但是 A 的 componentDidMount方法不会被调用，应为此时 A 依然是被加载状态。
React Navigation 将事件发送到订阅了它们的页面组件： 有4个不同的事件可供订阅：willFocus、willBlur、didFocus 和 didBlur。

## 标题栏
使用 组件静态属性navigationOptions

### 内容配置
title属性
方式一:对象
```
static navigationOptions = {
    title: 'Home',
  };
```
方式二：返回对象的属性
```
static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('otherParam', 'A Nested Details Screen'),
    };
  };
```
尝试在navigationOptions中使用this.props可能很诱人，但因为它是组件的静态属性，所以this不会指向一个组件的实例，因此没有 props 可用。 相反，如果我们将navigationOptions作为一个函数，那么React Navigation将会用包含{navigation，navigationOptions，screenProps}的对象调用它 -- 在这种情况下，我们只用关心navigation，它是与传递给页面的this.props.navigation相同的对象

从已加载的页面组件本身更新当前页面的navigationOptions配置
this.props.navigation.setParams({otherParam: 'Updated!'})

### 标题样式
headerStyle：一个应用于 header 的最外层 View 的 样式对象， 如果设置 backgroundColor ，他就是header 的颜色。对象
headerTintColor：返回按钮和标题都使用这个属性作为它们的颜色。字符串
headerTitleStyle：如果想为标题定制fontFamily，fontWeight和其他Text样式属性，我们可以用它来完成。对象
### 全局配置
配置路由时利用defaultNavigationOptions配置
当全局设置了默认样式，具体页面也设置了static navigationOptions，则优先使用具体页面
### 使用组件
headerTitle：配置一个组件，自定义标题的样式
headerRight：自定义右侧按钮
headerLeft：自定义左侧/返回按钮
headerBackImage：自定义返回按钮图片
注意在navigationOptions中this绑定的不是 HomeScreen 实例，所以你不能调用setState方法和其上的任何实例方法。 这一点非常重要，因为标题栏中的按钮与标题栏所属的页面进行交互是非常常见的。


