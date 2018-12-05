import React from 'react';

import { withMrr, skip, gridMacros } from './myMrr';

import Element from './Element';
import Input from './Input';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;

const state = () => {
  let state = {};
  return (a) => {
    if(a instanceof Array){
      state = Object.assign({}, state);
      state[a[1]] = a[0];
    } else {
      state = Object.assign({}, state, a || {});
    }
    return state;
  };
};

const propOrSkip = (obj, key) => {
  if(obj){
    return obj[key];
  } else {
    return skip;
  }
}

const renderFields = (state, props, $, connectAs) => {
  const fields = [];
  for(let as in props.fields){
      fields.push([as, props.fields[as]]);
  }

  return fields.map(([as, config]) => {
    const Comp = config.type instanceof Function ? config.type : Input;
    const elProps = Object.assign({ key: as }, config, connectAs(as));
    if(config.type instanceof Function){
      delete elProps.type;
      elProps.isChildForm = true;
    }
    if(!config.type){
      elProps.type = 'text';
    }
    if(props.defaultValue && (props.defaultValue[as] !== undefined)){
      elProps.defaultValue = config.disassemble ? config.disassemble(props.defaultValue[as]) : props.defaultValue[as];
    }
    return <Comp {...elProps}  />
  })
}

const findFirst = obj => {
  for(let v in obj){
    if(obj[v]) return v;
  }
  return false;
}

function isChecked(a){
  for(let k in a){
    if((a[k] === true) || ((a[k] instanceof Object) && isChecked(a[k]))){
      return true;
    }
  }
  return false;
}

const Form = withMrr(props => {
    const struct = {
        $meta: {

        },
        "val": ['closure', state, ['join', '*/valWithName', 'initVal', 'setVal']],
        "valids": ['closure', state, '*/validWithName'],
        "focusedChildren": ['closure', state, '*/focusedWithName'],
        "focused": [findFirst, 'focusedChildren'],
        "checkings": ['closure', state, '*/beingCheckedWithName'],
        "beingChecked": [(a, status) => {
          if(status === 'checking'){
            return true;
          }
          return isChecked(a);
        }, 'checkings', 'status'],
        "controlsDisabled": ['||', 'disabled', props.disableControlsWhenValidated ? 'somethingIsChecked' : skip],
        "inputsDisabled": ['||', 'disabled', props.disableInputsWhenValidated ? 'somethingIsChecked' : skip],
    };
    return gridMacros.skipEqual(struct, {
      val: 'deepEqual',
      valids: true,
      focusedChildren: true,
      focused: true,
      checkings: true,
      beingChecked: true,
      controlsDisabled: true,
      inputsDisabled: true
    });
}, (state, props, $, connectAs) => {
  if(state.hidden) return null;
  if(!props.fields){
    return <div>Please override me!</div>;
  }
  return ( <div className="form">
    { props.label && <div className="form-title">
      { props.label }
    </div> }
    <div className="form-fields">
    {
      renderFields(state, props, $, connectAs)
    }
    </div>
    { state.errorShown && <div className="form-errors">
      { state.currentError }
    </div> }
    { state.currentStep && !props.hideStepsButtons && <div className="form-controls">
        <button className="prevStep" onClick={ $('prevStep') } disabled={ state.controlsDisabled }>Back</button>&nbsp;&nbsp;&nbsp;
        <button className="nextStep" onClick={ $('nextStep') } disabled={ state.controlsDisabled }>Next</button>
    </div>}
    { (state.currentStep === undefined) && !props.isChildForm && <div className="form-controls">
        <button className="clear" onClick={ $('clear') } disabled={ state.controlsDisabled }>Clear</button>&nbsp;&nbsp;&nbsp;
        <button className="submit" onClick={ $('submit') } disabled={ state.controlsDisabled }>Submit</button>
    </div> }
  </div> );
}, Element);

export default Form;
