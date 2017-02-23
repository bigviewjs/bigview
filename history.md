# History

## Version

- v1.3.9
	- [x] 去掉bigpipe.debug = false;使用环境变量（桑世龙）
	- [ ] 去掉bigpipe.mode = 'pipeline';因为默认就是这个，可以不用谢（桑世龙）
	- [ ] bigview && biglet conosle.log("BIGVIEW" + err) 增加模块标识，便于日志记录（桑世龙）
	- [ ] this.tpl = 'tpl/index';干掉，设为默认值（桑世龙）
	- [ ] this.root = __dirname;有疑问？暂无解决方案，需要思考（桑世龙）
	- [ ] biglet // custom error function
	- [ ] 当没有数据的时候，不显示改模块，目前的做法是 return Promise.reject(); 语义上怪（桑世龙）

	- 子模块的顺序，也可以指定
	- // 日志前缀
	- write layout 和mode
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
