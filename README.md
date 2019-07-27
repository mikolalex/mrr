
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


### Using hooks

The same can be done using hooks:

```js
import React from 'react';
import userMrr from 'mrr/hooks';

const myComponent = props => {

    const [state, $] = useMrr(props, {
        $init: {
              a: '',
              b: '',
        },
        c: [(n, m) => {
              const num = Number(n) + Number(m);
              return isNaN(num) ? '' : num;
        }, 'a',  'b']
    });

    return <div>
        <input value={ state.a } onChange={ $('a') } />
        +
        <input value={ state.b } onChange={ $('b') } />
        =
        <input value={ state.c } disabled/>
    </div>;

};

```


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

#### $end

Opposite to $start. Runs on componentWillUnmount.

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
Actually, "merge" is not another mrr cell type, it's an operator. See "Creating operators" section for more info.

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

### "skip" value

Each time a cell is updated, mrr recalculates it's dependent cells. However, in many cases we need a way to cancel further updates.
To do this, you should return special "skip" value from your formula.
```js
import { withMrr, skip } from 'mrr';

{
    odd: [a => a % 2 ? a : skip, 'numbers'],
    odd_numbers: ['accum', 'odd'],
}
```
This value is helpful for all kinds of filtering. It's internally used in such operators as "skipSame", "trigger", "transist" etc.

### Operators

Operators(also referred as macros) are functions which transform arbitrary expression into valid mrr expression(one of 5 types).
Using operator can make your code more expressive and robust.
E.g., "merge" operator transforms given object to funnel type.
```js
  popup_shown: ['merge', {
  	'open_popup': true,
  	'close_popup': false,
  	'cancel': false,
  }]
```
is transformed by operator in compile time to something like this:
```js
  popup_shown: ['funnel', (cell, val) => {
    if(...){

    }
    if(...){

    }
  }, 'open_popup', 'close_popup', 'cancel'],
```
There are a number of built-in operator, like "merge", "split", "trigger", "skipN" etc.
Each operator should have unique name and should be a function, which takes some expression and returns valid mrr expression.
You can also add your custom operator by defining \__mrrCustomMacros property of your component.
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

## Linking
Linking streams between components is a crucial part of mrr. You can listen to streams from other components: children or parent. There are number of ways to do it.
```js

// component A

{
    foo: [() => { ... }, 'my_child/bar'],
}, () => {
    <div>
        <B {...connectAs('my_child')} />
    </div>
}

// component B
{
    bar: [() => { ... }, '$start'],
}

```
When you connect any child component, you should point it's name. Than you can refer to it's streams as "%child_component_name%/%child_component_stream%". There is also an option for listening for all children:
```js

// component A

{
    foo: [() => { ... }, '*/bar'],
}, () => {
    <div>
        <B {...connectAs('my_child1')} />
        <B {...connectAs('my_child2')} />
        <B {...connectAs('my_child3')} />
    </div>
}

// component B
{
    bar: [() => { ... }, '$start'],
}
```
from parent using "../":
```js

// component A

{
    foo: [() => { ... }, '$start'],
}, () => {
    <div>
        <A {...connectAs('my_child')} />
    </div>
}

// component B
{
    bar: [() => { ... }, '../foo'],
}
```
You cannot use more than one slash in name, i.e. "foo/bar/baz" or "../a/b" are invalid names.

Another way is to link with "connectAs()" function.
```js

// component A

{
    foo: [() => { ... }, 'bar'],
}, () => {
    <div>
        <B {...connectAs('my_child', ['bar'])} />
    </div>
}

// component B
{
    bar: [() => { ... }, '$start'],
}
```
We pass an array to "connectAs" function, which describes the matching between parent and child streams. We also may use object, if the names are different:
```js

// component A

{
    foo: [() => { ... }, 'baz'],
}, () => {
    <div>
        <B {...connectAs('my_child', { baz: 'bar'})} />
    </div>
}

// component B
{
    bar: [() => { ... }, '$start'],
}
```
We also may link streams in the opposite direction: from parent to child, passing the third argument to "connectAs":
```js

// component A

{
    foo: [() => { ... }, 'baz'],
    a: [() => { ... }, '$start'],
}, () => {
    <div>
        <B {...connectAs('my_child', { baz: 'bar'}, ['a'])} />
    </div>
}

// component B
{
    bar: [() => { ... }, '$start'],
    b: [() => { ... }, 'a']
}
```


## Error handling

Sometimes errors might appear within the calculation
```js
{
    
    a: [() => 42, '$start'],
    b: [a => a(), 'a'], // TypeError: a is not a function
}

```
You can handle them by subscribing to special cell of $err.%cellname%, where cellname is a name of cell where error happened.
```js
{
    
    a: [() => 42, '$start'],
    b: [a => a(), 'a'],
    showError: [(e) => 'Some error happened: ' + e.message, '$err.b'],
}

```
If there are no subscribers to special $err.%cellname% cell, the error will be put into general $err cell
```js
{
    a: [() => 42, '$start'],
    b: [a => a(), 'a'],
    c: [a => a.slice(), 'a'],
    // all errors will be put into $err cell
    showError: [(e) => 'Some error happened: ' + e.message, '$err'],
}
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

## Reliability

As mrr uses strings as variables, it's easy to make a typo and break the code.
```js
{   
    bar: [() => { ... }, 'some_click'],
    foo: [() => { ... }, 'baz'], // a typo, "foo" will never be computed
}
```
To fight this, you should specify the list of streams which are read from DOM. Thereby mrr would be able to analyze your code and find broken linking.
It's done with special $readFromDOM field.
```js
{
    $readFromDOM: ['some_click', 'another_click', ...],
    bar: [() => { ... }, 'some_click'],
    foo: [() => { ... }, 'baz'], // throws error
}
```
Now mrr knows that "baz" is not read from DOM and it's not defined as a stream also, so it's probably a typo, and throws an error.

## Basic types: closure, funnel, nested, async

#### closure

Runs a function on component init, which should return another function used as formula.

```js
vals: ['closure', () => {
	// this function would be run once the component is initialized
	const vals = [];
	return val => {
		// this function would become a formula
		vals.push(vul);
		return vals;
	}
}, 'some_cell'],

```

#### funnel

Allows to listen to each stream independently, receiving the name of stream and it's value when it changes.
```js

popup_state: ['funnel', (cell, val) => {
	if(cell === 'open_popup'){
		return true;
	} else {
		return false;
	}
}, 'open_popup', 'close_popup', 'close_everything'],

```


#### async

Allows to run async computations. To yield a result, call a callback function always passed as a first argument to a formula.


```js

user_data: ['async', (cb, uid) => {
	fetch('/user/' + uid).then(res => res.toJSON()).then(cb);
}, 'user_id'],

```
```js
timer: ['async', (cb) => {
	setInterval(cb, 100);
}, '$start']

```

#### nested

Allows to "put" the results of computation into different subcells. Callback function is always passed as a first argument to a formula. It accepts the name of subcell you want 
to put in and the value, or the object where keys/values represent names of subcells and their values.

```js
user_req: ['nested', (cb, uid) => {
	cb('loading', true);

	fetch('/user/' + uid)
	.then(res => res.toJSON())
	.then(data => cb({
		data,
		loading: false,
	}))
	.catch(error => cb({
		error,
		loading: false,
	}));
}, 'user_id'],

// use subcells just like any other cell

error: ['merge', 'some_error', 'user_req.error'],
user_data: [() => { ... }, 'user_req.data'],
show_spinner: 'user_req.loading',


```

### Combining basic types

These four basic types(nested, funnel, closure, async) can be used together.
You may mix two of them, separated by dot.
```js
//  perform request for each element in a stream, but limited to 5 requests simultaneously.
req: ['async.closure', () => {
	const queue = [];
	let counter = 0;
	const max_requests = 5;
	const make_request = data => fetch('/data/' + data).then(res => res.toJSON());
	return function check(cb, data){
		if(counter < max_requests){
			++counter;
			make_request.then(cb).finally(() => {
				--counter;
				if(queue.length){
					check(cb, queue.shift());
				}
			})
		} else {
			queue.push(data);
		}
	}
}, 'data']

```
Even three:
```js

timer: ['async.closure.funnel', () => {
	let timer;
	return (cb, cell, val) => {
		if(cell === 'start_timer'){
			timer = setInterval(cb, 100);
		}
		if(cell === 'stop_timer'){
			clearInterval(timer);
		}
	}
}, 'start_timer', 'stop_timer'],

```
The only two types you cannot combine together are "async" and "nested", as the second includes the first by design.
Combination is possible for these basic types, macros(operators) cannot be combined.

## Simple mrr wrapper

allows to use mrr grids outside react: e.g. in vanilla JS projects or for testing.

```
import { simpleWrapper } from 'mrr';

const grid = simpleWrapper({
  $init: {
  	a: '',
  	b: '',
  },
  d: [(n, m, k) => {
  	const num = Number(n) + Number(m) + (k || 0);
  	return isNaN(num) ? '' : num;
  }, 'a',  'b', 'c']
});

// put some value to a cell
grid.set('a', 10);

// get cell value
grid.get('d'); // ''

grid.set('b', 20);
grid.get('d'); // 30

// listen to cell changes
grid.onChange('d', (val) => console.log('Now d = ' + val));

grid.set('b', 32); // 'Now d = 42'

// and even connect other children!

const child = grid.connect({
    val: [() => 58, '$start'],
}, 'foo', { c: val });

// 'Now d = 100'

```

## Advanced system cells

#### $state 

Return the current mrr state - i.e. the object containing all cells values.
```js
import React from 'react';
import userMrr from 'mrr/hooks';

const myComponent = () => {

    const [state, $] = useMrr({
        $init: {
              a: '',
              b: '',
        },
        c: [(n, m) => {
              const num = Number(n) + Number(m);
              return isNaN(num) ? '' : num;
        }, 'a',  'b'],
        foo: [({a, b, c}) => {
            console.log('Current state: b =', b, ', c =', c);
        }, '$state', 'c'], 
    });

    return <div>
        <input value={ state.a } onChange={ $('a') } />
        +
        <input value={ state.b } onChange={ $('b') } />
        =
        <input value={ state.c } disabled/>
    </div>;

};

```
$state is passive by default(see "passive listening" section). It means, you need to subscribe to at least one more cell along with "$state".

#### $name

Return the name of the grid if it's connected as a child to another grid, otherwise(for root grids) returns undefined.
Passive.

```js
const Foo = () => {
    const [state, $] = useMrr({
        gridName: [a => a, '$name', '$start'],
    });
    return <div>
        My name is { state.gridName }
    </div>;
};

//

<Foo {...connectAs('child1') />

// outputs "My name is child1"

```

#### $async

Adds callback for returning a value, as if "async" type is used.
```js
  goods: ['async', (cb, category) => {
  	fetch('/goods?category=' + category)
  	.then(resp => resp.toJSON())
  	.then(data => cb(data))
  }, 'selectedCategory']
```
is equal to
```js
  goods: [(cb, category) => {
  	fetch('/goods?category=' + category)
  	.then(resp => resp.toJSON())
  	.then(data => cb(data))
  }, '$async', 'selectedCategory']

```
It can be placed in any order:
```js
  // the same
  goods: [(category, cb) => {
  	fetch('/goods?category=' + category)
  	.then(resp => resp.toJSON())
  	.then(data => cb(data))
  }, 'selectedCategory', '$async']

```

#### $nested

Adds callback for returning a value to a subcell, as if "nested" type is used.

```js
  all_goods: ['nested', (cb, category) => {
    cb('loading', true);
    fetch('/goods?category=' + category)
    .then(resp => resp.toJSON())
    .then(data => {
        cb('loading', false);
        cb('data', data);
    })
  }, 'selectedCategory'],

```
is equal to
```js
  all_goods: [(cb, category) => {
    cb('loading', true);
    fetch('/goods?category=' + category)
    .then(resp => resp.toJSON())
    .then(data => {
        cb('loading', false);
        cb('data', data);
    })
  }, '$nested', 'selectedCategory'],
```

#### $changedCellName

Returns the name of the exact parent cell, which caused the recalculation.
(Similar to "funnel" type).
```js

import { simpleWrapper } from 'mrr';

const foo = simpleWrapper({
    popup_state: [(cell) => {
        return cell === 'open_popup';        
    }, '$changedCellName', 'open_popup', 'close_popup'],
});

foo.set('open_popup', true);
foo.get('popup_state'); // true

foo.set('close_popup', true);
foo.get('popup_state'); // false

```

## Built-in operators

#### merge
Joins the streams
```js
quinter: ['merge', 'ene', 'bene', 'raba'],
```
```
ene:     ----------------------------3------------
bene:    --"1"--------------false-----------------
raba:    ----------"bar"------------------false---
quinter: --"1"-----"bar"----false----3----false---
```

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

#### remember
Stores the value of input cell for specified time. May accept an optional default value.
```js
foo: ['remember', 'bar', 100/* time in ms*/, 'N/A'/* default value */],
```
```
bar: =1==================3=====4==========================5=====
foo: =1==========N/A=====3=====4==========N/A=============5=====
```

## Moving away from strings

Using string constants is a good idea to make your coding proccess more relaxed.
```js
{
    a: [() => 42, '$start'],
    b: [a => a + 10, 'a'],
    c: ['promise', () => new Promise(res => setTimeout(res, 1000)), 'a'],
    d: ['merge', 'c', 'b', '-a'],
    foo: [a => a + 1, '*/bar'],
}
```
is transformed into
```js
import { withMrr } from 'mrr';
import { cell, $start$, passive } from 'mrr/cell';
import { promise, merge } from 'mrr/operators';

const a$ = cell('a');
const b$ = cell('b');
const c$ = cell('c');
const d$ = cell('d');
const foo$ = cell('foo');

const bar$ = cell('bar');

{
    [a$]: [() => 42, $start$],
    [b$]: [a => a + 10, a$],
    [c$]: promise(() => new Promise(res => setTimeout(res, 1000)), a$),
    [d$]: merge(c$, b$, passive(a$)),
    [foo$]: [a => a + 1, children(bar$)],
}
```
You should create a cell name constant with cell() function.
Each operator has it's functional match, imported from 'mrr/operators'.
System cells, such as "$start", "$end", "$changedCellName" are imported from 'mrr/cell'.
The same goes for passive listening.




## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT
