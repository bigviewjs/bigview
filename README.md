# BigView （Node.js 4.x +）

[![Build](https://travis-ci.org/i5ting/bigview.svg?branch=v2)](https://travis-ci.org/i5ting/bigview)
[![codecov.io](https://codecov.io/github/i5ting/bigview/coverage.svg?branch=v2)](https://codecov.io/github/i5ting/bigview?branch=v2)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


- bigview [![NPM version](https://img.shields.io/npm/v/bigview.svg?style=flat-square)](https://www.npmjs.com/package/bigview)
- biglet [![NPM version](https://img.shields.io/npm/v/biglet.svg?style=flat-square)](https://www.npmjs.com/package/biglet)
- bigview-cli [![NPM version](https://img.shields.io/npm/v/bigview-cli.svg?style=flat-square)](https://www.npmjs.com/package/bigview-cli)
- bigconsole [![NPM version](https://img.shields.io/npm/v/bigconsole.svg?style=flat-square)](https://www.npmjs.com/package/bigconsole)

## 特性

- 模块化
- 具有测试性
- 支持mock数据
- 生成html片段（便于对比）
- 提供Scaffold（bigview-cli）
- 提供调试UI（bigconsole）

## 功能点

- 支持静态布局和动态布局
- 支持5种bigpipe渲染模式
  - parallel.js   并行模式， 先写布局，并行请求，但在获得所有请求的结果后再渲染
  - pipeline.js  (默认) 管线模式：即并行模式， 先写布局，并行请求，并即时渲染
  - reduce.js    顺序模式： 先写布局，按照pagelet加入顺序，依次执行，写入
  - reducerender.js 先写布局，然后顺序执行，在获得所有请求的结果后再渲染
  - render.js 一次渲染模式：即普通模式，不写入布局，所有pagelet执行完成，一次写入到浏览器。支持搜索引擎，用来支持那些不支持JS的客户端。
- 支持子pagelet，无限级嵌套
- 支持根据条件渲染模板，延时输出布局

## 生命周期

bigview的生命周期

- before
- .then(this.beforeRenderLayout.bind(this))
- .then(this.renderLayout.bind(this))
- .then(this.afterRenderLayout.bind(this))
- .then(this.beforeFetchAllData.bind(this))
- .then(this.fetchAllData.bind(this))
- .then(this.afterFetchAllData.bind(this)
- end

bigview的生命周期精简

- before
- renderLayout
- fetchAllData
- end

biglet的生命周期

- before
- .then(self.fetch.bind(self))
- .then(self.parse.bind(self))
- .then(self.render.bind(self))
- end

## Scaffold

Install 

```
$ npm i -g bigview-cli
```

Usages

```
$ bpm a b c
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

## 安装

```
$ npm i -S bigview
```

## mode 1 并行渲染

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

## mode 2 支持嵌套子布局

```
app.get('/nest', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'nest/index', { title: "测试" })

  var Pagelet1 = require('./bpmodules/nest/p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./bpmodules/nest/p2')
  var pagelet2 = new Pagelet2()

  pagelet1.addChild(pagelet2)

  bigpipe.add(pagelet1)

  bigpipe.start()
});
```

### a) 静态布局

views/nest/index.html是bp的布局文件

```
<!doctype html>
<html class="no-js">
<head>
    <title><%= title %></title>
    <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
    <div id="pagelet2" class="pagelet2">load,,,,</div>

    <ul>
    <% pagelets.forEach(function(p){ %>
        <li><%= p.name %> | <%= p.selector %>
        <% if (p.children.length) { %>  
            <ul>  
            <% p.children.forEach(function(sub){ %>  
                <li> subPagelet = <%= sub.name %> | <%= sub.selector %>
            <% }) %>  
            </ul>  
        <% } %>
    <% }) %>
    </ul>

    <% pagelets.forEach(function(p){ %>
       <div id="<%= p.location %>" class="<%= p.selector %>">loading...<%= p.name %>...</div>
    <% }) %>

    <script src="/js/jquery.min.js"></script>
    <script src="/js/bigpipe.js"></script>
    <script>
        var bigpipe=new Bigpipe();

        <% pagelets.forEach(function(p){ %>
        
        bigpipe.ready('<%= p.name %>',function(data){
            $("#<%= p.location %>").html(data);
        })
        <% }) %>

        bigpipe.ready('pagelet2',function(data){
            $("#pagelet2").html(data);
        })
    
    </script>
</body>
</html>
```

遍历pagelets来生成各种页面需要的即可。

### b) 延时输出布局

views/nest2/index.html是bp的布局文件

```
<!doctype html>
<html class="no-js">
<head>
    <title><%= title %></title>
    <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
    <ul>
    <% pagelets.forEach(function(p){ %>
        <li><%= p.name %> | <%= p.selector %>
        <% if (p.children.length) { %>  
            <ul>  
            <% p.children.forEach(function(sub){ %>  
                <li> subPagelet = <%= sub.name %> | <%= sub.selector %>
            <% }) %>  
            </ul>  
        <% } %>
    <% }) %>
    </ul>

    <% pagelets.forEach(function(p){ %>
       <div id="<%= p.location %>" class="<%= p.selector %>">loading...<%= p.name %>...</div>
    <% }) %>

    <script src="/js/jquery.min.js"></script>
    <script src="/js/bigpipe.js"></script>
    <script>
        var bigpipe=new Bigpipe();

        <% pagelets.forEach(function(p){ %>
        
        bigpipe.ready('<%= p.name %>',function(data){
            $("#<%= p.location %>").html(data);
        })
        <% }) %>
    </script>
</body>
</html>
```

此时无任何pagelet2的布局


在bpmodules/nest2/p1/p1.html里，输出pagelet2的布局。

```
  <script>bigpipe.set("pagelet1", '<%= is %>');</script>

  <div id="pagelet2" class="pagelet2">load,,,,</div>

  <script>
      bigpipe.ready('pagelet2',function(data){
          $("#pagelet2").html(data);
      })
  </script>
```

## mode 3：根据条件渲染模板

自定义p1和p2，设置`this.immediately = false`

```
'use strict'

const Pagelet = require('../../../../packages/biglet')

module.exports = class MyPagelet extends Pagelet {
  constructor () {
      super()
      this.root = __dirname
      this.name = 'pagelet1'
      this.data = { is: "pagelet1测试" }
      this.selector = 'pagelet1'
      this.location = 'pagelet1'
      this.tpl = 'p1.html'
      this.delay = 4000
      this.immediately = false
  }

  fetch () {
		let pagelet = this
		return require('./req')(pagelet)
	}
}

```

自定义BigView基类

```
'use strict'

const BigView = require('../../../packages/bigview')

module.exports = class MyBigView extends BigView {
  before () {
    let self = this
     return new Promise(function(resolve, reject) {
       self.showPagelet = self.query.a
       resolve(true)
    })
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

只需要重写fetch方法，并且返回Promise对象即可。如果想多个，就利用Promise的链式写法解决即可

## http支持

无论http也好，还是其他方式（rpc）也好，都是需要参数的

- bigview为单页应用入口
- bigview只定义布局，以及各个pagelet位置（当然也可以在before里完成http请求）
- bigview入口是express路由，可以获取querystring
- bigview里包含多个pagelet
- pagelet里需要发起接口请求，获取数据后，想浏览器写html片段

所以要做的，依然是上面的fetch方法，由于pagelet是独立的，所以无法直接获取bigview页面的参数。

但是pagelet里有一个owner对象，其实就是bigview对象。

先看一下模块入口

```
'use strict'

const debug = require('debug')('bigview')
const fs = require('fs')
const MyBigView = require('./MyBigView')

module.exports = function (req, res) {
  var bigpipe = new MyBigView(req, res, 'basic/index', { title: "测试" })

  var Pagelet1 = require('./p1')
  var pagelet1 = new Pagelet1()

  var Pagelet2 = require('./p2')
  var pagelet2 = new Pagelet2()

  bigpipe.add(pagelet1)
  bigpipe.add(pagelet2)

  // bigpipe.preview('aaaa.html')
  bigpipe.isMock = true
  bigpipe.previewFile = 'aaaa.html'
  bigpipe.start()
}
```

很明显这就是一个express中间件。

```
app.get('/', require('./bpmodules/basic'));
```

所以获取QueryString就很简单了，从req.query里获得就可以了。然后赋值给bigpipe对象。

实际上，bigview已经做了这件事，它自身已经绑定了3个获取参数的属性

- this.query  //  ?a=1&b=2
- this.params  //  /a/:id    this.params.id
- this.body 仅限于POST等类型的请求，估计用的不会很多

所以在req.js里可以这样使用

- pagelet.owner.query
- pagelet.owner.params
- pagelet.owner.body

例子如下

```
'use strict'

module.exports = function (pagelet) {
    console.log(pagelet.owner.query)
    
    pagelet.delay = 1000
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(pagelet.data)
      }, pagelet.delay)
    }) 
}
```


## 定义实现render方法，支持更多模板引擎

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

    render (tpl, data) {
        const ejs = require('ejs')
        let self = this

        return new Promise(function(resolve, reject){
            ejs.renderFile(tpl, data, self.options, function(err, str){
                // str => Rendered HTML string
                if (err) {
                    console.log(err)
                    reject(err)
                }
                
                resolve(str)
            })
        })
    }
}
```

重写render()方法，如果不重写则采用默认的模板引擎ejs编译。

render方法的参数

- tpl，即pagelet对应的模板
- data，是pagelet对应的模板编译时需要的数据



## 模块目录的思考

```
.
├── MyBigView.js（实现类，继承自bigview）
├── index.js （返回MyBigView以及p1和p2等pagelet模块的组织）
├── p1（pagelet模块）
│   ├── index.js
│   ├── p1.html
│   └── req.js
└── p2（pagelet模块）
    ├── index.js
    ├── p2.html
    └── req.js
```

### pagelet模块

pagelet的本章是返回模板引擎编译后的html片段。

> 模板引擎编译（模板 + 数据） = html

唯一比较麻烦的是数据的来源，可能是静态数据，也可能是api请求的数据，所以在设计pagelet的时候，通过集成fetch方法来实现自定义数据。为了进一步

```
├── p1（pagelet模块）
│   ├── index.js
│   ├── p1.html
│   └── req.js
```

说明

- index.js （实现类，继承自biglet）可以完成各种配置
- p1.html 是模板
- req.js 是获取api数据的，提供给模板引擎data的请求文件，返回Promise对象

## 支持mock数据

bigpipe

```
  bigpipe.isMock = true
  bigpipe.previewFile = 'aaaa.html'
```

pagelet带定

```
var Pagelet1 = require('./bpmodules/basic/p1')
var pagelet1 = new Pagelet1()

pagelet1.mock = true

pagelet1.data = {
  xxx: yyy
} 

pagelet1.test()
```

or 

```
$ pt bpmoduless/p1 url
$ pt bpmoduless/p1 aaaa.json
```

自动跑测试，并给出测试结果


## More

pagelet能复用么？

直接请求，也未尝不可

- pagelet独立模块复用
- http方式调用pagelet（需要深入思考一下）

性能改进

- req.js，有http改成rpc
- 缓存模板
- 缓存编译结果

与传统Ajax比较

- 减少HTTP请求数：多个模块更新合成一个请求
- 请求数减少：多个chunk合成一个请求
- 减少开发成本：前端无需多写JavaScript代码
- 降低管理成本：模块更新由后端程序控制
- URL优雅降级：页面链接使用真实地址
- 代码一致性：页面加载不劢态刷新模块代码相同

前端优化，参考微博的方式

异步加载显示模块的方式：BigPipe方式降低模块开发成本、管理成本

```
var FM=function(a,b,c){function bN(b,c){a.clear&&(bN=a.clear)(b,c)}function bM(b,c,d){a.start&&(bM=a.start)(b,c,d)}function bL(a){return a===null?"":Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}function bK(){bv(function(){bH();for(var a in J){if(I[a]){bB(P,I[a]);delete 


<script>FM.view({"ns":"pl.common.webim","domid":"pl_common_webim","css":["style/css/module/list/comb_webim.css?version=f25a07f3fbb17183"],"js":["webim_prime/js/common/all.js?version=8fde40d2c1ecd58b"]})</script>
<script>FM.view({"ns":"pl.top.index","domid":"plc_top","css":[],"js":["home/js/pl/top/index.js?version=8fde40d2c1ecd58b"],"html":""})</script>

<script>
pl.View('pagelet1','pl1.css','pl1.js',
'<span>Here is pagelet1</span>');
</script>
<script>
pl.View('pagelet2','pl1.css','pl1.js',
'<span>I am pagelet2</span>');
</script>
```

模块的css可以采用各种预处理编写，在提供bigpipe打包功能，合并到一起或者单独引入(可以再考虑)。

- 目前是模板引擎里嵌入js和css
- 显示的方式，应该可以完成更多优化功能，对模板化更好
- 优化开发方式

4种模式

- sync 默认就是此模式，直接输出。
- quicking 此类 widget 在输出时，只会输出个壳子，内容由用户自行决定通过 js，另起请求完成填充，包括静态资源加载。
- async 此类 widget 在输出时，也只会输出个壳子，但是内容在 body 输出完后，chunk 输出 js 自动填充。widget 将忽略顺序，谁先准备好，谁先输出。
- pipeline 与 async 基本相同，只是它会严格按顺序输出。

BigPipe的三种模式：

- 一次渲染模式：即普通模式，支持搜索引擎，用来支持那些不支持JS的客户端。
- 管线模式：即并行模式，并行请求，并即时渲染。(已实现)
- 并行模式：并行请求，但在获得所有请求的结果后再渲染。

## 参考 

http://velocity.oreilly.com.cn/2011/ppts/WK_velocity.pdf

review

- 测试独立
- render同意
- 初始化参数
- fetch（）就够用了，不必before（精简生命周期，fetch后增加parse）
- layout：先返回布局（压测）
- out模式：同步
- 日志
- 开关
- 性能
- 共享内存
- 约定，所有的数据，只能绑定到data上（限制set）
- pagelet（传model）
- 继承自event，外接日志(基本实现)

- 静态布局和动态布局说明

- bigview指定模板demo
- pagelet指定外部模板demo