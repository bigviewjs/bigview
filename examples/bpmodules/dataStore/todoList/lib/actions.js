/*
 * action 类型
 */

const ADD_TODO = 'ADD_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * 其它的常量
 */

const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

/*
 * action 创建函数
 */

function addTodo (text) {
  return { type: ADD_TODO, text }
}

function toggleTodo (index) {
  return { type: TOGGLE_TODO, index }
}

function setVisibilityFilter (filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}

module.exports = {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters,
  addTodo,
  toggleTodo,
  setVisibilityFilter
}
