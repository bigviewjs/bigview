const PipelineMode = require('./mode/pipeline.js')
const ParallelMode = require('./mode/parallel.js')
const ReduceMode = require('./mode/reduce.js')
const ReducerenderMode = require('./mode/reducerender.js')
const RenderMode = require('./mode/render.js')

module.exports = {
  pipeline: PipelineMode,
  parallel: ParallelMode,
  reduce: ReduceMode,
  reducerender: ReducerenderMode,
  render: RenderMode
}
