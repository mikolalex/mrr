
# mrr

A funtional reactive programming library for React inspired by [Firera](https://github.com/mikolalex/firera).
Calculate React state fields as computable cells using pure functions.

![nodei.co](https://nodei.co/npm/mrr.png?downloads=true&downloadRank=true&stars=true)


## QuickStart

```js
import React from 'react';
import { withMrr } from 'mrr';

export default withMrr({
  $init: {
  	a: '',
  	b: '',
  },
  c: [(n, m) => {
  	const num = Number(n) + Number(m);
  	return isNaN(num) ? '' : num;
  }, 'a',  'b']
}, (state, props, $) => (
  <div>
  	<input value={ state.a } onChange={ $('a') } />
  	+
  	<input value={ state.b } onChange={ $('b') } />
  	=
  	<input value={ state.c } disabled/>
  </div>
));

```

Mrr adds reactivity to React state: it listens to changes in state(in this case, "a" and "b" properties) and computes dependent properties(like "c" in the example above).
The essence of mrr is in these lines:
```js
c: [(n, m) => {
   const num = Number(n) + Number(m);
   return isNaN(num) ? '' : num;
}, 'a',  'b']
```
Here "c" is computable property, "a" and "b" are "arguments" - parent properties, which are passes as arguments to the "formula" - function (n, m) => ... .
You may add any number of dependent(computable) properties, each dependent property may have any number of arguments(more than 0).

### Asynchronous computing

In most cases, you should use pure functions for calculating computable properties' values and avoid side-effect. But sometimes you may need to make something asynchronous, e.g. ajax request. For this case, use "async" type.
When using 'async' type, the first parameter in function is always callback function, which you should call to return the value for computed property.
```js

withMrr({
  $init: {
	   goods: [],
  },
  goods: ['async', (cb, category) => {
  	fetch('/goods?category=' + category)
  	.then(resp => resp.toJSON())
  	.then(data => cb(data))
  }, 'selectedCategory']
}, (state, props, $) => (
    <div>
        <select value={ state.selectedCategory } onChange={ $('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <ul>
            { state.goods.map(g => <div>{ g.name } { g.price }</div>) }
        </ul>
    </div>
))
```
In $init section we can optionally set initial values for our computed properties(to make our code work before the data is loaded).

A computed property may also depend on other computed property.
```js
withMrr({
  $init: {
  	goods: [],
  	sortByField: 'price',
  },
  all_goods: ['async', (cb, category) => {
  	fetch('/goods?category=' + category)
  	.then(resp => resp.toJSON())
  	.then(data => cb(data))
  }, 'selectedCategory'],
  sortByField: [a => a.toLowerCase(), 'sortBy'],
  goods: [(arr, field) => _.orderBy(arr, [field]), 'all_goods', 'sortByField'],
}, (state, props, $) => (
    <div>
        <select value={ state.selectedCategory } onChange={ $('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <select value={ state.sortBy } onChange={ $('sortBy') }>
            <option>Name</option>
            <option>Price</option>
        </select>
        <ul>
            { state.goods.map(g => <div>{ g.name } { g.price }</div>) }
        </ul>
    </div>
));
```
A "type" in mrr means different way of calculating the value of computed property.
Unlike the Rx approach wich hundred of operators, mrr has only basic 5 types which cover all the cases, and some syntactic sugar.

### $start cell

Sometimes we need to do something only once, when the component in created.
E.g., load the list of goods in the example above.
In this case we can use "$start" property.
```js
    all_goods: ['async', (cb, category) => {
        fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
        .then(data => cb(data))
    }, 'selectedCategory', '$start'],

```
Now our 'all_goods' property will be computed when the "selectedCategory" property changes and when the component is created.
(as the very value of "$start" cell is useless for us, we don't mention it in our arguments' list)

### Nested type

Nested type allows us to put the results of calculation into different "cells". In general it reminds async type - it also receives callback as first argument. The difference is the callback function receives the name of sub-property as the first argument, and it's value as second.
```js
withMrr({
  $init: {
  	goods: [],
  	sortByField: 'price',
  },
  all_goods: ['nested', (cb, category) => {
    cb('loading', true);
    fetch('/goods?category=' + category)
    .then(resp => resp.toJSON())
    .then(data => {
        cb('loading', false);
        cb('data', data);
    })
  }, 'selectedCategory'],
  sortByField: [a => a.toLowerCase(), 'sortBy'],
  goods: [(arr, field) => {
    return _.orderBy(arr || [], [field]);
  }, 'all_goods.data', 'sortByField'],
}, (state, props, $) => (
    <div>
        <select value={ state.selectedCategory } onChange={ $('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <select value={ state.sortBy } onChange={ $('sortBy') }>
            <option>Name</option>
            <option>Price</option>
        </select>
        {
            state['all_goods.loading']
	    ? 	'Loading...'
	    : <ul>
	        { state.goods.map(g => <div>{ g.name } { g.price }</div>) }
	    </ul>
	}
    </div>
));
```
Here "all_goods" property was actually into two "sub-" properties: "loading" and "data".
We update the value of these properties by calling cb(%subproperty%, %value%).
They become accessible to the outer world by the name %property% . %subproperty%, e.g. "all_goods.loading".

### Funnel type

Say we need to display the popup when user clicks "open popup", and close it when he clicks close or "cancel" button.
```js

withMrr({
  $init: {
	   popup_shown: false,
  },
  popup_shown: ['funnel', (cellName, cellValue) => {
  	if(cellName === 'open_popup'){
  	    return true;
  	} else {
  	    return false;
  	}
  }, 'open_popup', 'close_popup', 'cancel']
}, (state, props, $) => (
  <div>
  	{ state.popup_shown && <Popup>
	    <i className="close" onClick={ $('close_popup') } ></i>
	    <form>
    		<button onClick={ $('ok') }>OK</button>
    		<button onClick={ $('cancel') }>Cancel</button>
	    </form>
  	</Popup> }
  	<button onClick={ $('open_popup') }>
  	    Show popup
  	</button>
  </div>
));

```
When using funnel type, your formula function receives only the name and value of property which changed at that moment.
This pattern is very common, and mrr has syntactic sugar for this called "merge":
```js
  popup_shown: ['merge', {
  	'open_popup': true,
  	'close_popup': false,
  	'cancel': confirm('Do you really want to close?'),
  }]
```
Actually, "merge" is not another mrr property type, it's a macros. See "Creating macros" section for more info.

### Closure type

"closure" type allows us to save some data between the formula calls, with the help of... closure.
```js
withMrr({
  $init: {
     click_num: 0,
  },
  click_num: ['closure', () => {
    // this function will be performed only once, when component is created,
    // and should return another function used as formula
    let count = 0;
    return () => {
        // this function will become a formula.
        return ++count;
    }
  }, 'click'],
}, (state, props, $) => (
  <div>
  	<button onClick={ $('click') }>Click me</button>
  	<div> Total: { state.click_num } clicks </div>
  </div>
));
```

When using closure type, we provide a function, that will return another function, which will be used as actual formula. It has an access to local variables of first function.
This is a way to store some data between formula calls safely, without exposing it.

### Combining types

There are 5 property types in mrr: async, nested, funnel, closure, and the default type(used when you don't specify any type). The fact is you can combine them as you like!
```js
// you can combine two or more types by joining them with '.', order is not important
num: ['closure.funnel', () => {
  let num = 0;
  return (cell, val) => {
  	if(cell === 'add'){
  	    num += val;
  	}
  	if(cell === 'subtract'){
  	    num -= val;
  	}
  	return num;
  }
}, 'add', 'subtract']

```
The only exception is you cannot combine "async" and "nested" type, as the second actually includes the first.


### Intercomponent communication

```js
// Todos Component

withMrr({
  $init: {
	   todos: [],
  },
  todos: [(arr, new_item) => {
  	arr.push(new_item);
  	return arr;
  }, '^', 'add_todo/new_todo'],
}, (state, props, $, connectAs) => (
    <div>
        <ul>
            { state.todos.map(todo => <li>{ todo.text }</li>) }
        </ul>
        <AddTodoForm mrrConnect={ connectAs('add_todo') } />
    </div>
));

// AddTodoForm Component

withMrr({
    // returns new todo object when submit is pressed
    new_todo: [(text, submit) => ({text}), 'text', 'submit'],
}, (state, props, $) => (
    <form>
        <input type="text" onChange={ $('text') } />
        <input type="submit" onChange={ $('submit') } />
    </form>
));

```

To subscribe to changes in child component, you should add the property mrrConnect with a value of mrrConnect(%connect_as%)
In this case, we connected AddTodoForm as 'add_todo'.
```js
  todos: [(arr, new_item) => {
  	arr.push(new_item);
  	return arr;
  }, '^', 'add_todo/new_todo'],
```
We are listening to changes in "new_todo" stream in child which was connected as "add_todo".
'^' means the previous value of the very property, in this case an array of todos.

### Passive listening

In fact, this example won't work as expected. Our "new_todo" property of AddTodoForm will be computed each times "text" or "submit" are changed, so that new todo will be created after you enter first character. That happens because we are subscribed to "text" and emit new todo objects each time the "text" changes.
To fix this, we can use passive listening approach.
```js
    new_todo: [(text, submit) => ({text}), '-text', 'submit'],
```
We added a "-" before the name of "text" argument. It means that our property will not be recalculated when the "text" changes. Still it remains accessible in the list of our arguments.
Passive listening allows flexible control over the properties calculation.

### Macros

Macros are functions which transform arbitrary expression to valid mrr expression(one of 5 types).
Using macros can make your code more expressive and robust.
E.g., "merge" macros transforms given object to funnel type.
```js
  popup_shown: ['merge', {
  	'open_popup': true,
  	'close_popup': false,
  	'cancel': false,
  }]
```
is transformed by macros in compile time to something like this:
```js
  popup_shown: ['funnel', (cell, val) => {
    if(...){

    }
    if(...){

    }
  }, 'open_popup', 'close_popup', 'cancel'],
```
There are a number of built-in macros, like "merge", "split", "trigger", "skipN" etc.
Each macros should have unique name and should be a function, which takes some expression and returns valid mrr expression.
You can also add your custom macros by defining \__mrrCustomMacros property of your component.
```js
import { registerMacros } from 'mrr';

registerMacros('promise', ([func, ...args]) => ['async', function(){
  	const cb = arguments[0];
  	const args = Array.prototype.slice.call(arguments, 1);
  	func.apply(null, args).then(cb);
  }, ...args]);
```
Now we can do this code
```js
    all_goods: ['async', (cb, category) => {
        fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
        .then(data => cb(data))
    }, 'selectedCategory', '$start'],

```
slightly more beautiful
```js
    all_goods: ['promise',
    (category) => fetch('/goods?category=' + category).then(resp => resp.toJSON()),
    'selectedCategory', '$start'],

```


## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT
