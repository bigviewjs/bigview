# BigView （Node.js 4.x +）

<a href="https://circleci.com/gh/bigviewjs/bigview/tree/dev"><img src="https://img.shields.io/circleci/project/bigviewjs/bigview/dev.svg" alt="Build Status"></a>
[![codecov.io](https://codecov.io/github/bigviewjs/bigview/coverage.svg?branch=dev)](https://codecov.io/github/bigviewjs/bigview?branch=dev)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


一款开源的的 Node.js Bigpipe 框架。支持 [koa](https://github.com/koajs/koa) 和 [express](https://github.com/expressjs/express)。

## 如何使用

以 [koa](https://github.com/koajs/koa) / [Egg.js](https://github.com/eggjs/egg) 为例；


``` bash
$npm install bigkoa --save 
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
  const bigpipe = new BigView(ctx, {
    layout: a,
  })
  // bigpipe.mode = 'render'
  bigpipe.timeout = 5000
  bigpipe.add(b)
  bigpipe.add(c)

  await bigpipe.start()
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
