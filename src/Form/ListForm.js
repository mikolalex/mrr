import React from 'react';
import { withMrr, skip } from './myMrr';
import Element, { getValidationFunc } from './Element';
import Form from './Form';


const arrState = (a, prev) => {
  let state = prev ? prev.slice() : [];
  state[a[1]] = a[0];
  return state;
};

export default withMrr(props => ({
    $init: {
        length: 1,
    },
    length: ['merge', {
        incr: (_, prev) => prev + 1,
        decr: (_, prev) => prev - 1 || 1,
        initVal: vals => vals ? vals.length : skip,
    }, '^'],
    '+hideErrors': 'length',
    "=val": ['closure.funnel', (init) => {
      let prev = init || [];
      return (cell, val) => {
        if(cell === 'initVal'){
          prev = val;
        } else {
          let state = prev.slice();
          state[val[1]] = val[0];
          prev = state;

        }
        return prev;
      }
    }, '*/valWithName', 'initVal'],
    "=valids": ['skipSame', [arrState, '*/validWithName', '^']],
    validation: ['nested', getValidationFunc(props), 'val', '../val', 'valids', 'length', 'submit', '$start'],
}), (state, props, $, connectAs) => {
    const arr = new Array(state.length).fill(true);
    const Child = props.child || Form;
    return ( <div>
    { arr.map((_, i) => {
      const childProps = Object.assign({ isChildForm: true }, connectAs(i), props.childProps || {});
      if(props.defaultValue && props.defaultValue[i] !== undefined){
        childProps.defaultValue = props.defaultValue[i];
      }
      return ( <div>
        <Child { ...childProps }/>
      </div>);
    }) }
    { state.errorShown && <div className="error">
      { state.currentError }
    </div> }
    <div>
        <button onClick={ $('incr') }>+</button>&nbsp;&nbsp;&nbsp;
        <button onClick={ $('decr') }>-</button>
    </div>
    </div> );
}, Element)
