import React from 'react';
import { withMrr, skip, gridMacros } from './myMrr';
import Element, { getValidationFunc } from './Element';
import Form from './Form';


const arrState = (a, prev) => {
  let state = prev ? prev.slice() : [];
  state[a[1]] = a[0];
  return state;
};

export default withMrr(props => gridMacros.skipEqual({
    length: [val => val.length, 'val'],
    '+hideErrors': 'length',
    "val": ['merge', {
        //initVal: a => a,
        '*/valWithName': (val, prev) => {
          let state = prev ? prev.slice() : [];
          state[val[1]] = val[0];
          return state;
        },
        incr: (_, prev) => {
            return [...prev, {}];
        },
        decr: (_, prev) => {
            return prev.slice(0, prev.length - 1);
        },
        setVal: a => a,
    }, '-val'],
    "valids": ['skipSame', [arrState, '*/validWithName', '^']],
    validation: ['nested', getValidationFunc(props), 'val', '../val', 'valids', 'length', 'submit', '$start'],
}, {
  val: 'deepEqual',
  valids: true,
}), (state, props, $, connectAs) => {
    if(state.hidden) return null;
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
    { !props.fixedLength && <div>
        <button onClick={ $('incr') }>+</button>&nbsp;&nbsp;&nbsp;
        <button onClick={ $('decr') }>-</button>
    </div> }
    </div> );
}, Element)
