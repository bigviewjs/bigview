const path = require('path')
import Biglet from '../../../packages/biglet';
// import Layout from "./Layout";
// import Header from "./Header";
import React from "react";

export default class LayoutPagelet extends Biglet {
  constructor() {
    super()
 
    this.root = __dirname
    this.name = 'layout biglet'
    this.data = {
      title: 'BigKoa',
      desc: 'bigbipe with koa',
      po: {
        name: this.name
      }
    }
    this.state = {
      title: 'Welcome to React SSR!'
    };
    this.domid = 'layout'
    this.tpl = path.join(__dirname, './tpl/index')
    this.delay = 0

    if (!LayoutPagelet.instance) {
      LayoutPagelet.instance = this;
    }
    return LayoutPagelet.instance;
  }

  fetch() {
    return this.sleep(this.delay)
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  render() {
    // let pagelets = this.owner.pagelets
    return (
      <html>
        <head>
          <meta charset='utf-8'></meta>
          <meta charset="utf-8"></meta>
          <link rel="stylesheet" href="/stylesheets/style.css" />
          
          <title>React SSR</title>
        </head>

        <body>
          <div id='app'>
            <div id="main">
            </div>
            <div id="p1"></div>
            <div id="p2"></div>
          </div>
          <script src="/js/bigview.js"></script>
          <script src='./app.bundle.js'></script>
        </body>
      </html>
    );
  }
}
