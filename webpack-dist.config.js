//侧重优化输出质量
const path = require('path'); 
const DefinePlugin = require('webpack/lib/DefinePlugin'); 
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin'); 
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin'); 
const ExtractTextPlugin = require('extract-text-webpack-plugin'); 
const {AutoWebPlugin} = require('web-webpack-plugin'); 
const HappyPack = require('happypack'); 
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'); 
 
// 自动寻找 pages 目录下的所有目录，把每一个目录看成一个单页应用 
const autoWebPlugin = new AutoWebPlugin('./src/pages', { 
  // HTML 模版文件所在的文件路径 
  template: './template.html', 
  // 提取出所有页面公共的代码 
  commonsChunk: { 
    // 提取出公共代码 Chunk 的名称 
    name: 'common', 
  }, 
  // 指定存放 CSS 文件的 CDN 目录 URL 
  stylePublicPath: '//css.cdn.com/id/', 
}); 
 
module.exports = { 
  // AutoWebPlugin 会找为寻找到的所有单页应用，生成对应的入口配置， 
  // autoWebPlugin.entry 方法可以获取到生成入口配置 
  entry: autoWebPlugin.entry({ 
    // 这里可以加入你额外需要的 Chunk 入口 
    base: './src/base.js', 
  }), 
  output: { 
    // 给输出的文件名称加上 Hash 值 
    filename: '[name]_[chunkhash:8].js', 
    path: path.resolve(__dirname, './dist'), 
    // 指定存放 JavaScript 文件的 CDN 目录 URL 
    publicPath: '//js.cdn.com/id/', 
  }, 
  resolve: { 
    // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤 
    // 其中 __dirname 表示当前工作目录，也就是项目根目录 
    modules: [path.resolve(__dirname, 'node_modules')], 
    // 只采用 main 字段作为入口文件描述字段，以减少搜索步骤 
    mainFields: ['jsnext:main', 'main'], 
  }, 
  module: { 
    rules: [ 
      { 
        // 如果项目源码中只有 js 文件就不要写成 /\\.jsx?$/，提升正则表达式性能 
        test: /\\.js$/, 
        // 使用 HappyPack 加速构建 
        use: ['happypack/loader?id=babel'], 
        // 只对项目根目录下的 src 目录中的文件采用 babel-loader 
        include: path.resolve(__dirname, 'src'), 
      }, 
      { 
        test: /\\.js$/, 
        use: ['happypack/loader?id=ui-component'], 
        include: path.resolve(__dirname, 'src'), 
      }, 
      { 
        // 增加对 CSS 文件的支持 
        test: /\\.css$/, 
        // 提取出 Chunk 中的 CSS 代码到单独的文件中 
        use: ExtractTextPlugin.extract({ 
          use: ['happypack/loader?id=css'], 
          // 指定存放 CSS 中导入的资源（例如图片）的 CDN 目录 URL 
          publicPath: '//img.cdn.com/id/' 
        }), 
      }, 
    ] 
  }, 
  plugins: [ 
    autoWebPlugin, 
    // 4-14开启ScopeHoisting 
    new ModuleConcatenationPlugin(), 
    // 4-3使用HappyPack 
    new HappyPack({ 
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件 
      id: 'babel', 
      // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启 
      loaders: ['babel-loader?cacheDirectory'], 
    }), 
    new HappyPack({ 
      // UI 组件加载拆分 
      id: 'ui-component', 
      loaders: [{ 
        loader: 'ui-component-loader', 
        options: { 
          lib: 'antd', 
          style: 'style/index.css', 
          camel2: '-' 
        } 
      }], 
    }), 
    new HappyPack({ 
      id: 'css', 
      // 如何处理 .css 文件，用法和 Loader 配置中一样 
      // 通过 minimize 选项压缩 CSS 代码 
      loaders: ['css-loader?minimize'], 
    }), 
    new ExtractTextPlugin({ 
      // 给输出的 CSS 文件名称加上 Hash 值 
      filename: `[name]_[contenthash:8].css`, 
    }), 
    // 4-11提取公共代码 
    new CommonsChunkPlugin({ 
      // 从 common 和 base 两个现成的 Chunk 中提取公共的部分 
      chunks: ['common', 'base'], 
      // 把公共的部分放到 base 中 
      name: 'base' 
    }), 
    new DefinePlugin({ 
      // 定义 NODE_ENV 环境变量为 production 去除 react 代码中的开发时才需要的部分 
      'process.env': { 
        NODE_ENV: JSON.stringify('production') 
      } 
    }), 
    // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码 
    new ParallelUglifyPlugin({ 
      // 传递给 UglifyJS 的参数 
      uglifyJS: { 
        output: { 
          // 最紧凑的输出 
          beautify: false, 
          // 删除所有的注释 
          comments: false, 
        }, 
        compress: { 
          // 在UglifyJs删除没有用到的代码时不输出警告 
          warnings: false, 
          // 删除所有的 `console` 语句，可以兼容ie浏览器 
          drop_console: true, 
          // 内嵌定义了但是只用到一次的变量 
          collapse_vars: true, 
          // 提取出出现多次但是没有定义成变量去引用的静态值 
          reduce_vars: true, 
        } 
      }, 
    }), 
  ] 
}; 