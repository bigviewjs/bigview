# History

## Version

- v1.2.8 (2017年1月11日，i5ting)
  - 出错模块
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
