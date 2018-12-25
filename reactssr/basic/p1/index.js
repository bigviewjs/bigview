'use strict'

import Biglet from '../../../packages/biglet';
import React from "react";

export default class MyPagelet extends Biglet {
  constructor(props) {
    super(props)

    this.state = { isToggleOn: true };

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);

    this.root = __dirname
    this.name = 'pagelet1'
    this.data = {
      is: 'pagelet1测试',
      po: {
        name: this.name
      }
    }
    this.domid = 'p1'
    this.location = 'pagelet1'
    // this.tpl = 'tpl/p1.html'
    this.delay = 4000
  }

  fetch() {
    return this.sleep(this.delay)
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  handleClick() {
    alert(1)
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
