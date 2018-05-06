import React from 'react';
import { withMrr } from './mrr';


const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;

const isInputValid = a => a.length > 3;
const checkInput = (isValid, text) => isValid && text;


const Input = withMrr((props) => ({
  $init: {
    val: props.defaultValue || '',
  },
  $log: true,
  val: ['merge', {
    setVal: id,
    '~../clear': always(''),
  }],
  'valWithName': [(val, name) => [val, name], 'val', '$name'],
  'validWithName': [(val, name) => [val, name], 'valid', '$name'],
  errorText: [(val, vals, name) => {
    for(let msg in props.errors){
      if(props.errors[msg](val, vals)){
        return msg;
      }
    }
    return false;
  }, 'val', '~../vals', '$name'],
  valid: [not, 'errorText'],
  errorShown: ['merge', {
    '~../submit': true,
    val: false,
  }],
  disabled: [props.disabled || always(false), '../vals', '../valids'],
  hidden: [props.hidden || always(false), '../vals', '../valids'],
}), (state, props, $) => {
  if(state.hidden) return null;
  return ( <div className="my-input">
    { !props.hideLabel && <label>{ props.label || '' }</label> }
    { !props.hideInput && <div className="input" style={ { display: 'inline-block' } }>
      <input disabled={ state.disabled } value={ state.val } type={ props.type } onChange={ $('setVal') } />
    </div> }
    { state.errorShown && <div className="error">
      { state.errorText }
    </div> }
  </div> );
});

const state = () => {
  let state = {};
  return (a) => {
    state = Object.assign({}, state);
    state[a[1]] = a[0];
    return state;
  };
};


export { Input };

export default withMrr({
  $log: true,
  $init: {
    isFormValid: false,
    input: '',
    failedAttempts: 0,
  },
  vals: ['skipSame', ['closure', state, '*/valWithName']],
  valids: ['skipSame', ['closure', state, '*/validWithName']],
}, (state, props, $, connectAs) => {
  return (
    <form>
      <Input
        label="Name"
        type="text" { ...connectAs('name') }
        errors={ {
          'Name too short': (val, vals) => {
            return val.length < 2;
          },
        } }
      />
      <Input type="password" { ...connectAs('pw') }
        label="Password"
        errors={{
          'Empty': not,
        }}
        disabled={ (vals, valids) => !valids || !valids.name }
      />
      <Input type="password" { ...connectAs('pw_rt') }
        label="Retype password"
        errors={{
          'Empty': not,
          'Dont match': (val, vals) => val !== vals.pw,
        }}
        disabled={ (vals, valids) => !valids || !valids.name }
        hidden={
          (vals, valids) => !valids || !valids.pw
        }
      />
    <button onClick={ $('clear') }>Clear</button>&nbsp;&nbsp;&nbsp;
    <button onClick={ $('submit') }>Submit</button>
    </form>
  );
});
