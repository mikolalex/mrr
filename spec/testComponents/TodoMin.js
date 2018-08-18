import React from 'react';
import { withMrr, skip } from '../../../mrr/src';
import { pipe, prop, not, always, assoc, filter, __, equals } from 'ramda';

const todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
const ifPressed = key => e => e.key == key || skip;
const hashMap = {
    all: '*',
    completed: false,
    active: true,
}
const get_hash = () => hashMap[window.location.hash.replace('#/', '')];

const Todos = withMrr({
  $init: {
    todos,
  },
  newTodoItem: [assoc('text', __, { completed: false }), '-newInput', 'addNewTodo'],
  newInput: [always(''), 'newTodoItem'],
  todos: ['list', {
	create: 'newTodoItem',
	update: ['merge',
	  'setCompleted',
      'afterEdit.update',
	  [completed => ([{ completed }, {}]), 'toggleCompleted']],
    delete: ['merge',
      [always({ completed: true }), 'clearCompleted'],
      'afterEdit.remove'],
  }],
  isEdited: ['merge', 
    'startEdit', 
    [always(false), 'afterEdit.remove', 'afterEdit.update']
  ],
  afterEdit: ['split', {
    'remove': (text, i) => !text && i,
    'update': (text, i) => text && [{ text }, i],
  }, '-newText', '-isEdited', 'finishEdit'],
  show: ['async', cb => {
    window.addEventListener('hashchange', () => cb(get_hash()));
    cb(get_hash());
  }, '$start'],
  shownTodos: [(a, val) => a.filter(pipe(prop('completed'), equals(val), not)), 'todos', 'show', '$start'],
  openNumber: [pipe(filter(pipe(prop('completed'), not)), prop('length')), 'todos', '$start'],
  toLS: [arr => localStorage.setItem('todos', JSON.stringify(arr)), 'todos'],
}, (state, props, $) => {
  return (
    <div className="todo-app">
	  <div>
        <h1>Todos</h1>
        {   state.shownTodos && state.shownTodos.map((todo, i) => (
                <div className="todo-item">
                    <input type="checkbox" checked={ todo.completed } onChange={ $('setCompleted', [{ completed: !todo.completed }, i]) }  />
                    <div className="remove">
                     <a onClick={ $('removeItem') }>Remove</a>
                    </div>
                    { state.isEdited === i
                      ? <div className="text"><input 
                          defaultValue={ todo.text } 
                          onChange={ $("newText") }
                          onKeyPress={ $('finishEdit', ifPressed('Enter')) } /></div>
                      : <div className="text" onClick={ $("startEdit", i) }>{ todo.text }</div>
                    }
                </div>)
            )
        }
      </div>
	  <div>
		<input placeholder="What needs to be done?" type="text" value={ state.newInput } onChange={ $('newInput') } onKeyPress={ $("addNewTodo", ifPressed('Enter')) } />
	  </div>
	  { (state.openNumber !== state.todos.length) && <div>
		<a onClick={ $('clearCompleted') } className="clear-completed">Clear completed</a>
	  </div> }
	  { !!state.todos.length && <div>
		<input type="checkbox" value={ state.openNumber === 0 ? 'on' : 'off' } checked={ state.openNumber === 0 } onClick={ $('toggleCompleted') } />
		Check/uncheck all
	  </div> }
      <div>
         Show:
         <ul className="options">
	         <a href="#/all" className={ (state.show === '*') ? 'active' : '' }>
	                 All
	         </a> &nbsp;&nbsp;
	         <a href="#/completed" className={ (state.show === false) ? 'active' : '' }>
	           Completed
	         </a> &nbsp;&nbsp;
	         <a href="#/active" className={ (state.show === true) ? 'active' : ''}>
	           Open
	         </a>
         </ul>
        </div>
        <div>
		  { state.openNumber } items left
	    </div>
    </div>);
});

export default Todos;