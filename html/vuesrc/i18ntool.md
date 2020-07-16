# 背景
项目想要添加语言切换功能，负责该任务的同事由于待翻译的文本提取工作量巨大原因产生进度问题
项目领导委派我帮忙进行辅助提取的工作
# 原理
  i18n原理就是在全局挂载自己的具有翻译功能的方法，然后将需要翻译的文本作为参数传入，
  然后函数根据当前语言环境，调用相应语言的翻译文件，通过key-value形式将对应语言的翻译结果返回给页面显示
  项目中以简体中文作为key,翻译结果作为value形成翻译文件
  如
  ```
  zh-CN.js 简体中文
  '开始日期': '开始日期',
  '结束日期': '结束日期',

  zh-TW.js 繁体中文
  '开始日期': '開始日期',
  '结束日期': '結束日期',
  ```
  需要做的大量工作就是将项目中前端写的会展示在页面上的文本全部提取出来，形成文件，
  并给相应的简体中文地方用i18n全局函数括起来，通过调用函数返回翻译结果
# 实现
因为同事使用纯手工作业，所以进度缓慢，按照这种做法，与其说自己比较懒，一个一个手动改，不如说自己觉得这种方式很low
一点都不酷，所以想起之前学习过的nodejs的知识，通过读取文件然后处理文件，最后生成新文件，用新文件替换老文件
处理文件过程会将简体中文提取出来形成文本提取文件，新文件中的简体中文会被i18n的全局函数包裹
## 读取
```
var fs = require('fs'); //引入文件处理模块
function read_file_sync(file_path) {
  var data = fs.readFileSync(file_path, 'utf-8'); //读取文件
  let arr = file_path.split('/')
  let len = arr.length
  let temp = arr[len-1].split('.')[0] 
  //获取文件名，如果待处理文件是子目录下的，保持生成的文本提取文件和新文件与原来文件保持相同目录结构
  let fileName = arr[len-2] === 'console'?temp:arr.slice(4,arr.length-1).join('/')+'/'+temp //子目录情况
  GetChinese(data,fileName)
}
read_file_sync('./src/components/console/san-manage.vue')
```
提取生成文件
```
function GetChinese(strValue,fileName) { 
  if(strValue=== null || strValue === ""){ 
    return []
   }
  let originData = strValue
  let arr = getWords(originData) //提取简体中文
  let obj = {}
  arr.map(item=>{obj[item]=''})
  let str = JSON.stringify(obj,'',"  ")
  str = 'export default '+ str
  //生成文本文件
  fs.writeFile('./words/js/'+fileName+'.js', str,function(err){ 
    if(err) console.log('提取操作失败');
    else console.log('提取操作成功');
  });
  //添加i18n全局函数，替换老文件，生成新文件
  let index = originData.indexOf('<script>')
  let template = originData.substring(0,index)//这里仅替换VUE文件的template模板部分，因为js部分有时涉及到拼接处理，单独处理
  let templateResult = partTransfor(template) //得到替换结果
  let other = originData.substring(index)//获取vue文件里面的js部分
  //二者拼接写入新文件
  fs.writeFile('./words/vue/'+fileName+'.vue', templateResult+other, function(err){ 
    if(err) console.log('重写文件操作失败');
    else console.log('重写文件操作成功');
  });
} 
```
## 提取
利用正则提取简体中文
```
function getWords(strValue,flag){
 //flag为true的时候，提取template部分简体中文，供替换使用
 //flag为false的时候，提取全部简体中文，二者正则不同
  var reg = flag? /\"?([0-9a-zA-Z\u4e00-\u9fa5|\-|\s|\(|\)\:\：\、\，\,\！\!\。])+/g : /(([0-9a-zA-Z]+)?[\u4e00-\u9fa5|\-|\s|\(|\)\、\，\,\:\：\！\!\。\~]([0-9a-zA-Z]+)?)+/g
  //匹配注释的正则，注释不用提取翻译，故提取前先移除
  let regCommon = /(\/\/[\w\s\,\，\‘\(\)\—\:\：\=\>\、\？\。a-zA-Z\.\u4e00-\u9fa5|\[|\]|-]*\n)|(\<\!\-\-[\w\s\‘\-\、a-zA-Z\u4e00-\u9fa5|\[|\]|-]*\-\-\>)|(\/\*[\w\‘\s\r\n\*\u4e00-\u9fa5|\-]*\*\/)/g
  strValue = strValue.replace(regCommon, function(word) { // 去除注释后的文本
    return ''
  });
  //优化提取结果，去重，过滤，排序
  let res = [...new Set(strValue.match(reg))].filter(item=>{return /([\u4e00-\u9fa5])+/g.test(item)}).map(item=>{return item.trim()})
  res = res.sort((a,b)=>{
    return b.length-a.length
  })
  return res
}
```
### 去掉注释
<!-- https://www.cnblogs.com/tugenhua0707/p/11332463.html -->
本来想参考webpack打包时去除注释的正则，发现webpack去除注释，用的分词
直接通过判断astnode类型去判断是否为注释，然后根据配置决定保留去除
后来想起在阅读vue源码的时候有看到过在解析html的时候有形成注释类型的节点
所以从vue 源码中试图寻找注释的正则，发现vue也是只通过注释开头标志//，/** 或者<!--
来判断注释开始，所以我在此基础上自己编写了解析注释的正则并将他们去除
## 替换
替换文本，用括号括起来
```
function partTransfor(strValue){
  let originData = strValue
  let res = getWords(strValue,true) //拿到template部分简体中文
  for(let str of res){
    let placeholder = str.charAt(0) ==='\"' 
    let temp = placeholder?str.substring(1):str
    let reg1 = new RegExp(str,'ig')
    let reg2 = new RegExp("placeholder=\"("+temp+")\"",'ig')
    let reg = placeholder?reg2:reg1
    originData = originData.replace(reg,function(word,str){
      if(placeholder){ //如果是placeholder部分的简体中文
        return ':placeholder="i18nTitle(\''+str+'\')"'
      }else{
        if(/[\u4e00-\u9fa5\:\']/.test(originData[str-1]) || /[\u4e00-\u9fa5\:\']/.test(originData[str+word])){ //对于一些包含特殊字符连接的手动处理
          return word
        }
        return '{{i18nTitle(\''+word+'\')}}' //对于纯简体中文用函数包裹进行替换
      }
    })
  }
  return originData
} 
```
其实需要处理的情况分三种
1.js里面用this.i18nTitle('xxx')
2.placeholder='xxx'改成:placehoder="i18nTitle('xxxx')"
3.单纯标签的这种，<label>xxxx</label>改成<label>{{i18nTitle(xxxx)}}</label>
另外涉及到组件里面的就直接在组件里需要展示的配置的中文简体字段变量外加全局函数

## 合并
每个文件提取处理好后，将所有字段合成一个文件，做去重处理
```
var fs = require('fs');
var path = require('path');//解析需要遍历的文件夹
var filePath = path.resolve('./words/js');
var words = []
const getFileOfDirSync = (dir) => {
  let files = fs.readdirSync(dir);
  let result;
  if (files) {
    result = files.map((file) => {
      let filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        return getFileOfDirSync(filePath); //递归
      } else {
        let content = fs.readFileSync(filePath, 'utf-8');
        content = content.replace('export default','module.exports =') //更改模块编写方法
        fs.writeFileSync(filePath,content);//方便读取
        let data = require(filePath)
        let keys = Object.keys(data)
        let comment = content.substring(0,content.indexOf('module'))
        return keys;
      }
    });
  }
  return [... new Set(result.flat(Infinity))]; //数组摊平去重
}
let res = getFileOfDirSync(filePath)
res = res.sort((a,b)=>{
  return b.length-a.length
})
let obj = {}
res.map(item=>{obj[item]=''})
//res.map(item=>{obj[item]=item}) //直接生成简体中文翻译文件
let str = JSON.stringify(obj,'',"  ")
str = 'export default '+ str
fs.writeFile('./words/cnAll1.js', str,function(err){
  if(err) console.log('提取操作失败');
  else console.log('提取操作成功');
});
```
## 翻译
根据简体中文和翻译结果形成翻译文件
```
let obj = {}
let ll = {}
let llkeys  = Object.keys({ //翻译结果
  '建議選擇購買當前雲裸機已掛載使用的存儲類型和磁盤類型':'',
  '超高端存儲：穩定性和安全性最好，適用於核心業務系統':'',
  '高端存儲：穩定性和安全性較好，適用於重要業務系統':'',
  '中端存儲：穩定性和安全性壹般，適用於壹般業務系統':'',
  '普通存儲：穩定性和安全性較差，適用於邊緣業務系統':'',
  'NVME：新壹代固態磁盤，性能最好、延時最低，適用於核心業務系統':'',
  'SSD：固態磁盤，性能較好、延時較低，適用於重要業務系統':'',
  'SAS：機械磁盤，性能壹般、延時壹般，適用於壹般業務系統':'',
  'SATA：機械磁盤，性能較差、延時較高，適用於邊緣業務系統和歸檔數據':'',
})
let objkeys = Object.keys({ //简体中文
  '建议选择购买当前云裸机已挂载使用的存储类型和磁盘类型':'',
  '超高端存储：稳定性和安全性最好，适用于核心业务系统':'',
  '高端存储：稳定性和安全性较好，适用于重要业务系统':'',
  '中端存储：稳定性和安全性一般，适用于一般业务系统':'',
  '普通存储：稳定性和安全性较差，适用于边缘业务系统':'',
  'NVME：新一代固态磁盘，性能最好、延时最低，适用于核心业务系统':'',
  'SSD：固态磁盘，性能较好、延时较低，适用于重要业务系统':'',
  'SAS：机械磁盘，性能一般、延时一般，适用于一般业务系统':'',
  'SATA：机械磁盘，性能较差、延时较高，适用于边缘业务系统和归档数据':'',
})
let tw = {}
objkeys.map((item,i)=>{
  tw[item] = llkeys[i] //生成繁体翻译文件
  obj[item] = item //生成简体中文
})

let str = JSON.stringify(tw,'',"  ")
str = 'export default '+ str
fs.writeFile('zh-TW.js', str,function(err){
  if(err) console.log('提取操作失败');
  else console.log('提取操作成功');
});

str = JSON.stringify(obj,'',"  ")
str = 'export default '+ str
fs.writeFile('zh-CN.js', str,function(err){
  if(err) console.log('提取操作失败');
  else console.log('提取操作成功');
});
```
## 后续
有新页面上新需要对新老字段进行差值处理，仅新增原来没有的字段
```
let data = require('./words/zh-CN')
let keys = Object.keys(data) //老数据
let dataNew = require('./words/cnAll1') 
let keysNew = Object.keys(dataNew)//新页面数据
let obj = {}
let newWords = keysNew.filter(newkey=>{
   return !keys.includes(newkey)
}).map(item=>{
  obj[item]=item
  return item
})//得到新增的文本
let ll = {} //新增文本翻译结果
let llkeys  = Object.keys(ll)
let objkeys = Object.keys(obj)
let tw = {}
objkeys.map((item,i)=>{
  tw[item] = llkeys[i]
})
//生成简体和繁体翻译文件，再复制粘贴到老文件中
// let str = JSON.stringify(obj,'',"  ")
let str = JSON.stringify(tw,'',"  ")
str = 'export default '+ str
fs.writeFile('./words/compareResult3.js', str,function(err){
  if(err) console.log('提取操作失败');
  else console.log('提取操作成功');
});
```
# 小结

## 其他云多语言切换
阿里云：首先会根据不同域名产生对应不同语言的站点，站点画面风格可能不同，如日本
另外根据语言切换，还会在同一域名下通过切换URI产生不同语言广告页面（切换时，请求cookie中会携带语言类型，aliyun_lang）
广告页面和站点页面可能相同，如香港，台湾的繁体页面，
可能不同，如简体中文和日文的时候

腾讯云：站点只有两种：中国站和国际站，两种站点风格不同
多语言切换在国际站点里面进行，同样通过切换URI，切换不同语言
切换时直接在query里面携带语言信息（https://intl.cloud.tencent.com/jp/?lang=jp&pg=）

平安云：只有两种语言切换，中文和英文，使用同一站点，
切换时通过在cookie里面携带需要的语言类型字段language，
获取相应语言的html和图片

## i18n大致原理
i18n 的翻译原理就是在vue.use挂载i18n后,在install阶段会挂载上$t全局函数
我们在使用$t的时候只是单纯传入待翻译的简体中文，
$t会再调用VUEI18N对象上的内部方法，将当前语言环境和语言库传入，
然后通过message[key]的形式找到对应的翻译值，返回
```
Vue.prototype.$t = function (key) {
  var values = [], len = arguments.length - 1;
  while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

  var i18n = this.$i18n;
  return i18n._t.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this ].concat( values ))
};

VueI18n.prototype._getMessages = function _getMessages () { return this._vm.messages };

//this._vm.messages 值生成
VueI18n.prototype.setLocaleMessage = function setLocaleMessage (locale, message) {
  if (this._warnHtmlInMessage === 'warn' || this._warnHtmlInMessage === 'error') {
    this._checkLocaleMessage(locale, this._warnHtmlInMessage, message);
  }
  this._vm.$set(this._vm.messages, locale, message);
};

VueI18n.prototype.mergeLocaleMessage = function mergeLocaleMessage (locale, message) {
  if (this._warnHtmlInMessage === 'warn' || this._warnHtmlInMessage === 'error') {
    this._checkLocaleMessage(locale, this._warnHtmlInMessage, message);
  }
  this._vm.$set(this._vm.messages, locale, merge({}, this._vm.messages[locale] || {}, message));
};

VueI18n.prototype._t = function _t (key, _locale, messages, host) {
    var ref;

    var values = [], len = arguments.length - 4;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 4 ];
  if (!key) { return '' }

  var parsedArgs = parseArgs.apply(void 0, values);
  var locale = parsedArgs.locale || _locale;

  var ret = this._translate(
    messages, locale, this.fallbackLocale, key,
    host, 'string', parsedArgs.params
  );
  if (this._isFallbackRoot(ret)) {
    if (!this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
      warn(("Fall back to translate the keypath '" + key + "' with root locale."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return (ref = this._root).$t.apply(ref, [ key ].concat( values ))
  } else {
    ret = this._warnDefault(locale, key, ret, host, values, 'string');
    if (this._postTranslation) {
      ret = this._postTranslation(ret);
    }
    return ret
  }
};

VueI18n.prototype._translate = function _translate (
  messages,
  locale,
  fallback,
  key,
  host,
  interpolateMode,
  args
) { 
  //messages[locale] 拿到语言库
  var res =
    this._interpolate(locale, messages[locale], key, host, interpolateMode, args, [key]);
  if (!isNull(res)) { return res }

  res = this._interpolate(fallback, messages[fallback], key, host, interpolateMode, args, [key]);
  if (!isNull(res)) {
    if (!this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
      warn(("Fall back to translate the keypath '" + key + "' with '" + fallback + "' locale."));
    }
    return res
  } else {
    return null
  }
};

VueI18n.prototype._interpolate = function _interpolate (
  locale,
  message,
  key,
  host,
  interpolateMode,
  values,
  visitedLinkStack
) {
  if (!message) { return null }

  var pathRet = this._path.getPathValue(message, key);
  if (Array.isArray(pathRet) || isPlainObject(pathRet)) { return pathRet }

  var ret;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key]; //从语言库里面拿到对应翻译值
      if (typeof ret !== 'string') {
        if (!this._isSilentTranslationWarn(key) && !this._isSilentFallback(locale, key)) {
          warn(("Value of key '" + key + "' is not a string!"));
        }
        return null
      }
    } else {
      return null
    }
  } else {
    /* istanbul ignore else */
    if (typeof pathRet === 'string') {
      ret = pathRet;
    } else {
      if (!this._isSilentTranslationWarn(key) && !this._isSilentFallback(locale, key)) {
        warn(("Value of key '" + key + "' is not a string!"));
      }
      return null
    }
  }

  // Check for the existence of links within the translated string
  if (ret.indexOf('@:') >= 0 || ret.indexOf('@.') >= 0) {
    ret = this._link(locale, message, ret, host, 'raw', values, visitedLinkStack);
  }

  return this._render(ret, interpolateMode, values, key)
};

VueI18n.prototype._render = function _render (message, interpolateMode, values, path) {
    var ret = this._formatter.interpolate(message, values, path);

    // If the custom formatter refuses to work - apply the default one
    if (!ret) {
      ret = defaultFormatter.interpolate(message, values, path);
    }

    // if interpolateMode is **not** 'string' ('row'),
    // return the compiled data (e.g. ['foo', VNode, 'bar']) with formatter
    return interpolateMode === 'string' && typeof ret !== 'string' ? ret.join('') : ret
  };
```


