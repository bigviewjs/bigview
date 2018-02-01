## 工具方法



或者自己使用

```
'use strict'

exports.noopPromise = function() {
	return Promise.resovle()
}

exports.toJsHtml = function(html, quotation) {
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

exports.toLineHtml = function(html) {
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

```