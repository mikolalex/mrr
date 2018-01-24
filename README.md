
# mrr

A funtional reactive programming library for React inspired by [Firera](https://github.com/mikolalex/firera).
Calculate React state fields as computable cells using pure functions.

![nodei.co](https://nodei.co/npm/mrr.png?downloads=true&downloadRank=true&stars=true)


## QuickStart

```js
import mrr from 'mrr';
import React from 'react';

export default class Foo extends mrr {
    constructor(props, context){
        super(props, context);
        
        // need to do this to set initial values from "computed"
        this.state = this.initialState;
        
        this.setA = this.setA.bind(this);
        this.setB = this.setB.bind(this);
    }
    setA(e){
	this.setState({a: e.target.value})
    }
    setB(e){
        this.setState({b: e.target.value})
    }
    get computed(){
        return {
            c: [(n, m) => { 
                const num = Number(n) + Number(m);
                return isNaN(num) ? '' : num;
            }, 'a',  'b']
        }
    }
    render() {
        return <div>
            <input onChange={ this.setA } />
            +
            <input onChange={ this.setB } />
            =
            <input value={ this.state.c } disabled/>
        </div>
    }
}
```

Mrr adds reactivity to React state: it listens to changes in state(in this case, "a" and "b" properties) and computes dependent properties(like "c" in the example above). 
The essence of mrr is in these lines:
```js
c: [(n, m) => { 
   const num = Number(n) + Number(m);
   return isNaN(num) ? '' : num;
}, 'a',  'b']
```
Here "c" is computable property, "a" and "b" are "arguments" - parent properties, which are passes as arguments to the "formula" - function (n, m) => ... . You don't need to invoke this manually: mrr overrides React's setState() method and recalculates computed properties each time any of it's parent properties changes.
You may add any number of dependent(computable) properties, each dependent property may have any number of arguments(more than 0).

### Event handling helpers

Mrr includes some helpers which make changing state easier:
```jsx
    render() {
        return <div>
            <input onChange={ this.toState('a') } />
            +
            <input onChange={ this.toState('b') } />
            =
            <input value={ this.state.c } disabled/>
        </div>
    }
```
toState() method creates(and memoizes!) handler which set's the value of e.target.value to the specified property of state. Therefore you don't need to create specific methods, bind them etc. It's common to use toState in mrr for most of event handlers, as we need only to set the value to state, the further calculations will be done in computed cells.

### Asynchronous computing

In most cases, you should use pure functions for calculating computable properties' values and avoid side-effect. But sometimes you may need to make something asynchronous, e.g. ajax request. For this case, use "async" type.
When using 'async' type, the first parameter in function is always callback function, which you should call to return the value for computed property.
```jsx
get computed(){
    return {
        $init: {
            goods: [],
        },
        goods: ['async', (cb, category) => {
            fetch('/goods?category=' + category)
            .then(resp => resp.toJSON())
            .then(data => cb(data))
        }, 'selectedCategory']
    }
}
render(){
    return <div>
        <select onChange={ this.toState('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <ul>
            { this.state.goods.map(g => <div>{ g.name } { g.price }</div>) }
        </ul>
    </div>
}
```
In $init section we can optionally set initial values for our computed properties(to make our code work before the data is loaded).

A computed property may also depend on other computed property.
```jsx
get computed(){
	return {
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
        goods: [(arr, field) => {
            return _.orderBy(arr, [field]);
        }, 'all_goods', 'sortByField'],
    }
}
render(){
    return <div>
        <select onChange={ this.toState('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <select onChange={ this.toState('sortBy') }>
            <option>Name</option>
            <option>Price</option>
        </select>
        <ul>
            { this.state.goods.map(g => <div>{ g.name } { g.price }</div>) }
        </ul>
    </div>
}
```
A "type" in mrr means different way of calculating the value of computed property.
Unlike the Rx approach wich hundred of operators, mrr has only 5 types which cover all the cases. 

### $start cell

Sometimes we need to do something only once, when the component in created.
E.g., load the list of goods in the example above.
In this case we can use "$start" property.
```jsx
    all_goods: ['async', (cb, category) => {
        fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
        .then(data => cb(data))
    }, 'selectedCategory', '$start],

```
Now our 'all_goods' property will be computed when the "selectedCategory" property changes and when the component is created.
(as the very value of "$start" cell is useless for us, we don't mention it in our arguments' list) 

### Nested type

Nested type allows us to put the results of calculation into different "cells". In general it reminds async type - it also receives callback as first argument. The difference is the callback function receives the name of sub-property as the first argument, and it's value as second.
```jsx
get computed(){
	return {
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
    }
}
render(){
    return <div>
        <select onChange={ this.toState('selectedCategory') }>
            <option>Cars</option>
            <option>Electronics</option>
            <option>Audio</option>
        </select>
        <select onChange={ this.toState('sortBy') }>
            <option>Name</option>
            <option>Price</option>
        </select>
        { 
            this.state['all_goods.loading'] 
	    ? 	'Loading...' 
	    : <ul>
	        { this.state.goods.map(g => <div>{ g.name } { g.price }</div>) }
	    </ul>
	}
    </div>
}
```
Here "all_goods" property was actually into two "sub-" properties: "loading" and "data".
We update the value of these properties by calling cb(%subproperty%, %value%).
They become accessible to the outer world by the name %property% . %subproperty%, e.g. "all_goods.loading".

### Funnel type

Say we need to display the popup when user clicks "open popup", and close it when he clicks close or "cancel" button.
```jsx

get computed(){
    return {
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
    }
}
render(){

    return <div>
	{ this.state.popup_shown && <Popup>
	    <i className="close" onClick={ this.toState('close_popup') } ></i>
	    <form>
		<button onClick={ this.toState('ok') }>OK</button>
		<button onClick={ this.toState('cancel') }>Cancel</button>
	    </form>
	</Popup> }
	<button onClick={ this.toState('open_popup') }>
	    Show popup
	</button>
    </div>

}

```
When using funnel type, your formula function receives only the name and value of property which changed at that moment.
This pattern is very common, and mrr has syntactic sugar for this called "map":
```jsx
    popup_shown: ['map', {
	'open_popup': true,
	'close_popup': false,
	'cancel': false,
    }]
```
"Map" is not another mrr property type, it's a macros. See "Creating macros" section for more info.

### Closure type

"closure" type allows us to save some values between the formula calls, with the help of... closure.
```jsx
get computed(){
    return {
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
    }
}
render(){
    <div>
	<button onClick={ this.toState('click') }>Click me</button>
	<div> Total: { this.state.click_num } clicks </div>
    </div>
    
}
```
When using closure type, we provide a function, that will return another function, which will be used as actual formula. It has an access to local variables of first function.
This is a way to store some data between formula calls safely, without exposing it.

### Combining types

There are 5 property types in mrr: async, nested, funnel, closure, and the default type(used when you don't specify any type). The fact is you can combine them as you like!
```jsx
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

```jsx
// Todos Component

get computed(){
    return {
        $init: {
            todos: [],
        },
	todos: [(arr, new_item) => { 
            arr.push(new_item);
            return arr;
        }, '^', 'add_todo/new_todo'],
    }
}

render(){
    return <div>
        <ul>
            { this.state.todos.map(todo => <li>{ todo.text }</li>) }
        </ul>
        <AddTodoForm mrrConnect={ this.mrrConnect('add_todo') } />
    </div>
}

// AddTodoForm Component

get computed(){
    return {
        // returns new todo object when submit is pressed
        new_todo: [(text, submit) => ({text}), 'text', 'submit'],
    }
}

render(){
    return <form>
        <input type="text" onChange={ this.toState('text') } />
        <input type="submit" onChange={ this.toState('submit') } />
    </form>
}
```

You can subscribe to changes in child component, you should add the property mrrConnect with a value of this.mrrConnect(%connect_as%)
In this case, we connected AddTodoForm as 'add_todo'. 
```jsx
    todos: [(arr, new_item) => { 
	arr.push(new_item);
	return arr;
    }, '^', 'add_todo/new_todo'],
```
We are listening to changes in "new_todo" property in child which was connected as "add_todo".
'^' means the previous value of the very property, in this case an array of todos.

### Passive listening

In fact, this example won't work as expected. Our "new_todo" property of AddTodoForm will be computed each times "text" or "submit" are changed, so that new todo will be created after you enter first character. That happens because we are subscribed to "text" and emit new todo objects each time the "text" changes.
To fix this, we can use passive listening approach.
```jsx
    new_todo: [(text, submit) => ({text}), '-text', 'submit'],
```
We added a "-" before the name of "text" argument. It means that our property will not be recalculated when the "text" changes. Still it remains accessible in the list of our arguments.
Passive listening allows flexible control over the state.

### Macros

Macros are functions which transform arbitrary expression to valid mrr expression(one of 5 types).
Using macros can make your code more expressive and robust.
E.g., "map" macros transforms given object to funnel type.
```js
    popup_shown: ['map', {
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
There are a number of built-in macros, like "map", "trigger", "skipN" etc.
You can also add your custom macros by defining __mrrCustomMacros property of your component.
Each macros should have unique name and should be a function, which takes some expression and returns valid mrr expression.
```js
get __mrrCustomMacros(){
    return {
	promise: ([func, ...args]) => {
	    return ['async', function(){
		const cb = arguments[0];
		const args = Array.prototype.slice.call(arguments, 1);
		func.apply(null, args).then(cb);
	    }, ...args];
	}
    }
}
```
We can do this code
```js
    all_goods: ['async', (cb, category) => {
        fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
        .then(data => cb(data))
    }, 'selectedCategory', '$start'],

```
slightly more beautiful
```
    all_goods: ['promise', (category) => {
        return fetch('/goods?category=' + category)
        .then(resp => resp.toJSON())
    }, 'selectedCategory', '$start'],

```


## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT

