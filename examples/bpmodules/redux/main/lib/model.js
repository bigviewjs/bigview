class Model {
  constructor (data) {
    this.headline = data.headline
    this.logo = data.logo
    this.now = data.now
  }

  set headline (headline) {
    this._headline = headline ? headline.trim() : ''
  }

  get headline () {
    return this._headline
  }

  set logo (logo) {
    this._logo = logo ? logo.trim() : ''
  }

  get logo () {
    return this._logo
  }

  toJSON () {
    return {
      headline: this.headline,
      logo: this.logo,
      now: this.now
    }
  }
}

module.exports = Model
