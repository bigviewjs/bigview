import test from 'ava'

const app = require('../examples/app')

const sinon = require('sinon')
const Bigview = require("../packages/bigview")
const Biglet = require("../packages/biglet")
const ModeInstanceMappings = require('../packages/bigview-mode')

test('biglet custom payload', t => {
    
    var p1 = new Biglet()
    p1.owner = {
        res : {
            render: function(tpl, data){
                console.log(tpl)
                console.log(data)
            }
        }
    }
    p1.payload = {
        a:1,
        b:2
    }
    
    
    p1.compile = (tpl, data) => {
        return Promise.resolve()
    }
    
    p1.render = function () {
        return Promise.resolve()
    }
    
    p1.end = function () {
        t.regex(p1.view, /bigview.view\({\"a\":1,\"b\":2,/)
    }
    
    return p1._exec()
})


