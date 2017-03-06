'use strict';

const debug = require('debug')('bigview');
const Promise = require("bluebird");
const EventEmitter = require('events');

const ModeInstanceMappings = require('./mode')
const Utils = require('./utils');

const PROMISE_RESOLVE = Promise.resolve(true);

module.exports = class BigViewBase extends EventEmitter {
    constructor(req, res, layout, data) {
        super();
        
        this.mode = 'pipeline';
        
        // 缓存express的req和res
        this.req = req;
        this.res = res;

        // 用于缓存res.write的内容
        this.cache = [];

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
            Utils.log("bigview.mode only support [ pipeline | parallel | reduce | reducerender | render ]")
            return;
        }
        this._mode = mode;
        this._modeInstance = new ModeInstanceMappings[mode]();
    }

    get mode() {
        debug('mode = ' + this._mode);
        return this._mode;
    }

    get modeInstance() {
        debug('modeInstance = ' + this._modeInstance);
        return this._modeInstance;
    }
    // refact
    getModeInstanceWith(mode) {
        debug('biglet (children) mode = ' + mode);
        if (!ModeInstanceMappings[mode]) {
            Utils.log("biglet (children) .mode only support [ pipeline | parallel | reduce | reducerender | render ]")
            return;
        }
        
        return new ModeInstanceMappings[mode]();
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
        if (!isWriteImmediately || this.modeInstance.isLayoutWriteImmediately === false) {
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
        // 不生效，某种模式下会有问题
        this.emit('bigviewWrite', html, isWriteImmediately);
    }
};
