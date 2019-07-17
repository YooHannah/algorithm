2.返回除了内容之外的东西
this.callback 是 Webpack 给 Loader 注入的 API，以方便 Loader 和 Webpack 之间通信。 this.callback 的详细使用方法如下：
```
this.callback( 
    // 当无法转换原内容时，给 Webpack 返回一个 Error 
    err: Error | null, 
    // 原内容转换后的内容 
    content: string | Buffer, 
    // 用于把转换后的内容得出原内容的 Source Map，方便调试 
    sourceMap?: SourceMap, 
    // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回， 
    // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能 
    abstractSyntaxTree?: AST 
); 
```
实例：用 babel-loader 转换 ES6 代码为例，它还需要输出转换后的 ES5 代码对应的 Source Map，以方便调试源码
```
module.exports = function(source) { 
  // 通过 this.callback 告诉 Webpack 返回的结果 
  this.callback(null, source, sourceMaps); 
  // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined， 
  // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中  
  return; 
}; 
```
Source Map 的生成很耗时，通常在开发环境下才会生成 Source Map，其它环境下不用生成，以加速构建。 为此 Webpack 为 Loader 提供了 this.sourceMap API 去告诉 Loader 当前构建环境下用户是否需要 Source Map。
3.处理异步流程
```
module.exports = function(source) { 
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果 
    var callback = this.async(); 
    someAsyncOperation(source, function(err, result, sourceMaps, ast) { 
        // 通过 callback 返回异步执行后的结果 
        callback(err, result, sourceMaps, ast); 
    }); 
}; 
```
4.处理二进制数据
```
module.exports = function(source) { 
    // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的 
    source instanceof Buffer === true; 
    // Loader 返回的类型也可以是 Buffer 类型的 
    // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果 
    return source; 
}; 
// 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据  
module.exports.raw = true; //没有该行 Loader 只能拿到字符串。
```
5.缓存加速
在有些情况下，有些转换操作需要大量计算非常耗时，如果每次构建都重新执行重复的转换操作，构建将会变得非常缓慢。 为此，Webpack 会默认缓存所有 Loader 的处理结果，也就是说在需要被处理的文件或者其依赖的文件没有发生变化时， 是不会重新调用对应的 Loader 去执行转换操作的。
如果想让Webpack 不缓存该 Loader 的处理结果，可以这样
```
module.exports = function(source) { 
  // 关闭该 Loader 的缓存功能 
  this.cacheable(false); 
  return source; 
}; 
```
其他API

this.context：当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src。

this.resource：当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。

this.resourcePath：当前处理文件的路径，例如 /src/main.js。

this.resourceQuery：当前处理文件的 querystring。

this.target：等于 Webpack 配置中的 Target。

this.loadModule：当 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时， 就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果。

this.resolve：像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string))。

this.addDependency：给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string)。

this.addContextDependency：和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string)。

this.clearDependencies：清除当前正在处理文件的所有依赖，使用方法为 clearDependencies()。

this.emitFile：输出一个文件，使用方法为 emitFile(name: string, content: Buffer|string, sourceMap: {...})。

加载本地loader
## 方法一 Npm link
Npm link 专门用于开发和调试本地 Npm 模块，能做到在不发布模块的情况下，把本地的一个正在开发的模块的源码链接到项目的 node_modules 目录下，让项目可以直接使用本地的 Npm 模块。 由于是通过软链接的方式实现的，编辑了本地的 Npm 模块代码，在项目中也能使用到编辑后的代码。

完成 Npm link 的步骤如下：

1.确保正在开发的本地 Npm 模块（也就是正在开发的 Loader）的 package.json 已经正确配置好；
2.在本地 Npm 模块根目录下执行 npm link，把本地模块注册到全局；
3.在项目根目录下执行 npm link loader-name，把第2步注册到全局的本地 Npm 模块链接到项目的 node_moduels 下，其中的 loader-name 是指在第1步中的 package.json 文件中配置的模块名称。

链接好 Loader 到项目后就可以像使用一个真正的 Npm 模块一样使用本地的 Loader 了。

## 方法二 ResolveLoader
ResolveLoader用于配置 Webpack 如何寻找 Loader,默认情况下只会去 node_modules 目录下寻找，为了让 Webpack 加载放在本地项目中的 Loader 需要修改 resolveLoader.modules。
假如本地的 Loader 在项目目录中的 ./loaders/loader-name 中，则需要如下配置：
```
module.exports = { 
  resolveLoader:{ 
    // 去哪些目录下寻找 Loader，有先后顺序之分 
    modules: ['node_modules','./loaders/'], 
  } 
} 
```
# plugin

## 工作原理
plugin内容
```
class BasicPlugin{ 
  // 在构造函数中获取用户给该插件传入的配置 
  constructor(options){ 
  } 
 
  // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象 
  apply(compiler){ 
    compiler.plugin('compilation',function(compilation) { 
    }) 
  } 
} 
 
// 导出 Plugin 
module.exports = BasicPlugin; 
```
使用
```
const BasicPlugin = require('./BasicPlugin.js'); 
module.export = { 
  plugins:[ 
    new BasicPlugin(options), 
  ] 
} 
```
Webpack 启动后，在读取配置的过程中会先执行 new BasicPlugin(options) 初始化一个 BasicPlugin 获得其实例。 在初始化 compiler 对象后，再调用 basicPlugin.apply(compiler) 给插件实例传入 compiler 对象。 插件实例在获取到 compiler 对象后，就可以通过 compiler.plugin(事件名称, 回调函数) 监听到 Webpack 广播出来的事件。 并且可以通过 compiler 对象去操作 Webpack。

## Compiler 和 Compilation
Compiler 和 Compilation 的含义如下：

1.Compiler 对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例；

2.Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。

Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

## 事件流
Webpack 就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。 这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。
Webpack 通过 Tapable 来组织这条复杂的生产线。 Webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条生产线中，去改变生产线的运作。 Webpack 的事件流机制保证了插件的有序性，使得整个系统扩展性很好。

Webpack 的事件流机制应用了观察者模式，和 Node.js 中的 EventEmitter 非常相似。 Compiler 和 Compilation 都继承自 Tapable，可以直接在 Compiler 和 Compilation 对象上广播和监听事件，方法如下：
```
/ 
 广播出事件 
 event-name 为事件名称，注意不要和现有的事件重名 
 params 为附带的参数 
/ 
compiler.apply('event-name',params); 
 
/ 
 监听名称为 event-name 的事件，当 event-name 事件发生时，函数就会被执行。 
 同时函数中的 params 参数为广播事件时附带的参数。 
*/ 
compiler.plugin('event-name',function(params) { 
 
}); 
```
compilation.apply 和 compilation.plugin 使用方法和上面一致。

在开发插件时，还需要注意以下两点：

1.只要能拿到 Compiler 或 Compilation 对象，就能广播出新的事件，所以在新开发的插件中也能广播出事件，给其它插件监听使用。
2.传给每个插件的 Compiler 和 Compilation 对象都是同一个引用。也就是说在一个插件中修改了 Compiler 或 Compilation 对象上的属性，会影响到后面的插件。
3.有些事件是异步的，这些异步的事件会附带两个参数，第二个参数为回调函数，在插件处理完任务时需要调用回调函数通知 Webpack，才会进入下一处理流程。例如：
```
compiler.plugin('emit',function(compilation, callback) { 
    // 支持处理逻辑 
 
    // 处理完毕后执行 callback 以通知 Webpack  
    // 如果不执行 callback，运行流程将会一直卡在这不往下执行  
    callback(); 
  }); 
```
## 常用API
### 监听文件变化
 Webpack 会从配置的入口模块出发，依次找出所有的依赖模块，当入口模块或者其依赖的模块发生变化时， 就会触发一次新的 Compilation。
 通过【watch-run】 事件可以知道是哪个文件发生变化导致了新的 Compilation
```
/ 当依赖的文件发生变化时会触发 watch-run 事件 
compiler.plugin('watch-run', (watching, callback) => { 
    // 获取发生变化的文件列表 
    const changedFiles = watching.compiler.watchFileSystem.watcher.mtimes; 
    // changedFiles 格式为键值对，键为发生变化的文件路径。 
    if (changedFiles[filePath] !== undefined) { 
      // filePath 对应的文件发生了变化 
    } 
    callback(); 
}); 
```
默认情况下 Webpack 只会监视入口和其依赖的模块是否发生变化，在有些情况下项目可能需要引入新的文件，例如引入一个 HTML 文件。 由于 JavaScript 文件不会去导入 HTML 文件，Webpack 就不会监听 HTML 文件的变化，编辑 HTML 文件时就不会重新触发新的 Compilation。 为了监听 HTML 文件的变化，我们需要把 HTML 文件加入到依赖列表中，为此可以使用如下代码
```
compiler.plugin('after-compile', (compilation, callback) => { 
  // 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译 
    compilation.fileDependencies.push(filePath); 
    callback(); 
}); 

```
### 读取输出资源、代码块、模块及其依赖
在 【emit】 事件发生时，代表源文件的转换和组装已经完成，在这里可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容。 插件代码如下：
```
class Plugin { 
  apply(compiler) { 
    compiler.plugin('emit', function (compilation, callback) { 
      // compilation.chunks 存放所有代码块，是一个数组 
      compilation.chunks.forEach(function (chunk) { 
        // chunk 代表一个代码块 
        // 代码块由多个模块组成，通过 chunk.forEachModule 能读取组成代码块的每个模块 
        chunk.forEachModule(function (module) { 
          // module 代表一个模块 
          // module.fileDependencies 存放当前模块的所有依赖的文件路径，是一个数组 
          module.fileDependencies.forEach(function (filepath) { 
          }); 
        }); 
 
        // Webpack 会根据 Chunk 去生成输出的文件资源，每个 Chunk 都对应一个及其以上的输出文件 
        // 例如在 Chunk 中包含了 CSS 模块并且使用了 ExtractTextPlugin 时， 
        // 该 Chunk 就会生成 .js 和 .css 两个文件 
        chunk.files.forEach(function (filename) { 
          // compilation.assets 存放当前所有即将输出的资源 
          // 调用一个输出资源的 source() 方法能获取到输出资源的内容 
          let source = compilation.assets[filename].source(); 
        }); 
      }); 
 
      // 这是一个异步事件，要记得调用 callback 通知 Webpack 本次事件监听处理结束。 
      // 如果忘记了调用 callback，Webpack 将一直卡在这里而不会往后执行。 
      callback(); 
    }) 
  } 
} 
```
### 修改输出资源
有些场景下插件需要修改、增加、删除输出的资源，要做到这点需要监听 emit 事件，因为发生 emit 事件时所有模块的转换和代码块对应的文件已经生成好， 需要输出的资源即将输出，因此 emit 事件是修改 Webpack 输出资源的最后时机。

所有需要输出的资源会存放在 compilation.assets 中，compilation.assets 是一个键值对，键为需要输出的文件名称，值为文件对应的内容。

设置 compilation.assets 的代码如下：
```
compiler.plugin('emit', (compilation, callback) => { 
  // 设置名称为 fileName 的输出资源 
  compilation.assets[fileName] = { 
    // 返回文件内容 
    source: () => { 
      // fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer 
      return fileContent; 
      }, 
    // 返回文件大小 
      size: () => { 
      return Buffer.byteLength(fileContent, 'utf8'); 
    } 
  }; 
  callback(); 
}); 
```
读取 compilation.assets 的代码如下：
```
compiler.plugin('emit', (compilation, callback) => { 
  // 读取名称为 fileName 的输出资源 
  const asset = compilation.assets[fileName]; 
  // 获取输出资源的内容 
  asset.source(); 
  // 获取输出资源的文件大小 
  asset.size(); 
  callback(); 
}); 
```
### 判断 Webpack 使用了哪些插件
```
// 判断当前配置是否使用了 ExtractTextPlugin， 
// compiler 参数即为 Webpack 在 apply(compiler) 中传入的参数 
function hasExtractTextPlugin(compiler) { 
  // 当前配置所有使用的插件列表 
  const plugins = compiler.options.plugins; 
  // 去 plugins 中寻找有没有 ExtractTextPlugin 的实例 
  return plugins.find(plugin=>plugin.proto.constructor === ExtractTextPlugin) != null; 
} 
```
### 一个例子
```
class EndWebpackPlugin { 
 
  constructor(doneCallback, failCallback) { 
    // 存下在构造函数中传入的回调函数 
    this.doneCallback = doneCallback; 
    this.failCallback = failCallback; 
  } 
 
  apply(compiler) { 
    //done：在成功构建并且输出了文件后，Webpack 即将退出时发生；
    compiler.plugin('done', (stats) => { 
        // 在 done 事件中回调 doneCallback 
        this.doneCallback(stats); 
    }); 
    //failed：在构建出现异常导致构建失败，Webpack 即将退出时发生；
    compiler.plugin('failed', (err) => { 
        // 在 failed 事件中回调 failCallback 
        this.failCallback(err); 
    }); 
  } 
} 
// 导出插件  
module.exports = EndWebpackPlugin; 

//使用
module.exports = { 
  plugins:[ 
    // 在初始化 EndWebpackPlugin 时传入了两个参数，分别是在成功时的回调函数和失败时的回调函数； 
    new EndWebpackPlugin(() => { 
      // Webpack 构建成功，并且文件输出了后会执行到这里，在这里可以做发布文件操作 
    }, (err) => { 
      // Webpack 构建失败，err 是导致错误的原因 
      console.error(err);    }) 
  ] 
} 
```

# 流程概括
Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

1.初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
（启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler。）
2.开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3.确定入口：根据配置中的 entry 找出所有的入口文件；
4.编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
5.完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6.输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
7.输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

# 流程细节
1.初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler。
2.编译：从 Entry 发出，针对每个 Module 串行调用对应的 Loader 去翻译文件内容，再找到该 Module 依赖的 Module，递归地进行编译处理。
3.输出：对编译后的 Module 组合成 Chunk，把 Chunk 转换成文件，输出到文件系统。

初始化阶段事件
<table>
<thead>
<tr>
<th>事件名</th>
<th>解释</th>
</tr>
</thead>
<tbody>
<tr>
<td>初始化参数</td>
<td>从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。 这个过程中还会执行配置文件中的插件实例化语句 <code>new Plugin()</code>。</td>
</tr>
<tr>
<td>实例化 Compiler</td>
<td>用上一步得到的参数初始化 Compiler 实例，Compiler 负责文件监听和启动编译。Compiler 实例中包含了完整的 Webpack 配置，全局只有一个 Compiler 实例。</td>
</tr>
<tr>
<td>加载插件</td>
<td>依次调用插件的 apply 方法，让插件可以监听后续的所有事件节点。同时给插件传入 compiler 实例的引用，以方便插件通过 compiler 调用 Webpack 提供的 API。</td>
</tr>
<tr>
<td>environment</td>
<td>开始应用 Node.js 风格的文件系统到 compiler 对象，以方便后续的文件寻找和读取。</td>
</tr>
<tr>
<td>entry-option</td>
<td>读取配置的 Entrys，为每个 Entry 实例化一个对应的 EntryPlugin，为后面该 Entry 的递归解析工作做准备。</td>
</tr>
<tr>
<td>after-plugins</td>
<td>调用完所有内置的和配置的插件的 apply 方法。</td>
</tr>
<tr>
<td>after-resolvers</td>
<td>根据配置初始化完 resolver，resolver 负责在文件系统中寻找指定路径的文件。</td>
</tr>
</tbody>
</table>

编译阶段事件
<table>
<thead>
<tr>
<th>事件名</th>
<th>解释</th>
</tr>
</thead>
<tbody>
<tr>
<td>build-module</td>
<td>使用对应的 Loader 去转换一个模块。</td>
</tr>
<tr>
<td>normal-module-loader</td>
<td>在用 Loader 对一个模块转换完后，使用 acorn 解析转换后的内容，输出对应的抽象语法树（AST），以方便 Webpack 后面对代码的分析。</td>
</tr>
<tr>
<td>program</td>
<td>从配置的入口模块开始，分析其 AST，当遇到 <code>require</code> 等导入其它模块语句时，便将其加入到依赖的模块列表，同时对新找出的依赖模块递归分析，最终搞清所有模块的依赖关系。</td>
</tr>
<tr>
<td>seal</td>
<td>所有模块及其依赖的模块都通过 Loader 转换完成后，根据依赖关系开始生成 Chunk。</td>
</tr>
</tbody>
</table>
输出阶段事件
<table>
<thead>
<tr>
<th>事件名</th>
<th>解释</th>
</tr>
</thead>
<tbody>
<tr>
<td>should-emit</td>
<td>所有需要输出的文件已经生成好，询问插件哪些文件需要输出，哪些不需要。</td>
</tr>
<tr>
<td>emit</td>
<td>确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出内容。</td>
</tr>
<tr>
<td>after-emit</td>
<td>文件输出完毕。</td>
</tr>
<tr>
<td>done</td>
<td>成功完成一次完成的编译和输出流程。</td>
</tr>
<tr>
<td>failed</td>
<td>如果在编译和输出流程中遇到异常导致 Webpack 退出时，就会直接跳转到本步骤，插件可以在本事件中获取到具体的错误原因。</td>
</tr>
</tbody>
</table>

在输出阶段已经得到了各个模块经过转换后的结果和其依赖关系，并且把相关模块组合在一起形成一个个 Chunk。 在输出阶段会根据 Chunk 的类型，使用对应的模版生成最终要要输出的文件内容


