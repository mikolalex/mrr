# mrr

A funtional reactive programming library for React in [Firera](https://github.com/mikolalex/firera) style.
Calculate react state fields as computable cells using pure functions.

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
	}
    get computed(){
        return {
			// initial values of cells
            $init: {
                a: 0,
				b: 0
            },
			// computed cells
            c: [
				// funtion for calculating cell value
				(n, m) => { 
					const num = Number(n) + Number(m);
					return isNaN(num) ? '' : num;
				}, 
				// list of parent cells, which will be used as arguments
				'a', 
				'b'
			]
        }
    }
    render() {
		// .toState(key, [val]) is used to set the value to state by key,
		// in case of "input" - it's value
        return <div>
            <input onChange={ this.toState('a') } />
            +
            <input onChange={ this.toState('b') } />
            =
            <input value={ this.state.c } disabled/>
        </div>
    }
}
```

## Author

[Mykola Oleksiienko](https://github.com/mikolalex/)

## License

 - **MIT** : http://opensource.org/licenses/MIT
