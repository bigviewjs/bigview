import test from 'ava'

const app = require('../examples/app')

const sinon = require('sinon')
const Bigview = require("../packages/bigview")
const Biglet = require("../packages/biglet")

test('.addChild(SubPagelet)', t => {
    var p1 = new Biglet()
    let sub = require('./fixtures/Biglet1.js')
    
    // 默认children为空
    t.is(p1.children.length, 0)
    
    p1.addChild(sub)
    
    // 将sub加入到children里，数组长度为1
    t.is(p1.children.length, 1)
})

test('._exec() return promise', t => {
    var p1 = new Biglet()
    p1.owner = {
        res : {
            render: function(tpl, data){
                console.log(tpl)
                console.log(data)
            }
        }
    }
    
    p1.compile = (tpl, data) => {
        return Promise.resolve()
    }
    
    p1.render = function () {
        return Promise.resolve()
    }
   
    return p1._exec().then(()=>{
        t.pass()
    })
})

test('.before() return promise', t => {
    var p1 = new Biglet()
    
    
    return p1.before().then(()=>{
        t.pass()
    })
})

test('.fetch() return promise', t => {
    var p1 = new Biglet()
    
    
    return p1.fetch().then(()=>{
        t.pass()
    })
})

test('.parse() return promise', t => {
    var p1 = new Biglet()
    
    
    return p1.parse().then(()=>{
        t.pass()
    })
})

test('.compile(tpl, data) return promise', t => {
    var p1 = new Biglet()
    p1.owner = {
        res : {
            render: function (tpl, data, cb) {
                cb(null, tpl + data)
            }
        }
    }
    
    return p1.compile('index.jade', 'data').then((html)=>{
        t.is(html, 'index.jade' + 'data')
    })
})

test('.compile(tpl, data) with reject error', t => {
    var p1 = new Biglet()
    p1.owner = {
        res : {
            render: function (tpl, data, cb) {
                cb(new Error('i am an error!'), tpl + data)
            }
        }
    }
    
    return p1.compile('index.jade', 'data').catch(function(){
        t.pass()
    })
})

