'use strict';

const debug = require('debug')('bigview');
const fs = require('fs');
global.Promise = require("bluebird");
const EventEmitter = require('events');

module.exports = class BigViewBase extends EventEmitter {
    constructor(req, res, layout, data) {
        super();
        
        this._mode = 'pipline';
    }

    set mode(mode) {
        debug('bigview mode = ' + mode);

        // 用户设置第三
        if (fs.existsSync(__dirname + '/mode/' + mode + '.js') === true) {
            this._mode = mode;
        }
    }

    get mode() {
        return this._mode;
    }

    get modeInstance() {
        const Mode = require(__dirname + '/mode/' + this.mode);
        this._modeInstance = new Mode();
        debug(this._modeInstance);
        return this._modeInstance;
    }

    /**
     * Write bigview data to Browser.
     *
     * @api public;
     */
    write(text, isWriteImmediately) {
        if (!text) {
            throw new Error(' Write empty data to Browser.')
        }

        debug(text);

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
            throw new Error(' Write empty data to Browser.')
        }
        
        debug(text);

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
            console.log(err);
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
