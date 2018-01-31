# bigview-runtime

进行 pagelet 渲染的时候，需要在页面引入该类库，从而确保吐出的数据能够进行正常的渲染

``` html
<script src="./node_modules/bigview-runtime/bigview.min.js"></script>
```

pagelet 在回吐浏览器的时候，会持续写入

``` html
bigview.view({
    domid: '', // 与页面的某个节点的 ID 进行绑定
    css: '', // 需要引入的样式地址
    js: '', // 需要引入 JS 脚本地址
    html: '' // 需要渲染的 html 内容
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


