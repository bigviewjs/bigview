'use strict'

const Biglet = require('../../../../packages/biglet')
const actions = require('./lib/actions')
const reducer = require('./lib/reducer')

class TodoListPagelet extends Biglet {
  constructor (owner) {
    super(owner)
    this.reducer = reducer

    this.root = __dirname
    this.tpl = './index.html'
    this.name = 'todolist'
    this.domid = 'todolist'
  }

  changeTodoList () {
    const state = this.owner.getState()
    console.log('在todo中获取redux state', state)
    this.data = {
      todoList: state.todolist
    }
  }

  async fetch () {
    this.sub(this.changeTodoList)
    // use owner dataStore mainData
    const text = '测试数据1'
    console.log('todolist中获取数据')
    this.owner.dispatch(actions.addTodo(text))
  }
}

// TodoListPagelet.reducer = reducer

module.exports = TodoListPagelet
