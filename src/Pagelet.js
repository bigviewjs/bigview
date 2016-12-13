module.exports = class Pagelet {
  constructor (name, data) {
    this.name = name
    this.data = data
  }

  setTpl(name) {
      this.tpl = name;
  }

  renderText (data) {
    throw new Error('need impl')
  }

  renderTpl (data, text) {
    throw new Error('need impl')
  }
}
