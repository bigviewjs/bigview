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


