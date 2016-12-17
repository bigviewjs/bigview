# BigView

特性

- 模块化
- 具有测试性
- 支持mock数据
- 生成html片段（便于对比）

功能点

- mode 1：支持一个布局n个模块
- mode 2：支持子布局
  - a)，静态布局
  - b)，延时输出布局

## 支持mock数据(TODO)

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

## 参考 

http://velocity.oreilly.com.cn/2011/ppts/WK_velocity.pdf