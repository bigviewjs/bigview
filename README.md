# BigView

- mode 1：支持一个布局n个模块
- mode 2：支持子布局
  - a)，静态布局
  - b)，延时输出布局

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

## mode 2 支持子布局a

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

### a)，静态布局

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

### b)，延时输出布局

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
