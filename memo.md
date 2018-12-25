bigview.prototype.view = function(){
    if (typeof __webpack_modules__ !== "object") {
        // 放到bigview.js的cache里
    }else{
        window.a()
    }
}

Layout组件里绑定几个初始化方法

// src/entry.js
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import App from './components/App';

Loadable.preloadReady().then(() => {
    // ready后里面，ReactDOM.hydrate缓存内的组件
    bigview.cache.map
        ReactDOM.hydrate(<a/>, document.getElementById('app'));

    //绑定事件
    window.a = fun(){
        ReactDOM.hydrate(<a/>, document.getElementById('app'));
    }

    window.b = fun(){
        ReactDOM.hydrate(<b/>, document.getElementById('app'));
    }
});



