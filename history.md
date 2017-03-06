# History

## Version

- v.1.3.10
	- 重构mode部分，讲引用移到mode/index.js里，内敛
	- for sonar
	- refact bigview write api
	- 移除无用的this.layoutHtml
	- 移除动态布局
	- 将req和res移除到base里
	- 重构biglet赋值比较绕的问题
	- 修复，之前的parallel模式渲染问题，已测试
	- 移除显式的比较true
	- 修复render模式输出
	- add pipeline mode test
- v1.3.9
	- [x] 使用bluebird作为global.Promise，避免外部错误
	- [x] 去掉bigpipe.debug = false;使用环境变量BIGVIEW_DEBUG
	- [x] bigview && biglet conosle.log("BIGVIEW" + err) 增加模块标识，便于日志记录
	- [x] this.tpl = 'tpl/index';干掉，设为默认值
	- [x] biglet // custom error function
	- [x] 子模块的顺序，也可以指定pagelet1.mode = 'render'
	- [x] 修复之前mode遗留问题，以前的render模式，仍然是先输出布局的，这是不对的，已修改
	- (待处理)this.root = __dirname;有疑问？暂无解决方案，需要思考
	- (待处理)当没有数据的时候，不显示改模块，目前的做法是 return Promise.reject(); 语义上怪
- v1.2.8 (2017年1月11日，i5ting)
  - bigview支持错误模块显示，仅限于布局之前
  - Pagelet里触发其他模块

## Desgin 

### v1

- 实现基本功能(pipeline管线模式)

### v2

- pipeline管线模式
- 多种布局
- 实现pagelet嵌套
- 生命周期回调

### v3

- 增加3种模式mode
- 考虑加入[joi](https://github.com/hapijs/joi),对pagelet.data进行校验
- 采用eventemitter收集数据，self.ower.emit()，可以兼顾内嵌pagelet
- 子流程其实也可以考虑顺序或并行，只是意义多大

BigPipe的三种模式：

- common一次渲染模式：即普通模式，支持搜索引擎，用来支持那些不支持JS的客户端。
- 并行
  - pipeline管线模式：即并行模式，并行请求，并即时渲染。(已实现)
  - parallel并行模式：并行请求，但在获得所有请求的结果后再渲染。

维度

- 依次Promise.reduce
- 随机Promise.all
- 写入
- 不写入（暂存，稍后一起写入）

可能性

- 依次写入（性能第3）
- 依次不写入（性能第4）
- 随机写入（性能第1）
- 随机不写入（性能第2）

核心流程

- 布局：是否立即写入
- pagelets处理：各种bp模式
- end：检查缓存，并end结束
