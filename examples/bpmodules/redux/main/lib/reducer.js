
const actions = require('./actions')

function mainpagelet (state = {}, action) {
  switch (action.type) {
    case actions.INITIAL:
      return Object.assign({}, state, action.data)
    default:
      return state
  }
}

module.exports = mainpagelet
