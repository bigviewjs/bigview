# BigView （Node.js 4.x +）

[![CircleCI](https://circleci.com/gh/bigviewjs/bigview/tree/dev.svg?style=svg)](https://circleci.com/gh/bigviewjs/bigview/tree/dev)
[![codecov.io](https://codecov.io/github/bigviewjs/bigview/coverage.svg?branch=dev)](https://codecov.io/github/bigviewjs/bigview?branch=dev)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


一款开源的的 Node.js Bigpipe 框架。支持 [koa](https://github.com/koajs/koa) 和 [express](https://github.com/expressjs/express)。

## 如何使用

以 [koa](https://github.com/koajs/koa) / [Egg.js](https://github.com/eggjs/egg) 为例；


``` bash
$ npm install bigview --save 
```

使用 bigview-cli 脚手架创建模块; 


```
$ npm install -g bigview-cli
```


进入项目 app 目录；我们创建第一个模块 `bphello`;我们新建一个文件夹 `bphello`;然后我们进入该目录输入:

```bash
$ bpm a b c
```
这个时候程序会自动创建三个 [pagelet](./packages/biglet) 模块；

```

generate ~/a/MyPagelet.js
generate ~/a/index.html
generate ~/a/index.js
generate ~/a/req.js
generate ~/b/MyPagelet.js
generate ~/b/index.html
generate ~/b/index.js
generate ~/b/req.js
generate ~/c/MyPagelet.js
generate ~/c/index.html
generate ~/c/index.js
generate ~/c/req.js
```

接下来我们需要创建具体的  bigview 将三个 pagelet 串起来； 我们在 `bp-hello-world` 目录下创建 `index.js`；


``` js
const BigView = require('bigview')
const a = require('./a')
const b = require('./b')
const c = require('./c')

module.exports = async (ctx, next) => {
  const bigview = new BigView(ctx, {
    layout: a,
  })
  // bigpipe.mode = 'render'
  bigview.timeout = 5000
  bigview.add(b)
  bigview.add(c)

  await bigview.start()
}

```

**目前 bigview 不提供模板渲染能力，如果需要支持模板渲染，你们需要在 context 中引入 `render` 方法** 比如引入了 [nunjucks](https://github.com/mozilla/nunjucks) 我们需要在 `app/extend/context.js` 加上 `render`：

``` js
const nunjucks = require('nunjucks')

...

  render (tpl, data, cb) {
    const env = nunjucks.configure({
      // your template config
    })
    if (/\.nj$/.test(tpl) || /\.html$/.test(tpl)) {
      env.render(tpl, data, (err, html) => {
        err && debug(err)
        cb(err, html)
      })
    } else {
      env.renderString(tpl, data, (err, html) => {
        err && debug(err)
        cb(err, html)
      })
    }
  }

  afterRenderLayout () {
    let self = this

    if (self.showPagelet === '1') {
      self.run('pagelet1')
    } else {
      self.run('pagelet2')
    }

    // console.log('afterRenderLayout')
    return Promise.resolve(true)
  } 
```

在bigview

```
'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
const MyBigView = require('./MyBigView')

module.exports = function (req, res) {
  var bigpipe = new MyBigView(req, res, 'if/index', { title: "条件选择pagelet" })

  bigpipe.add(require('./p1'))
  bigpipe.add(require('./p2'))

  bigpipe.start()
}
```

- http://127.0.0.1:4005/if?a=1
- http://127.0.0.1:4005/if?a=2

## 出错模块

- bigview出错，即在所有pagelets渲染之前，显示错误模块，中断其他模块渲染
- 如果是pagelets里的某一个出错，可以自己根据模板去，模块内的错误就模块自己处理就好了

```js
    var bigpipe = new MyBigView(req, res, 'error/index', { title: "测试" })
    // bigpipe.mode = 'render'
    bigpipe.add(require('./p1'))
    bigpipe.addErrorPagelet(require('./error'))
```

显示ErrorPagelet，可以在bigview的生命周期，执行子Pagelets之前。reject一个error即可。

比如在afterRenderLayout里，reject

```
	afterRenderLayout() {
		let self = this
		// console.log('afterRenderLayout')
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				reject(new Error('xxxxxx'))
				// resolve()
			}, 0)
		})
	}
```

通过`addErrorPagelet`设置Error时要显示的模块，如果要包含多个，请使用pagelet子模块。

另外，如果设置了ErrorPagelet，布局的时候可以使用errorPagelet来控制错误显示

```
<!doctype html>
<html class="no-js">
<head>
    <title><%= title %></title>
    <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
    <div id="<%= errorPagelet.location %>" class="<%= errorPagelet.selector %>">
        <ul>
        <% pagelets.forEach(function(p){ %>
            <li><%= p.name %> | <%= p.selector %>
        <% }) %>
        </ul>

        <% pagelets.forEach(function(p){ %>
        <div id="<%= p.location %>" class="<%= p.selector %>">loading...<%= p.name %>...</div>
        <% }) %>
    </div>

    <script src="/js/jquery.min.js"></script>
    <script src="/js/bigpipe.js"></script>
    <script>
        var bigpipe=new Bigpipe();

        <% pagelets.forEach(function(p){ %>
        
        bigpipe.ready('<%= p.name %>',function(data){
            $("#<%= p.location %>").html(data);
        })
        <% }) %>
        
        bigpipe.ready('<%= errorPagelet.name %>',function(data){
            $("#<%= errorPagelet.location %>").html(data);
        })
    </script>
    <script src="/bigconsole.min.js"></script> 
</body>
</html>
```

## Pagelet里触发其他模块

提供trigger方法，可以触发1个多个多个其他模块，无序并行。结果返回的是Promise

```
'use strict'

const Pagelet = require('../../../../packages/biglet')
const somePagelet1 = require('./somePagelet1')
const somePagelet2 = require('./somePagelet2')
const somePagelet = require('./somePagelet')

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		super()

		this.root = __dirname
		this.name = 'pagelet1'
	}

	fetch () {
    // 触发一个模块
    this.trigger(new somePagelet())
    // 触发一个模块
    this.trigger([new somePagelet1(), new somePagelet2()])
	}
}

```

不允许，直接

```
return this.trigger([require('./somePagelet1'), require('./somePagelet2')])
```

这样会有缓存，不会根据业务请求来进行不同处理。

也可以强制的fetch里完成

```
'use strict'

const Pagelet = require('../../../../packages/biglet')
const somePagelet1 = require('./somePagelet1')
const somePagelet2 = require('./somePagelet2')
const somePagelet = require('./somePagelet')

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		super()

		this.root = __dirname
		this.name = 'pagelet1'
	}

	fetch () {
    // 触发多个模块
    return this.trigger([new somePagelet1, new somePagelet2()])
	}
}

```

## 生成预览数据

```
app.get('/', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/basic/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/basic/p2')
  var pagelet2 = new Pagelet2()

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  // bigpipe.preview('aaaa.html')
  bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
});
```

方法

- 设置previewFile
- bigpipe.preview('aaaa.html')

## 获取数据

```js
'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
	constructor () {
		super()

		this.root = __dirname
		this.name = 'pagelet1'
		this.data = { is: "pagelet1测试" }
		this.location = 'pagelet1'
		this.tpl = 'p1.html'
		this.selector = 'pagelet1'
		this.delay = 2000
	}

  fetch () {        
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(self.data)
      }, 4000);
    })
  }
}
```
这个时候 bp-hello-world 创建的差不多了。这个时候我们需要在 `app/router.js` 中定义路由：

``` js
const bpHelloWorld = require('./bp-hello-world')

...

app.router.get('/hello', bpHelloWorld)

```

这个时候启动程序，然后输入路由后就可以看到我们刚刚完成的一个 bigpipe 页面；


## 特性

- 模块化
- 具有测试性
- 支持mock数据
- 生成html片段（便于对比）
- 提供Scaffold（bigview-cli）
- 提供调试UI（bigconsole）

目前支持五种渲染模式：

+ pipeline: **(默认)** 管线模式：即并行模式， 先写布局，并行请求，并即时渲染；
+ parallel: 并行模式， 先写布局，并行请求，但在获得所有请求的结果后再渲染；
+ reduce: 顺序模式： 先写布局，按照pagelet加入顺序，依次执行，写入；
+ reducerender: 先写布局，然后顺序执行，在获得所有请求的结果后再渲染；
+ render: 一次渲染模式：即普通模式，不写入布局，所有pagelet执行完成，一次写入到浏览器。支持搜索引擎，用来支持那些不支持JS的客户端；

关于 bigview 支持的 mode 可以进入 [bigview-mode]('./packages/bigview-mode') 查看具体文档。

## 生命周期

bigview的生命周期

```
before
.then(this.beforeRenderLayout.bind(this))
.then(this.renderLayout.bind(this))
.then(this.renderMain.bind(this))
.then(this.afterRenderLayout.bind(this))
.then(this.beforeRenderPagelets.bind(this))
.then(this.renderPagelets.bind(this))
.then(this.afterRenderPagelets.bind(this))
end
```

精简一下，核心5个步骤。

- before：渲染开始
- renderLayout：渲染布局
- renderMain：渲染主模块
- renderPagelets：渲染其他模块
- end：渲染模块结束，通知浏览器，写入完成

bigview的生命周期精简

- before
- renderLayout
- renderPagelets
- end

biglet的生命周期

- before
- .then(self.fetch.bind(self))
- .then(self.parse.bind(self))
- .then(self.render.bind(self))
- end

## Packages

- bigview [![NPM version](https://img.shields.io/npm/v/bigview.svg?style=flat-square)](https://www.npmjs.com/package/bigview)
- biglet [![NPM version](https://img.shields.io/npm/v/biglet.svg?style=flat-square)](https://www.npmjs.com/package/biglet)
- bigview-cli [![NPM version](https://img.shields.io/npm/v/bigview-cli.svg?style=flat-square)](https://www.npmjs.com/package/bigview-cli)
- bigconsole [![NPM version](https://img.shields.io/npm/v/bigconsole.svg?style=flat-square)](https://www.npmjs.com/package/bigconsole)
- bigview-runtime [![NPM version](https://img.shields.io/npm/v/bigview-runtime.svg?style=flat-square)](https://www.npmjs.com/package/bigview-runtime)
