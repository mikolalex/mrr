import React from 'react';
import { withMrr, skip } from './mrr';
import _ from 'lodash';

const prop = a => b => b[a];
const id = a => a;
const not = a => !a;
const always = a => () => a;
const incr = a => a + 1;
const asProp = prop => val => ({ [prop]: val })
const assoc = prop => val => obj => ({
  ...obj,
  [prop]: val,
})
const I = (...funcs) => arg => {
  funcs.forEach(f => {
    arg = f(arg);
  })
  return arg;
}
const ifPressed = key => e => e.key == key || skip;


const todos = [
  {
    id: 1,
    text: 'Save the world',
    completed: true,
  },
  {
    id: 2,
    text: 'Have a beer',
    completed: false,
  },
  {
    id: 3,
    text: 'Have a sleep',
    completed: false,
  },
];

const TodoItem = withMrr({
  isEdited: ['toggle', 'startEdit', 'finishEdit'],
  id: [prop('id'), '$props'],
  changes: ['merge',
    [(completed, id) => [{ completed }, { id }], 'complete', '-id'],
    [(text, id) => [{ text }, { id }], 'afterEdit.update', '-id'],
  ],
  newText: [prop('text'), '$props'],
  afterEdit: ['split', {
    'remove': not,
    'update': id,
  }, '-newText', 'finishEdit'],
  remove: [asProp('id'), '-id', ['merge', 'afterEdit.remove', 'removeItem']],
}, (state, props, $) => <div>
   <input type="checkbox" checked={ props.completed } onChange={ $('complete', !props.completed) } /> &nbsp;&nbsp;&nbsp; <a onClick={ $('removeItem') }>Remove</a>
   { state.isEdited
     ? <div><input defaultValue={ props.text } onChange={ $("newText") } onKeyPress={ $('finishEdit', ifPressed('Enter')) } /></div>
     : <div onClick={ $("startEdit") }>{ props.text }</div>
   }
   <br /><br />

 </div>);

const Todos = withMrr({
  $init: {
    todos,
    show: '*',
  },
  newTodoItem: [I(asProp('text'), assoc('completed')(false)), '-newInput', 'addNewTodo'],
  newInput: [always(''), 'newTodoItem'],
  lastId: ['merge',
    [I(prop('length'), incr), '-todos', '$start'],
    [incr, '-lastId', 'addTodo'],
  ],
  addTodo: [(item, id) => assoc('id')(id)(item), ['merge', '*/add', 'newTodoItem'], '-lastId'],
  todos: ['list', {
    add: 'addTodo',
    edit: ['merge', '*/changes', [completed => [{ completed }, {}], 'toggleCompleted']],
    remove: ['merge', '*/remove', [always({ completed: true}), 'clear_done']],
  }],
  openNumber: [todos => todos.filter(I(prop('completed'), not)).length, 'todos'],
  shownTodos: [(a, val) => a.filter(i => i.completed !== val), 'todos', 'show'],
}, (state, props, $, connectAs) => {
  return (
    <div>
      <div>
        <h1>Todos</h1>
        {
          state.shownTodos.map(todo => {
              const props = { ...todo, ...connectAs(todo.id), key: todo.id };
              return <TodoItem {...props} />;
          })
        }
      </div><br />
      Show: <br />
      <ul>
        <li onClick={ $('show', '*') } className={ (state.show === '*') ? 'active' : '' }>
            All
        </li>
        <li onClick={ $('show', false) } className={ (state.show === false) ? 'active' : '' }>
          Completed
        </li>
        <li onClick={ $('show', true) } className={ (state.show === true) ? 'active' : ''}>
          Open
        </li>
      </ul><br /><br />
      <a onClick={ $('clear_done') }>Remove completed</a><br /><br />
      <input type="checkbox" value={ state.openNumber === 0 ? 'on' : 'off' } checked={ state.openNumber === 0 } onClick={ $('toggleCompleted') } />
      Check/uncheck all<br /><br />
      Add new: <input type="text" value={ state.newInput } onChange={ $('newInput') } onKeyPress={ $("addNewTodo", ifPressed('Enter')) } />
      <br /><br />
      { state.openNumber } items left
    </div>);
});

export default Todos;
