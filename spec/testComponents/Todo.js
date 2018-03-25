import React from 'react';
import { withMrr, skip } from './mrr';
import _ from 'lodash';

const prop = a => b => b[a];
const id = a => a;
const not = a => !a;
const always = a => () => a;
const incr = a => a + 1;
const asProp = prop => val => ({ [prop]: val })
const addProp = prop => val => obj => {
  obj[prop] = val;
  return obj;
}

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
  $init: {
    isEdited: false,
  },
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
  $log: ['todos'],
  $init: {
    show: 'all',
    todos,
    shownTodos: [],
    lastId: 1,
  },
  newTodoItem: [I(asProp('text'), addProp('completed')(false)), '-newInput', 'addNewTodo'],
  newInput: [always(''), 'newTodoItem'],
  lastId: ['merge',
    [I(prop('length'), incr), '-todos', '$start'],
    [incr, '-lastId', 'addTodo'],
  ],
  addTodo: [(item, id) => {
    item.id = id;
    return item;
  }, ['merge', '*/add', 'newTodoItem'], '-lastId'],
  todos: ['list', {
    add: 'addTodo',
    edit: '*/changes',
    remove: ['merge', '*/remove', [always({ completed: true}), 'clear_done']],
  }],
  completedNumber: [todos => todos.filter(prop('completed')).length, 'todos'],
  openNumber: [todos => todos.filter(I(prop('completed'), not)).length, 'todos'],
  totalNumber: [prop('length'), 'todos'],
  // stat: [todos => {
  //   const res = {
  //     total: 0,
  //     completed: 0,
  //     open: 0,
  //   };
  //   todos.forEach(todo => {
  //     ++res.total;
  //     if (todo.completed) {
  //       ++res.completed;
  //     } else {
  //       ++res.open;
  //     }
  //   })
  //   return res;
  // }, 'todos'],
  shownTodos: [(a, show) => a.filter(i => show === 'all' || (show === 'completed' && i.completed) || (show === 'open' && !i.completed)), 'todos', 'show'],
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
        <li onClick={ $('show', 'all') }>
            All
        </li>
        <li onClick={ $('show', 'completed') }>
          Completed
        </li>
        <li onClick={ $('show', 'open') }>
          Open
        </li>
      </ul><br /><br />
      <a onClick={ $('clear_done') }>Remove completed</a><br /><br />
      Add new: <input type="text" value={ state.newInput } onChange={ $('newInput') } onKeyPress={ $("addNewTodo", ifPressed('Enter')) } />
      <br /><br />
      Total: { state.totalNumber }, completed: { state.completedNumber }, open: { state.openNumber }
    </div>);
});

export default Todos;
