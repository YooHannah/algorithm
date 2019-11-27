1.使用现有主题
在.vuepress/config中设置
```
module.exports = {
  theme:''//主题名
  themeConfig:{ //主题需要的相应配置

  }
}
```
2.自定义主题
在跟目录下新建theme文件夹
```
theme
|——global-components //该目录下组件会被自动注册成全局组件
|
|——components //VUE组件
|
|——layouts
|  |—— layout.vue(Mandatory) //所有页面默认使用的布局组建
|  |—— 404.vue //路由匹配不到的页面默认页面
|
|——styles //定义全局样式和调色板
|  |——index.styl
|  |——palette.styl
|
|__index.js //主题文件的入口文件

```
3.插件
@vuepress/plugin-pwa 自动生成service-work，产生缓存，可供离线使用，从而让网站更块
@vuepress/plugin-search 基于h1,h2等标签，去vuepress源数据中查找，将得到结果重新渲染，让搜索更简单
@vuepress/plugin-blog 让博客主题更简单
@vuepress-plugin-yuque 创造纯动态数据源的可能性，将文档编写，部署，发布全部在vuepress中实现
4.自定义首页
在doc文件夹下将README.md修改为
```
---
layout:layout //项目会自动到.vuepress文件夹下的component文件夹下去寻找layout组件
---
```