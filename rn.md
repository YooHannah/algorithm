# Platform
Platform是一个模块，不是组件，用来进行平台检测
Platform.OS，在 iOS 上会返回ios，而在 Android 设备或模拟器上则会返回android。
Platform.select({ios:{},android:{}}) 可以以 Platform.OS 为 key，从传入的对象中返回对应平台的值
Platform.Version, Android 的 api level，值为数字，ios上为一个表示当前系统版本的字符串
当不同平台的代码逻辑较为复杂时，最好是放到不同的文件里，这时候我们可以使用特定平台扩展名。React Native 会检测某个文件是否具有.ios.或是.android.的扩展名，然后根据当前运行的平台自动加载正确对应的文件。
比如你可以在项目中创建下面这样的组件：
```
BigButton.ios.js
BigButton.android.js
```
然后去掉平台扩展名直接引用：
```
import BigButton from './BigButton';
```
# Image
用于管理 iOS 和 Android 应用中的图片
图片文件的查找会和 JS 模块的查找方式一样,如果有my-icon.ios.png和my-icon.android.png，Packager 就会根据平台而选择不同的文件
可以使用@2x，@3x这样的文件名后缀，来为不同的屏幕精度提供图片，Packager 会打包所有的图片并且依据屏幕精度提供对应的资源，如果没有图片恰好满足屏幕分辨率，则会自动选中最接近的一个图片。
为了使新的图片资源机制正常工作，require 中的图片名字必须是一个静态字符串（不能使用变量！因为 require 是在编译时期执行，而非运行时期执行！）
```
// 正确
<Image source={require('./my-icon.png')} />;

// 错误
var icon = this.props.active ? 'my-icon-active' : 'my-icon-inactive';
<Image source={require('./' + icon + '.png')} />;

// 正确
var icon = this.props.active
  ? require('./my-icon-active.png')
  : require('./my-icon-inactive.png');
<Image source={icon} />;
//通过这种方式引用的图片资源包含图片的尺寸（宽度，高度）信息，如果需要动态缩放图片（例如，通过 flex），可能必须手动在 style 属性设置{ width: null, height: null }。
```
require语法也可以用来静态地加载你项目中的声音、视频或者文档文件,包括.mp3, .wav, .mp4, .mov, .htm 和 .pdf等
注意的是视频必须指定尺寸而不能使用flex样式

要在 App 中显示的图片并不能在编译的时候获得，又或者有时候需要动态载入来减少打包后的二进制文件的大小。这些时候，与静态资源不同的是,需要手动指定图片的尺寸
```
// 正确
<Image source={{uri: 'https://facebook.github.io/react/logo-og.png'}}
       style={{width: 400, height: 400}} />
//或者 指定请求参数
<Image
  source={{
    uri: 'https://facebook.github.io/react/logo-og.png',
    method: 'POST',
    headers: {
      Pragma: 'no-cache',
    },
    body: 'Your Body goes here',
  }}
  style={{width: 400, height: 400}}
/>
//或者 引用base64
<Image
  style={{
    width: 51,
    height: 51,
    resizeMode: 'contain',
  }}
  source={{
    uri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSYzYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg==',
  }}
/>
// 错误
<Image source={{uri: 'https://facebook.github.io/react/logo-og.png'}} />

```
读取本地静态图片（使用require('./my-icon.png')语法）则无需指定尺寸，因为它们的尺寸在加载时就可以立刻知道。
## ImageBackground
用于设置背景图，把需要背景图的子组件嵌入其中即可，需要设置大小
# react-navigation
导航器，控制跳转
[资料](https://www.jianshu.com/p/a0ae81e1942a)
# InteractionManager
确保在执行繁重工作之前所有的交互和动画都已经处理完毕。
```
InteractionManager.runAfterInteractions(() => {
  // ...需要长时间同步执行的任务...
});
//允许应用注册动画，在动画开始时创建一个交互“句柄”，然后在结束的时候清除它
var handle = InteractionManager.createInteractionHandle();
// 执行动画... (`runAfterInteractions`中的任务现在开始排队等候)
// 在动画完成之后
InteractionManager.clearInteractionHandle(handle);
// 在所有句柄都清除之后，现在开始依序执行队列中的任务
```
requestAnimationFrame(): 用来执行在一段时间内控制视图动画的代码
setImmediate/setTimeout/setInterval(): 在稍后执行代码。注意这有可能会延迟当前正在进行的动画。
runAfterInteractions(): 在稍后执行代码，不会延迟当前进行的动画。

