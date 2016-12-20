# BigView （Node.js 4.x +）

特性

- 模块化
- 具有测试性
- 支持mock数据
- 生成html片段（便于对比）
- 提供scaffold（bigview-cli）

功能点

- mode 1：支持一个布局n个模块
- mode 2：支持子布局
  - a)，静态布局
  - b)，延时输出布局


## scaffold

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
var FM=function(a,b,c){function bN(b,c){a.clear&&(bN=a.clear)(b,c)}function bM(b,c,d){a.start&&(bM=a.start)(b,c,d)}function bL(a){return a===null?"":Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}function bK(){bv(function(){bH();for(var a in J){if(I[a]){bB(P,I[a]);delete I[a]}J[a]()}J={}})}function bJ(a){function v(){if(k.indexOf(bI)!=0)throw"view: csstextkey must have *"+bI+"* as prefix.";T(k)||bo(j,k)}function u(){function d(){--a<=0&&t()}j&&cssloadCssText();var a,b,c=-1;g=[].concat(g||[]);i=[].concat(i||[]);if(a=g.length){h(t,K);while(b=g[++c])T(b)?d():bk(b,d,i[c])}else t()}function t(){if(!t.r){t.r=1;bB(M,a);a[P]?r():s()}}function s(){function b(b){r();b||a[P]||bH()}d?bv(function(){bF(d,function(f){if(!a[P]&&f&&e!=c){bG(f,d);f.innerHTML=e||"";br(b);delete a.html}else b(!0)})}):b(!0)}function r(){bB(N,a);a[P]?p():q()}function q(){function a(){bA(f,p,m)}f?l?h(a,l):a():p()}function p(){if(!a[P]){if(b){bN(b,d);bM(b,d,a)}bD(o,a)}bB(O,a)}a=a||{};var b=a.ns,d=a.domid,e=a.html,f=a.js,g=a.css,i=a.cssid,j=a.csstext,k=a.csstextkey=a.csstextkey||bI+"_"+x(),l=a.jsDely||0,m=a.jsDefer,n=a.renderDely||0,o=d||b;if(!!o){bC(o,a);bB(L,a);n?h(u,n):u()}}function bH(){for(var a in J)bF(a,J[a])}function bG(a,b){var c,d,e;for(c in H)if((d=H[c].domid)&&(d===b||(e=p(d))&&bw(a,e))){bN(H[c].ns,d);delete H[c]}}function bF(a,b){var c,d;if(d=J[a]){d!=b&&d();delete J[a]}!(c=p(a))||bE(c)?J[a]=b:b(c)}function bE(a){var b,c,d;for(c in I)if(!(d=I[c])[N]&&(b=d.domid)&&(b=p(b))&&bw(b,a))return!0}function bD(a,b){if(I[a]==b){H[a]=I[a];delete I[a]}}function bC(a,b){I[a]&&bB(P,I[a]);I[a]=b}function bB(a,b){b[a]=r();G(a,b)}function bA(a,d,e){var f=d,i;if(by&&by!==a)bz.push(arguments);else{if(!by&&e){by=a;d=function(a,d){by=c;while(i=bz.shift()){bA.apply(b,i);if(i[2])break}f(a,d)}}bx&&(a=bx(a));if(!Y(a,d)){var k=bd("script"),l=!1,m,n;bh(k,"src",a);bh(k,"charset","UTF-8");m=k.onerror=k.onload=k.onreadystatechange=function(){if(!l&&(!k.readyState||/loaded|complete/.test(k.readyState))){l=!0;j(n);k.onerror=k.onload=k.onreadystatechange=null;g.removeChild(k);Z(a)}};n=h(m,3e4);g.insertBefore(k,g.firstChild)}}}function bv(a){bs.push(a);bt||bu()}function bu(){if(bs.length>0){bt=1;bs.shift()();br(bu)}else bt=0}function bq(){var a={},b,c,d;for(c in H)if(b=H[c].css||H[c].csstextkey){b=[].concat(b);for(d=b.length;--d>-1;)b[d]&&(a[b[d]]=1)}U(a);bn(a)}function bp(a){return a}function bo(a,b){var c,d;if(!Y(b)){c=x();d=bd("style");bh(d,"type","text/css");bh(d,"id",c);g.appendChild(d);try{d.styleSheet.cssText=a}catch(f){d.appendChild(e.createTextNode(a))}bi[b]=c}}function bn(a){var b={},c;for(c in a)b[bp(c)]=1;for(c in bi)if(!b[c]){bm(c);$(c)}}function bm(a){var b=bi[a],c,d,e=p(b);if(e){if(m&&b in bj){d=b&&bj[b];if(d&&(c=A(a,d))>-1){(e.styleSheet||e.sheet).removeImport(c);d.splice(c,1)}}else R(e);delete bi[a]}}function bl(a){var b,c;if(m){for(b in bj)if(bj[b].length<31){c=p(b);break}if(!c){b=x();c=bd("style");bh(c,"type","text/css");bh(c,"id",b);g.appendChild(c);bj[b]=[]}(c.styleSheet||c.sheet).addImport(a);bj[b].push(a)}else{b=x();var d=bd("link");bh(d,"rel","stylesheet");bh(d,"type","text/css");bh(d,"href",a);bh(d,"id",b);g.appendChild(d)}bi[a]=b}function bk(a,c,d){function j(){if(parseInt(b.getComputedStyle?getComputedStyle(e,null)[f]:e.currentStyle&&e.currentStyle[f])===42)i();else if(--g>0)h(j,10);else{i();bm(a);bl(a)}}function i(){bg(e);Z(a)}a=bp(a);var e,f="height",g=3e3;if(!Y(a,c)){bl(a);e=bd("div");e.id=d;bf(e);h(j,50)}}function bh(a,b,c){return a.setAttribute(b,c)}function bg(a){be&&be.removeChild(a)}function bf(a){if(!be){(be=bd("div")).style.cssText="position:absolute;top:-9999px;";g.appendChild(be)}be.appendChild(a)}function bd(a){return e.createElement(a)}function bc(a,b){b&&(b[ba]=b[2]-b[1]+2);return function(c){return!c||/^https?\:\/\//.test(c.toLowerCase())?c:(b?_[c]||(_[c]=bb(b,c)):a)+c}}function bb(a,b){b=b.replace(/\?.*$/,"");var c=0,d=0,e,f;while(e=b.charCodeAt(c++))d+=e;return a[0].replace("{n}",d%a[ba]||"")}function $(a){W[a]&&delete W[a];a in V&&delete V[a]}function Z(a,b){V[a]=b;G(X+a,b);F(X+a)}function Y(a,b){if(a in V){b&&b(a,V[a]);return!0}b&&E(X+a,function(c,d){b(a,d)});if(W[a])return!0;W[a]=1}function U(a){var b={},c,d,e;for(d in S){c=S[d].ins;for(e in c)if(a[e]){b[d]=!0;break}}for(d in S)if(!b[d]){R(S[d].el);delete S[d]}}function T(a){for(var b in S)if(S[b].ins[a])return!0}function R(a){a&&a.parentNode.removeChild(a)}function Q(a){try{return[].slice.call(a)}catch(b){var c,d=0,e=[];while(c=a[d])e[d++]=c;return e}}function G(a,b){var d=D(a);b=[].concat(b||[]);for(var e=d.length-1;e>-1;e--)try{d[e]&&d[e].apply(c,b)}catch(f){a!=n&&G(n,["[error][notice]["+a+"]",f])}}function F(a,b){var c=D(a),d,e;if(b)(d=A(b,c))>-1&&(e=1);else{d=0;e=c.length}e&&c.splice(d,e)}function E(a,b){D(a).unshift(b)}function D(a){return C[a]||(C[a]=[])}function A(a,b){if(b.indexOf)return b.indexOf(a);for(var c=0,d=b.length;c<d;++c)if(b[c]===a)return c;return-1}function z(a){return a[y]||(a[y]=x())}function x(){return w+v++}function u(a){t.push(a)}function r(){return Date.now?Date.now():+(new Date)}function q(a,b){return(b||e).getElementsByTagName(a)}function p(a){return e.getElementById(a)}function o(){}if(a)return a;!!b.sessionStorage&&!!b.history.pushState&&b.scrollTo(0,0);a=a||{v:2,t:r()};var d=navigator.userAgent,e=b.document,f=e.documentElement,g=e.head||q("head")[0]||f,h=b.setTimeout,i=b.location,j=b.clearTimeout,k=b.decodeURI,l=e.addEventListener,m=/msie (\d+\.\d+)/i.test(d)?e.documentMode||+RegExp.$1:0,n="log",s="_I",t=a[s]=a[s]||[];a.init=function(a){a=a||{};var b="linkFilter",c="history",d="iLoader";b in a||(a[b]=!0);c in a||(a[c]=!0);d in a||(a[d]=!0);var e;while(e=t.shift())e(a)};var v=1,w="FM_"+r(),y="__FM_ID",B="_N",C=a[B]=a[B]||{},H={},I={},J={},K=5e3,L="plViewReady",M="plCssReady",N="plRenderReady",O="plJsReady",P="plAbort",S={};u(function(){var a=Q(q("link")).concat(Q(q("style"))),b,c,d;for(var e=0;d=a[e++];)if(b=d.getAttribute("includes")){c=z(d);b=b.split("|");var f={};for(var g=0;b[g];)f[b[g++]]=1;S[c]={el:d,ins:f}}});var V={},W={},X=x(),_={},ba="MODN",be,bi={},bj={};u(function(a){bp=bc(a.cssPath||"",a.mCssPath)});var br=function(){var a=b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame||b.oRequestAnimationFrame||b.msRequestAnimationFrame,c=function(a){return h(a,2)};a&&a(function(){c=a});return function(a){return c(function(){a()})}}(),bs=[],bt=0,bw=f.contains?function(a,b){a=a===e?f:a;b=b.parentNode;return a===b||!!(b&&a.contains&&a.contains(b))}:f.compareDocumentPosition?function(a,b){return!!(a.compareDocumentPosition(b)&16)}:function(a,b){while(b=b.parentNode)if(b===a)return!0;return!1},bx,by,bz=[];u(function(a){bx=bc(a.jsPath||"",a.mJsPath)});var bI="csstext:";u(function(a){var b=a.cssTimeOut;bL(b)==="number"&&(K=b)});E("vf",bK);E("vd",bq);var bO="_NC",bP=G;G=function(b,c){bP(b,c);a[bO]&&a[bO].push(arguments)};a[bO]=[];a.view=bJ;a.getViews=function(){return H};return a}(FM,window);!function(){function e(a){return"js_"+a.replace(/^\/?(.*)\.css\??.*$/i,"$1").replace(/\//g,"_")}function d(a){var b;if(a&&((b=a.match(c("pl")))||(b=a.match(c("trustPagelet")))))return b[1].replace(/\//g,".")}function c(a){return new RegExp("^.*?\\/("+a+"\\/.*?)(_[a-z\\d]{16})?\\.js\\??.*$")}var a=$CONFIG,b=FM.view;FM.init({jsPath:a.jsPath,cssPath:a.cssPath,mJsPath:a.mJsPath});FM.view=function(a){a=a||{};var c=a.js,f="domid",g="ns",h,i;c=c&&[].concat(c);a[f]=a[f]||a.pid;a.js=c=c&&c[0];g in a||(a[g]=d(c));a.css=h=[].concat(a.css||[]);a.cssid=i=[].concat(a.cssid||[]);for(var j=i.length,k=h.length;j<k;++j)i[j]=e(h[j]);b(a)}}()


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
