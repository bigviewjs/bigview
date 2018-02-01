
# bigview-mode

bigview 在进行渲染的时候会根据设置的 `mode` 值 来采取不同的渲染策略；

``` js
bigview.mode = 'reduce'
```

目前支持五种渲染模式：

+ pipeline: **(默认)** 管线模式：即并行模式， 先写布局，并行请求，并即时渲染；
+ parallel: 并行模式， 先写布局，并行请求，但在获得所有请求的结果后再渲染；
+ reduce: 顺序模式： 先写布局，按照pagelet加入顺序，依次执行，写入；
+ reducerender:  即连续渲染模式reducerender，不写入布局，所有pagelet顺序执行完成，一次写入到浏览器；
+ render: 一次渲染模式：即普通模式，不写入布局，所有pagelet执行完成，一次写入到浏览器。支持搜索引擎，用来支持那些不支持JS的客户端；

