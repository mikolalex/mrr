import React from 'react';
import { withMrr, skip } from './mrr';

const styles = `

body {
    padding: 10px;
}
.options {
    margin: 0;
    padding: 0;
    display: inline-block;
}
.todo-item {
    border: 1px dotted grey;
    padding: 10px;
    margin: 10px 0;
}
.remove  {
    float: right;
}
.remove, .clear-completed, .options li {
    color: blue;
    text-decoration: underline;
    display: inline-block;
    margin: 0 5px;
    cursor: pointer;
}
.options li.active {
    border: 1px dotted grey;
    color: black;
    padding: 3px;
    text-decoration: none;
}
.text {
    display: inline-block;
    padding: 0 10px;
}
.todo-app > * {
    margin: 20px 0;
}

  `;

const prop = a => b => b[a];
const id = a => a;
const not = a => !a;
const always = a => () => a;
const incr = a => a + 1;
const asProp = prop => val => ({ [prop]: val })
const assoc = prop => val => obj => Object.assign({}, obj, { [prop]: val });
const I = (...funcs) => arg => {
  funcs.forEach(f => {
    arg = f(arg);
  })
  return arg;
}
const ifPressed = key => e => e.key == key || skip;


const todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [
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
}, (state, props, $) => ( <div className="todo-item">
   <input type="checkbox" checked={ props.completed } onChange={ $('complete', !props.completed) } />
   <div className="remove">
    <a onClick={ $('removeItem') }>Remove</a>
   </div>
   { state.isEdited
     ? <div className="text"><input defaultValue={ props.text } onChange={ $("newText") } onKeyPress={ $('finishEdit', ifPressed('Enter')) } /></div>
     : <div className="text" onClick={ $("startEdit") }>{ props.text }</div>
   }
 </div>));

const Todos = withMrr({
  $init: {
    todos,
    show: '*',
    shownTodos: [],
  },
  newTodoItem: [I(asProp('text'), assoc('completed')(false)), '-newInput', 'addNewTodo'],
  newInput: [always(''), 'newTodoItem'],
  lastId: ['merge',
    [I(prop('length'), incr), '-todos', '$start'],
    [incr, '-lastId', 'addTodo'],
  ],
  addTodo: [(item, id) => assoc('id')(id)(item),
    ['merge', '*/add', 'newTodoItem'],
    '-lastId'
  ],
  todos: ['list', {
    add: 'addTodo',
    edit: ['merge',
      '*/changes',
      [completed => [{ completed }, {}], 'toggleCompleted']
    ],
    remove: ['merge',
      '*/remove',
      [always({ completed: true}), 'clear_done']
    ],
  }],
  openNumber: [todos => todos.filter(I(prop('completed'), not)).length, 'todos', '$start'],
  shownTodos: [(a, val) => a.filter(i => i.completed !== val), 'todos', 'show', '$start'],
  $$toLS: [arr => localStorage.setItem('todos', JSON.stringify(arr)), 'todos'],
}, (state, props, $, connectAs) => {
  return (
    <div className="todo-app">
      <style dangerouslySetInnerHTML={ { __html: styles } }></style>
      <div>
        <h1>Todos</h1>
        {
          state.shownTodos.map(todo => {
              const props = Object.assign({}, todo, connectAs(todo.id), { key: todo.id });
              return <TodoItem {...props} />;
          })
        }
      </div>
	  <div>
		<input placeholder="What needs to be done?" type="text" value={ state.newInput } onChange={ $('newInput') } onKeyPress={ $("addNewTodo", ifPressed('Enter')) } />
	  </div>
	  { (state.openNumber !== state.todos.length) && <div>
		<a onClick={ $('clear_done') } className="clear-completed">Clear completed</a>
	  </div> }
	  { !!state.todos.length && <div>
		<input type="checkbox" value={ state.openNumber === 0 ? 'on' : 'off' } checked={ state.openNumber === 0 } onClick={ $('toggleCompleted') } />
		Check/uncheck all
	  </div> }
	  { !!state.todos.length && <div>
		Show:
		<ul className="options">
		<li onClick={ $('show', '*') } className={ (state.show === '*') ? 'active' : '' }>
			All
		</li>
		<li onClick={ $('show', false) } className={ (state.show === false) ? 'active' : '' }>
		  Completed
		</li>
		<li onClick={ $('show', true) } className={ (state.show === true) ? 'active' : ''}>
		  Open
		</li>
		</ul>
	  </div> }
	  { !!state.todos.length && <div>
		{ state.openNumber } items left
	  </div> }
    </div>);
});

export default Todos;
