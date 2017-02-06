'use strict';

// ready
// 当布局输出完成的时候，触发
exports.ready = function(isDebug) {

    if(isDebug === true) {
        return `<script charset=\"utf-8\">bigview.debug=true;bigview.ready();</script>`
    }
    
    return `<script charset=\"utf-8\">bigview.ready();</script>`
}

// end
// 当所有模块都是输出完成的时候触发
exports.end = function(data) {
    let _data = {}
    if (data) {
        _data = data;
    }
    
    _data = JSON.stringify(_data);

    return `<script charset=\"utf-8\">bigview.end(${_data})</script>`
}
