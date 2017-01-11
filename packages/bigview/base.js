'use strict';

const debug = require('debug')('bigview');
const fs = require('fs');
const Promise = require("bluebird");
const EventEmitter = require('events');

const PipelineMode = require('./mode/pipeline.js');
const ParallelMode = require('./mode/parallel.js');
const ReduceMode = require('./mode/reduce.js');
const ReducerenderMode = require('./mode/reducerender.js');
const RenderMode = require('./mode/render.js');

module.exports = class BigViewBase extends EventEmitter {
    constructor(req, res, layout, data) {
        super();
        
        this.mode = 'pipline';

        this.on('write', this.write.bind(this));
        this.on('pageletWrite', this.pageletWrite.bind(this));
    }
    
    set dataStore(obj) {
        this._dataStore = obj
    }
    
    get dataStore() {
        return this._dataStore
    }
    
    get query() {
        return this.req.query
    }
    
    get params() {
        return this.req.params
    }
    
    get body() {
        return this.req.body
    }
    
    get cookies() {
        return this.req.cookies
    }

    set mode(mode) {
        debug('bigview mode = ' + mode);

        // 用户设置第三
        if (fs.existsSync(__dirname + '/mode/' + mode + '.js') === true) {
            this._mode = mode;
        }
        
        switch(mode) {
            case 'pipeline':
                this._modeInstance = new PipelineMode();
                break;
            case 'parallel':
                this._modeInstance = new ParallelMode();
                break;
            case 'reduce':
                this._modeInstance = new ReduceMode();
                break;
            case 'reducerender':
                this._modeInstance = new ReducerenderMode();
                break;
            case 'render':
                this._modeInstance = new RenderMode();
                break;
            default:
              this._modeInstance = new PipelineMode();
        }
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
    write(text, isWriteImmediately) {
        if (!text) {
            throw new Error('Write empty data to Browser.')
        }

        debug('Write bigview data to Browser ' + text);

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

    /**
     * Write pagelet data to Browser.
     *
     * @api public
     */
    pageletWrite(text, isWriteImmediately) {
        if (!text) {
            throw new Error('Write empty data to Browser.')
        }
        
        debug('Write pagelet data to Browser ' + text);

        if (isWriteImmediately === false) {
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
            console.error(err);
            resolve(true);
        });
    }

    // lifecycle;
    beforeRenderPagelets() {
        return Promise.resolve(true)
    }

    afterRenderPagelets() {
        return Promise.resolve(true)
    }

    beforeRenderLayout() {
        return Promise.resolve(true)
    }

    afterRenderLayout() {
        return Promise.resolve(true)
    }
};
