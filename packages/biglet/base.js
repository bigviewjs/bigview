'use strict'

const debug = require('debug')('biglet')
const fs = require('fs')


class PageletBase {

	mock(file) {
		if (file) {
		    this.previewFile = file;
		}

		this.isMock = true;
		this._exec();
	}

	out() {
		// 子的pagelets如何处理
		if (this.isMock && this.previewFile) {
            fs.writeFileSync(this.previewFile, this.html, 'utf8');
        }
	}

	// lazy get value
	// if immediately === false, pagelet will not render immediately
	// so the container div should be hidden with {{display}}
	//
	// example
	//
	// {{#each pagelets}}
	//   <div id="{{ location }}" style="display:{{ display }}">loading...{{ name }}...{{ display }}</div>
	// {{/each}}
	set logger(logger) {
		if (this.owner && this.owner.logger) {
            this._logger = this.owner.logger;
		}
	}
  
	get logger() {
		return this._logger;
	}

	get display() {
		return this.immediately === false ? 'none' : 'block';
	}
}

module.exports = PageletBase
