钩子函数的执行顺序

不使用keep-alive
beforeRouteEnter --> created --> mounted --> destroyed

使用keep-alive
beforeRouteEnter --> created --> mounted --> activated --> deactivated
再次进入缓存的页面，只会触发beforeRouteEnter -->activated --> deactivated 。
created和mounted不会再执行。

我们可以利用不同的钩子函数，做不同的事。