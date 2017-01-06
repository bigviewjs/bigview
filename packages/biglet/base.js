'use strict'

const debug = require('debug')('biglet')
const fs = require('fs')


class PageletBase {


	noopPromise() {
		let self = this
		return new Promise(function(resolve, reject) {
			resolve(true);
		})
	}

	toJsHtml(html, quotation) {
		let regexp
		if (quotation === "'") {
			regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\')|(\t)/g
		} else {
			regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\")|(\t)/g
		}

		return html.replace(regexp, function(word) {
			var char = word.substring(0, 1)

			if (char === "\r" || char === "\n") {
				return "\\n"
			} else if (char === '"') {
				return '\\"'
			} else if (char === "'") {
				return "\\'"
			} else if (char === "\t") {
				return "\\t"
			} else {
				return word
			}
		})
	}

	toLineHtml(html) {
		let regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\")|(\t)/g

		return html.replace(regexp, function(word) {
			var char = word.substring(0, 1)

			if (char === "\r" || char === "\n") {
				return ""
			} else if (char === "\t") {
				return ""
			} else {
				return word
			}
		})
	}

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
