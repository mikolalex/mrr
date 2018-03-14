import React from 'react';
import { withMrr, skip } from './mrr';
import _ from 'lodash';

const prop = a => b => b[a];
const id = a => a;
const not = a => !a;
const always = a => () => a;

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
  afterEdit: ['split', {
    'remove': not,
    'update': id,
  }, '-newText', 'finishEdit'],
  remove: [id => ({ id }), '-id', ['merge', 'afterEdit.remove', 'removeItem']],

}, (state, props, $) => <div>
   <input type="checkbox" checked={ props.completed } onClick={ $('complete', !props.completed) } /> &nbsp;&nbsp;&nbsp; <a onClick={ $('removeItem') }>Remove</a>
   { state.isEdited
     ? <div><input defaultValue={ props.text } onChange={ $("newText") } onKeyPress={ $('finishEdit', e => e.key == 'Enter' || skip) } /></div>
     : <div onClick={ $("startEdit") }>{ props.text }</div>
   }
   <br /><br />

 </div>);

const Todos = withMrr({
  $init: {
    show: 'all',
    todos,
    shownTodos: [],
  },
  todos: ['list', {
    add: '*/add',
    edit: '*/changes',
    remove: ['merge', '*/remove', [always({ completed: true}), 'clear_done']],
  }],
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
      <a onClick={ $('clear_done') }>Remove completed</a>
    </div>);
});

export default Todos;
