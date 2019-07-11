(function ($) {
  $.fn.extend({
      "lazyload":function (limitMethod,delay,atleast){
        //疑问：像lazyload这样定义的函数挂在谁身上？
        //加载图片
        function lazyload(el){
          const images = el.find('img')
          const len = images.length
          let n = 0
          return function(){
            let scrollTop = $(window).scrollTop()
            let windowHeight = $(window).height()
            let offsetTop = ''
            for(let i=n;i<len;i++){
              let image = $(images[i])
              if(image.offset().top < (scrollTop + windowHeight)){
                if(image.attr('src') != image.attr('data-src')){
                  image.attr('src',image.attr('data-src'))
                }
              }
            }
          }
        }
        let methods = {}
        //节流
        methods.throttle = function(fn, delay, atleast) {
          let timeout = null
          let startTime = new Date()
          return function() {
              const curTime = new Date()
              clearTimeout(timeout) //3，取消限定时间内预约的将来的函数执行,防止多次执行
              if (curTime - startTime >= atleast) {//1,超过限定时间，执行一次
                  fn()
                  startTime = curTime
              } else {
                  timeout = setTimeout(fn, delay) //2，没超过限定时间，在限定时间内不执行，延续时间到超过限定时间后再执行
              }
          }
        }
        //防抖
        methods.debounced = function(fn,delay) {
          let timeoutID = null
          return function () {
            if(timeoutID) clearTimeout(timeoutID);
            timeoutID = setTimeout(function() {
              fn()
            }, delay);
          }
        };
        if(limitMethod && limitMethod != 'throttle' && limitMethod != 'debounced'){
          console.error("sorry,your configuration about limitMethod was wrong!")
          return 
        }
        if(delay && typeof delay !='number' || atleast && typeof atleast !='number'){
          console.error("sorry,your configuration about delay's or atleast's type was wrong!")
          return 
        }
        let loadImages = lazyload(this)
        let method = methods[(limitMethod || 'throttle')]
        delay = delay || 500
        atleast = atleast || 1000
        $(window).on('load',function(){
          loadImages()
          $(window).on('scroll',method(loadImages,delay,atleast))
        })
      }
  });
})(jQuery);