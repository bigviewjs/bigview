const PipelineMode = require('./pipeline.js');
const ParallelMode = require('./parallel.js');
const ReduceMode = require('./reduce.js');
const ReducerenderMode = require('./reducerender.js');
const RenderMode = require('./render.js');

module.exports = {
    pipeline: PipelineMode,
    parallel: ParallelMode,
    reduce: ReduceMode,
    reducerender: ReducerenderMode,
    render: RenderMode
}
