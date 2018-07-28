import React from 'react';
import { withMrr, skip } from '../';
import Element from './Element';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;

const skipSame = func => function(prev, ...args){
    const new_val = func.apply(null, args);
    if(new_val === prev){
        return skip;
    } else {
        //console.log('SETTING NEW VAL!', new_val);
        return new_val;
    }
}

export default withMrr((props) => {
  const struct = {
    $init: {
      val: '',
    },
    '+val': ['merge', {
      setVal: props.filter ? (val => props.filter(val) ? val : skip ) : id,
      '~../clear': always(''),
    }],
  }
  if(props.getOptions){
    struct.getOptions = props.getOptions;
  }
  return struct;
}, (state, props, $) => {
  if(state.hidden) return null;
  let options;
  if(props.type === 'select'){
    if(props.options){
      options = props.options;
    } else {
      if(props.getOptions){
        options = state.getOptions;
      }
    }
    if(!options) options = [];
  }
  const elProps = {
    onFocus: $('focused', true),
    onBlur: $('focused', false),
    onChange: $('setVal'),
    value: state.val,
    disabled: !!state.disabled,
    name: state.$name,
  };
  return ( <div className="my-input">
    { !props.hideLabel && <label>{ props.label || '' }</label> }
    { !props.hideInput && <div className="input" style={ { display: 'inline-block' } }>
      { props.type === 'select' && 
        <select {...elProps}>
        <option></option>
        { options.map(a => <option key={ a }>{ a }</option>) }
        </select> }
      {
        props.type !== 'select' && 
        <input {...elProps}/>
      }
    </div> }
    { state.errorShown && <div className="error">
      { state.currentError }
    </div> }
  </div> );
}, Element);
