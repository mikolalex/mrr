
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

Mrr also includes some handy methods in mrr which make changing state easier:
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
toState() method set's the value of e.target.value to the specified property of state. So, you don't need to create specific methods, bind them etc. It's common to use toState in mrr for most of event handlers, as we need only to set the value to state, the rest mrr will do for us.

### Asynchronous computing

In most cases, you should use pure functions for calculating computable properties' values and avoid side-effect. But sometimes you may need to make something aynchronous, e.g. ajax request. For this case, use "async" type.
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
}
```
Now our 'all_goods' property will be computed when the "selectedCategory" property changes and when the component is created.
(as the value of "$start" cell is useless for us, we don't mention it in our arguments' list) 


## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT
