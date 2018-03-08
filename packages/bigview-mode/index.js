const PipelineMode = require('./mode/pipeline.js')
const ParallelMode = require('./mode/parallel.js')
const ReduceMode = require('./mode/reduce.js')
const ReducerenderMode = require('./mode/reducerender.js')
const RenderMode = require('./mode/render.js')

// pagelets 5种情况
// 情况1： 随机，先完成的先写入，即pipeline模式(当前)
// 情况2： 随机，all完成之后，立即写入，即parallel模式
// 情况3： 连续模式reduce：依次连续写入
// 情况4： 即连续渲染模式reducerender，不写入布局，所有pagelet顺序执行完成，一次写入到浏览器。
// 情况5： 一次渲染模式render：即普通模式，不写入布局，所有pagelet执行完成，一次写入到浏览器。支持搜索引擎，用来支持那些不支持JS的客户端。

module.exports = {
  pipeline: PipelineMode,
  parallel: ParallelMode,
  reduce: ReduceMode,
  reducerender: ReducerenderMode,
  render: RenderMode
}
