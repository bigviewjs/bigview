# BigView


## 扩展BigView

MyBigView.js

```
const BigView = require('.').BigView

module.exports = class MyBigView extends BigView {  
  constructor (req, res, layout, data) {
    super (req, res, layout, data)
  }
  
  // before () {
  //    return new Promise(function(resolve, reject) {
  //       setTimeout(function(){
  //         resolve(true)
  //       }, 1000)
  //   })
  // }

  processError (err) {
    console.log(err)
  }
    //
  // after () {
  //
  // }
}
```

声明周期

- before
- after

一般，before比较有用，比如获取数据等耗时的操作


## 扩展Pagelet

MyPagelet.js

```
const Pagelet = require('.').Pagelet

module.exports = class MyPagelet extends Pagelet {
  renderText (data) {
    console.log(JSON.stringify(data))
    console.log('<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>')
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }

  renderTpl (data, text) {
    console.log(JSON.stringify(data))
    console.log('text=' + text)
    console.log('<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>')
    return '<script>bigpipe.set("' + this.name + '",' + JSON.stringify(data) + ');</script>'
  }
}

```

实例化

```
var pagelet1 = new MyPagelet('pagelet1', { is: "pagelet1测试" })
```

- 'pagelet1'是name
-  { is: "pagelet1测试" }是data
- 此种情况下无tpl，回调renderText方法

```
var pagelet2 = new MyPagelet('pagelet2', 'p', { t: "测试" })
```

- 'pagelet2'是name
- 'p'是模板
-  { is: "pagelet1测试" }是data
- 此种情况下有tpl，回调renderTpl方法


主要有2个抽象方法，必须实现

- renderText：将this.data作为参数，传递给renderText (data)，然后写给浏览器
- renderTpl：将this.tpl + this.data编译生成text，然后 renderTpl (data, text) ，然后写给浏览器

## 在app.js里集成

```
const MyBigView = require('./MyBigView')
const MyPagelet = require('./MyPagelet')

app.get('/index.html', function (req, res) {
  var bigpipe = new MyBigView(req, res, 'index', { title: "测试" })

  var pagelet1 = new MyPagelet('pagelet1', { is: "pagelet1测试" })
  var pagelet2 = new MyPagelet('pagelet2', 'p', { t: "测试" })

  setTimeout(function(){
    bigpipe.render(pagelet1)  
  },3000);
 
  setTimeout(function(){
    bigpipe.render(pagelet2)

    bigpipe.end()  
  },4000);
});
```

调用流程如下：

- 实例化MyBigView：bigpipe
- 实例化MyPagelet1：pagelet1
- 实例化MyPagelet2：pagelet2
- bigpipe.render(pagelet1)  
- bigpipe.render(pagelet2)  
- bigpipe.end()  

