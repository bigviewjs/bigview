'use strict';

const debug = require('debug')('bigview');
const Promise = require("bluebird");
const EventEmitter = require('events');

const PipelineMode = require('./mode/pipeline.js');
const ParallelMode = require('./mode/parallel.js');
const ReduceMode = require('./mode/reduce.js');
const ReducerenderMode = require('./mode/reducerender.js');
const RenderMode = require('./mode/render.js');

const PROMISE_RESOLVE = Promise.resolve(true);

const ModeInstanceMappings = {
    pipeline: new PipelineMode(),
    parallel: new ParallelMode(),
    reduce: new ReduceMode(),
    reducerender: new ReducerenderMode(),
    render: new RenderMode()
}

module.exports = class BigViewBase extends EventEmitter {
    constructor(req, res, layout, data) {
        super();
        
        this.mode = 'pipeline';

        this.on('bigviewWrite', this.writeDataToBrowser.bind(this));
        this.on('pageletWrite', this.writeDataToBrowser.bind(this));
    }
    
    set dataStore(obj) {
        this._dataStore = obj;
    }
    
    get dataStore() {
        return this._dataStore;
    }
    
    get query() {
        return this.req.query;
    }
    
    get params() {
        return this.req.params;
    }
    
    get body() {
        return this.req.body;
    }
    
    get cookies() {
        return this.req.cookies;
    }

    set mode(mode) {
        debug('bigview mode = ' + mode);
        if (!ModeInstanceMappings[mode]) {
            console.log("bigview.mode only support [ pipeline | parallel | reduce | reducerender | render ]")
            return;
        }
        this._mode = mode;
        this._modeInstance = ModeInstanceMappings[mode];
    }

    get mode() {
        debug('mode = ' + this._mode);
        return this._mode;
    }

    get modeInstance() {
        debug('modeInstance = ' + this._modeInstance);
        return this._modeInstance;
    }

    /**
     * Write bigview data to Browser.
     *
     * @api public;
     */
    writeDataToBrowser(text, isWriteImmediately) {
        if (!text) {
            throw new Error('Write empty data to Browser.')
        }

        debug('Write data to Browser ' + text);

        // 是否立即写入，如果不立即写入，放到this.cache里
        if (!isWriteImmediately && this.modeInstance.isLayoutWriteImmediately === false) {
            return this.cache.push(text);
        }

        if (this.done === true) {
            throw new Error(' Write data to Browser after bigview.dong = true.')
        }

        debug('BigView final data = ' + text);
        debug(text);
        
        if (text && text.length > 0) {
            // write to Browser;
            this.res.write(text);
        }
    }

    processError(err) {
        return new Promise(function (resolve, reject) {
            debug(err);
            resolve(true);
        });
    }

    // lifecycle;
    beforeRenderPagelets() {
        return PROMISE_RESOLVE;
    }

    afterRenderPagelets() {
        return PROMISE_RESOLVE;
    }

    beforeRenderLayout() {
        return PROMISE_RESOLVE;
    }

    afterRenderLayout() {
        return PROMISE_RESOLVE;
    }
    
    // event wrapper
    write(html, isWriteImmediately) {
        let _isWriteImmediately = isWriteImmediately || true;
        this.emit('bigviewWrite', html, _isWriteImmediately);
    }
};
