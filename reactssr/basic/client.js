import React from "react";
import ReactDOM from "react-dom";
import Loadable from 'react-loadable';

import layout from './layout'
import main from './main'
import p1 from './p1'
import p2 from './p2'

window.__webpack_modules__ = {}

var all = {
    'layout': layout,
    'main': main,
    'p1': p1,
    'p2': p2,
}

window['biglet_main'] = () => {
    biglet_render(main, 'main')
}

window['biglet_layout'] = () => {
    biglet_render(layout, 'layout')
}

window['biglet_p2'] = () => {
    biglet_render(p2, 'p2')
}

window['biglet_p1'] = () => {
    biglet_render(p1, 'p1')
}

function biglet_render(c, i) {
    ReactDOM.hydrate(React.createElement(c, null), document.getElementById(i));
}
