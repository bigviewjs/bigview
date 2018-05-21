# bigview-runtime

进行 pagelet 渲染的时候，需要在页面引入该类库，从而确保吐出的数据能够进行正常的渲染

``` html
<script src="./node_modules/bigview-runtime/bigview.runtime.min.js"></script>
```

pagelet 在回吐浏览器的时候，会持续写入

``` html
bigview.view({
    domid: '', // 与页面的某个节点的 ID 进行绑定
    css: '', // 需要引入的样式地址
    js: '', // 需要引入 JS 脚本地址
    html: '' // 需要渲染的 html 内容
    callback: function () {} // 执行完成 script 或者 html 添加完成后的回调
})
```

## API

### on(event, callback)

监听某个事件；

### emit(event, args)

触发某个事件；




## 事件

### ready

bigview 处于ready状态，即完成布局，开始执行页面 JS；

### beforePageletArrive

某个 pagelet 渲染前开始触发；

### pageletArrive

某个 pagelet 抵达浏览器，开始进行渲染；

### end

页面所有 pagelet 渲染完成后触发；


## debug

你可以在浏览器控制台输入：

``` js
localStorage._bigview = true
```

开启调试模式, 在浏览器控制台查看每个 pagelet 的渲染信息；


## 常见问题

### Q1 IE 不触发 script 标签内容?

请查看自己的模板代码 script 标签内请移除掉注释。


## Updates Log

### 1.4.0

+ 同步新版本的 biglet 修改；
+ 新的 comment node 解释；
+ 后面版本号将与 [biglet](https://github.com/bigviewjs/bigview/tree/master/packages/biglet) 同步；


### 1.1.5

+ 支持payload 的带入 callback 属性，将会在脚本加载完成后执行该 callback。

### 1.1.2

+ 修复 script escape 问题；
+ 支持 callback 的回调；

### 1.1.1

+ 修复 IE8 Array polyfill

### 1.0.1

+ 添加错误处理机制
+ 自定义错误模板
+ 增加对 ie8 的兼容性处理
+ 设置 script [async](https://eager.io/blog/everything-I-know-about-the-script-tag/)
+ fix ie8 兼容性问题

### 0.1.3

支持 lifecycle 的判断，决定什么时候触发渲染；

### 0.1.2

支持 pagelet 的 attr 属性，对当前 domID 的元素进行 attr 的绑定；
