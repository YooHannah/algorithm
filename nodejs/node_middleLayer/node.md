# 中间层
MVC->MVVM 改善前后端分离
MVVM缺点：浏览器任务过重(解析JS，发ajax请求，渲染数据)；无法进行SEO
MVVM->node中间层：分担浏览器任务，可处理数据，渲染页面；拥有ssr功能，可以进行seo；可以进行优化操作
技术选型：
NODE框架
-- express,koa（减少了express许多内置模块，比如路由，让用户自定义，源码上koa采用洋葱调用，express一层一层调用）,egg
-- 考虑点：要做什么，团队人员能力，框架特点，团队习惯
视图模板
--pug(jade),art-template,ejs
-- 考虑点：性能，支持性，
相关生态的其他工具：发请求的工具；数据库的选择；redis搭配的相关工具；管理node进程的工具
node 应用
搭建全站，中间层开发，模拟数据接口，制作项目构建工具

# 高并发
垂直扩展：提高机器/硬件配置（cpu,内存，硬盘，网卡）-->单机扩展性能提高是有限的，且成本会越来越高
水平扩展：增加服务器数量，部署更多机器集群，能够带来无限的性能提升