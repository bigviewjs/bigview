// const Biglet = require('../../../packages/biglet')
import React from "react";
import Biglet from '../../../packages/biglet';

export default class MainPagelet extends Biglet {
  constructor(props) {
    super(props)
    this.root = __dirname
    this.name = 'main biglet'
    this.data = {
      is: 'main biglet',
      po: {
        name: this.name
      }
    }
    this.domid = 'main'
    this.tpl = './tpl/index'
    this.delay = 100

    if (!MainPagelet.instance) {
      MainPagelet.instance = this;
    }
    return MainPagelet.instance;
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
        <h1>Main header</h1>
      </div>
    );
  }
}
