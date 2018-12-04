const request = require('request-promise')

module.exports = async function fetch() {
  let res = await request('http://now.httpbin.org/')
  let _res = JSON.parse(res)

  let now = _res.now.rfc2822
  const logo = 'https://avatars2.githubusercontent.com/u/25895556?s=200&v=4'
  const headline = 'Main'

  // simulation data
  return { logo, headline, now }
}
