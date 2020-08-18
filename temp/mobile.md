# 移动端项目引入rem单位
## 最终解决方案
### 安装 amfe-flexible
npm install --save-dev amfe-flexible
在main.js中引入
```
import 'amfe-flexible'
```
在index.html头部插入
```
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
```
### 安装 postcss-px2rem-exclude
npm install --save-dev postcss-px2rem-exclude
修改 .postcssrc.js
```
module.exports = {
  "plugins": {
    "postcss-import": {},
    "autoprefixer": {},
    'postcss-px2rem-exclude':{
        //rootValue: remConfig.remUnit,
        remUnit: 75,
        exclude: /node_modules/i,
        mediaQuery: false,
        minPixelValue: 3
      }
  }
}
```

## 弯路
引入了px2remLoader
引入amfe-flexible，然后安装px2remLoader，并配置如下后，
会造成vue文件内样式单位不会被转为rem,但会把第三方组件库里面的样式单位改成rem

```
exports.cssLoaders = function (options) {
  //新增
  const px2remLoader = {
    loader:'px2rem-loader',
    options:{
      remUnit:remConfig.remUnit
    }
  }
  //修改
  function generateLoaders (loader, loaderOptions) {
    //const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader, px2remLoader] : [cssLoader, px2remLoader]
  }
}

```
# 将svg转成icon

在src/components中新增SvgIcon文件夹
新增index.js 文件,构建SvgIcon组件 
```
src/components/SvgIcon/index.js
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"/>
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.iconClass}`
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>

```
在src文件夹下新增icons文件夹
icons文件夹下
新增svg文件夹，存放svg文件，例如user.svg
新增index.js
```
import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg组件

// 全局注册
Vue.component('svg-icon', SvgIcon)

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
```
在main.js中引入
```
import './icons'
```
安装loader
npm install svg-sprite-loader --save-dev

更改webpack.base.conf.js文件
```

module: {
    rules: [
      { //在url-loader配置前面新增
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/icons')],
        options: {
          symbolId: 'icon-[name]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        },
        exclude: [resolve('src/icons')] //修改url-loader配置
      },
    ]
```
使用
icon-class 值为svg文件名
```
 <svg-icon icon-class="user"/>
```