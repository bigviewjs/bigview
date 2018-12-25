'use strict'
import React from "react";
import Biglet from '../../../packages/biglet';

export default class MyPagelet extends Biglet {
  constructor(props) {
    super(props)
    this.root = __dirname
    this.name = 'pagelet2'
    this.data = {
      t: '测试',
      po: {
        name: this.name
      }
    }
    this.domid = 'p2'
    this.tpl = 'p2'
    this.delay = 2000
  }

  fetch() {
    return this.sleep(this.delay)
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  render() {
    return (
      <div>
        <h1>P2 header</h1>
      </div>
    );
  }
}
