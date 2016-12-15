# BigView

- mode 1：支持一个布局n个模块
- mode 2：支持子布局a)，静态布局
- mode 3：支持子布局b)，延时输出布局

## 安装

```
$ npm i -S bigview
```

## mode 1

```js
const MyBigView = require('./MyBigView')

app.get('/', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/basic/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/basic/p2')
  var pagelet2 = new Pagelet2()

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  bigpipe.start()
});
```



## 流程可选方式mode

- 顺序渲染
- 随机：先完成fetch的先渲染
- 全部完成渲染