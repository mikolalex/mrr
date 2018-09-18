
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
Here "c" is computable property - a "cell", "a" and "b" are "arguments" - parent properties, which are passes as arguments to the "formula" - function (n, m) => ... .
You may add any number of dependent(computable) properties, each dependent cell may have any number of arguments(more than 0).

### Asynchronous computing

In most cases, you should use pure functions for calculating computable properties' values and avoid side-effect. But sometimes you may need to make something asynchronous, e.g. ajax request. For this case, use "async" type.
When using 'async' type, the first parameter in function is always callback function, which you should call to return the value for computed property(cell).
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

A cell may also depend on other cell.
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
A "type" in mrr means different way of calculating the value of cell.
Unlike the Rx approach wich hundred of operators, mrr has only basic 5 types which cover all the cases, and some syntactic sugar.

### Special cells

#### $start

Sometimes we need to do something only once, when the component in created.
E.g., load the list of goods in the example above.
In this case we can use "$start" cell.
```js
    all_goods: ['async', (cb, category) => {
        fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
        .then(data => cb(data))
    }, 'selectedCategory', '$start'],

```
Now our 'all_goods' cell will be computed when the "selectedCategory" cell changes and when the component is created.
(as the very value of "$start" cell is useless for us, we don't mention it in our arguments' list)

#### $props

This cell is used when you want to access component's props as a mrr cell.
```js

    fullName: [(name, props) => {
        return name + ' ' + props.surname;
    }, 'name', '$props'],

```
Due to new React API(introduces in React 16.3.0), mrr cannot detect and handle property changes, so "$props" cell will not be fired when some property changes.
That's why "$props" is always a passive cell, see "Passive listening" below.

### Nested type

Nested type allows us to put the results of calculation into different "cells". In general it reminds async type - it also receives callback as first argument. The difference is the callback function receives the name of sub-cell as the first argument, and it's value as second.
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
Here "all_goods" cell was actually into two "sub-" properties: "loading" and "data".
We update the value of these properties by calling cb(%subcell%, %value%).
They become accessible to the outer world by the name %cell% . %subcell%, e.g. "all_goods.loading".

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
When using funnel type, your formula function receives only the name and value of cell which changed at that moment.
This pattern is very common, and mrr has syntactic sugar for this called "merge":
```js
  popup_shown: ['merge', {
  	'open_popup': true,
  	'close_popup': false,
  	'cancel': confirm('Do you really want to close?'),
  }]
```
Actually, "merge" is not another mrr cell type, it's a macros. See "Creating macros" section for more info.

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

There are 5 cell types in mrr: async, nested, funnel, closure, and the default type(used when you don't specify any type). The fact is you can combine them as you like!
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

To subscribe to changes in child component, you should add the mrrConnect property with a value of mrrConnect(%connect_as%)
In this case, we connected AddTodoForm as 'add_todo'.
```js
  todos: [(arr, new_item) => {
  	arr.push(new_item);
  	return arr;
  }, '^', 'add_todo/new_todo'],
```
We are listening to changes in "new_todo" stream in child which was connected as "add_todo".
'^' means the previous value of the very cell, in this case an array of todos.

### Passive listening

In fact, this example won't work as expected. Our "new_todo" cell of AddTodoForm will be computed each times "text" or "submit" are changed, so that new todo will be created after you enter first character. That happens because we are subscribed to "text" and emit new todo objects each time the "text" changes.
To fix this, we can use passive listening approach.
```js
    new_todo: [(text, submit) => ({text}), '-text', 'submit'],
```
We added a "-" before the name of "text" argument. It means that our cell will not be recalculated when the "text" changes. Still it remains accessible in the list of our arguments.
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

## Debugging

```js
{
    // Now all cells' changes will be logged
    $log: true,
    $init: { ... },
    foo: [ ... ],
    bar: [ ... ],
    baz: [ ... ],
}

```

```js
{
    $log: {
        // only "foo" and "bar" cells will be logged
        cells: ['foo', 'bar'],
        // will show the chain of parent cells' changes for each cell
        showStack: true,
    },
    $init: { ... },
    foo: [ ... ],
    bar: [ ... ],
    baz: [ ... ],
}

```

## Built-in macros

#### toggle
Set the value to ***true*** when the first argument is fired, and **false** when the second is fired.
```js
ene: ['toggle', 'bene', 'raba'],
```
```
bene:  --"1"--------------false-------------
raba:  ----------"bar"--------------false---
ene:   --true----false----true------false---
```

#### debounce
```js
foo: ['debounce', 300, 'str'],
```
```
(ms): 0====100====200====300====400====500====600=====700=====
str:  ==="a"==="ab"==="aba"======"abab"==="ababa"==="ababag"==
foo:  =================="aba"========================"ababag"=
```
#### transist
Returns the value of the second argument if the first is truthy and skips if falsy.
```js
make_coffee: ['transist', 'power_enabled', 'start_making_coffee'],
```
```
start_making_coffee:======="1"====="2"====="3"====="4"====="5"====
power_enabled:      =false=============true================false==
make_coffee:        ==================="2"="3"====="4"============
```

#### &&
Equals to
```js
(a, b, ...) => a && b && ...,
```
Accepts any number of arguments.
```js
a: ['&&', 'foo', 'bar', 'baz']
```
```
foo: =1===========false===true=========
bar: =2===null=====================10===
baz: =3=================================
a:   =3===null=====false===null====3====
```

#### ||
Similar to "&&"

#### trigger
Fires **true** when the argument stream receives certain value.
```js
isLucky: ['trigger', 'val', 13],
```
```
val:     ====10====11====12====13=====14=====15===
isLucky: ======================true===============
```

#### skipSame
```js
foo: ['skipSame', 'bar'],
```
```
bar: ==1=====2=====2====3=====2=====1====="1"==="1"===
foo: ==1=====2==========3=====2=====1====="1"=========
```

#### turnsFromTo
Fires when the value of the argument changes from "a" to "b"
```js
foo: ['turnsFromTo', 5, 6, 'val']
```
```
val: ==1===2===3===4===5===6===7===6===5===4===
foo: ======================true================
```

#### skipN
Omit first **n** signals
```js
foo: ['skipN', 'bar', 3],
```
```
bar: =="a"==="b"==="c"==="d"==="e"==="f"==="g"===
foo: ===================="d"==="e"==="f"==="g"===
```

#### accum
Accumulates the values of the stream into array
```js
foo: ['accum', 'bar'],
```
```
bar: =1======2========3========4===========4=============
foo: =[1]====[1,2]===[1,2,3]===[1,2,3,4]===[1,2,3,4,4]===
```
Possibly accepts the third argument - an interval(in ms) a value will be stored
```js
foo: ['accum', 'bar', 200],
```
```
ms:  =0========100========200========300========400=========500====
bar: =1======2===========================5=========================
foo: =[1]====[1,2]========[2]======[]====[5]====================[]=
```


## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT
