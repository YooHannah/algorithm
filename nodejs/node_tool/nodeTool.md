
 * 编写工具需要的包
 * commander :用来处理命令行指令（处理用户输入的命令行）
 * inquirer:用来和用户进行交互（询问相关配置）
 * ora:下载动画（显示进度条等） 
 * chalk:给终端字体加颜色
 * download-git-keep:用来下载git仓库的项目
 * 
 * 做一个构建工具的流程
 * ---package.json文件中定义命令,key值bin配置，执行key值name设置的命令，的入口文件
 * ---把命令link到npm（本地测试需要，在工具文件夹下执行‘npm link’，如果命令工具的包通过npm install安装则不用link）
 * ---编写执行文件
 * ---读取项目模板(来源可能是git仓库，服务器，也可能是工具本身自带)
 * ---写入本地
 