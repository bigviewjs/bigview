'use strict'
// pagelets 4种情况
// 情况1： 随机，先完成的先写入，即pipeline模式
// 情况2： 随机，all完成之后，立即写入，即parallel模式
// 情况3： 依次，写入(当前)
// 情况4： 依次，不写入，all完成之后再写入
module.exports = class ReduceRenderMode {
	constructor() {
		this.isLayoutWriteImmediately = true
		this.isPageletWriteImmediately = false

		this.total = []
	}

	/**
	 * execute pagelets'action
	 * 
	 * @param {any} bigview
	 * @returns
	 */
	execute(bigview) {
		let self = this

		return Promise.reduce(bigview.pagelets, (total, _pagelet, index) => {
			_pagelet.isPageletWriteImmediately = self.isPageletWriteImmediately
			if (_pagelet.immediately === true) {
				return _pagelet._exec().then(function(i) {
					self.total.push(i)
					return Promise.resolve()
				})
			} else {
				return Promise.resolve()
			}
		}, 0).then(res => {
			let arr = []
			self.total.forEach(function(i) {
				i.forEach(function(j) {
					arr.push(j)
				})
			})
			return Promise.resolve(arr)
		})
	}
}