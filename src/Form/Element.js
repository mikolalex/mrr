import React from 'react';
import { withMrr, skip, gridMacros } from './myMrr';


const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;
const propOrSkip = (obj, key) => {
  if(obj){
    console.log("RET", obj, key);
    return obj[key];
  } else {
    console.log('SKIP', key);
    return skip;
  }
}
const skipSame = func => function(prev, ...args){
    const new_val = func.apply(null, args);
    if(new_val === prev){
        return skip;
    } else {
        //console.log('SETTING NEW VAL!', new_val);
        return new_val;
    }
}

const toArray = function(){
  return Array.prototype.slice.call(arguments, 0);
}

const nextTick = (func) => {
  setTimeout(func, 1);
}

const isPromise = a => a && a.constructor && a.constructor.name === 'Promise';

const getValidationFunc = props => (cb, val, vals, valids, num) => {
  if(!props.errors){
    return;
  }
  const promises = [];
  for(let msg in props.errors){
    const res = props.errors[msg](val, vals, valids, num);
    if(isPromise(res)){
      promises.push([res, msg]);
    } else {
      if(res){
        cb('error', msg);
        return;
      }
    }
  }
  if(promises.length){
    cb('clearErrors', true);
    cb('checking', true);
    Promise.all(promises.map(p => p[0])).then(results => {
      for(let k in results){
        if(results[k]){
          cb('checking', false);
          cb('error', promises[k][1]);
          return;
        }
      }
      cb('checking', false);
      cb('success', true);
      return;
    })
  } else {
    cb('success', true);
  }
};

export { getValidationFunc }

export default withMrr((props) => {
  const valPrefix = props.validateOnlyAfterSubmit ? '-' : '';
  const struct = {
    $init: {
        status: props.errors ? 'unknown' : 'valid',
    },
    'initVal': [(parent, name) => {
      if(parent && (parent[name] !== undefined)){
        return props.disassemble ? props.disassemble(parent[name]) : parent[name];
      } else {
        if(props.defaultValue){
          return props.defaultValue;
        } else {
          return skip;
        }
      }
    }, '-../val', '$name', '$start'],
    'setVal': [(name, parent) => {
      if(parent && (parent[name] !== undefined)){
        return props.disassemble ? props.disassemble(parent[name]) : parent[name];
      } else {
        return skip;
      }
    }, '$name', '../setVal'],
    'val': ['merge', 'initVal', 'setVal'],
    'clear': '../clear',
    'focusedWithName': [(val, name) => [val, name], 'focused', '$name'], 
    'valWithName': [(val, name) => [props.assemble ? props.assemble(val) : val, name], 'val', '$name'],
    'beingCheckedWithName': [(beingChecked, name) => [beingChecked, name], 'beingChecked', '$name'],
    'beingChecked': [status => status === 'checking', 'status'],
    'somethingIsChecked': ['||', '../somethingIsChecked', 'beingChecked'],
    //'validWithName': [(status, name) => [status === 'valid', name]
    'validWithName': [(status, name) => {
      if(status === 'checking'){
        return ['checking', name];
      }
      if(status === 'valid'){
        return [true, name];
      }
      if(status === 'invalid'){
        return [false, name];
      }
      return skip;
    }, 'status', '$name'],
    'orderWithName': [(props, name) => [props.order, name], '-$props', '$name', '$start'],
    otherVals: '../val',
    needsRevalidation: ['merge', {
        val: true,
        'validation.error': false,
        'validation.success': false,
    }],
    validation: ['nested', 
      getValidationFunc(props), 
      valPrefix + 'val', '-otherVals', valPrefix + 'valids', ['transist', '-needsRevalidation', 'submit'], valPrefix + '$start'
      //, props.validateOnlyAfterSubmit ? skip : ['skipIf', not, '-submit', ['join', '../vals', 'val']]
    ],
    "submit": ['skipIf', a => a, '-hidden', '../submit'],
    "status": ['merge', {
        'validation.checking': a => a ? 'checking' : skip,
        'validation.error': 'invalid',
        'validation.success': 'valid',
      }
    ],
    "currentError": ['merge', {
      'validation.error': id,
      'validation.success': '',
      'validation.clearErrors': '',
      //'val': '',
    }],
    "canShowErrors": ['toggle', 'submit', ['join', 'val', ['turnsFromTo', true, false, 'hidden']]],
    hideErrors: [Boolean, 'val'],
    "errorsDisplayed": ['toggle', ['async', setImmediate, 'validation.error'], ['transist', '-submit', 'hideErrors']],
    "errorShown": ['&&', 'canShowErrors', 'errorsDisplayed'],
    "disabled": (props.disabled || props.disableWhenValidated ) ? [Boolean, ['||', 
      // disable when beingChecked after submit
      '../disabled',
      props.disabled ? [props.disabled, '../val', '../valids'] : skip,
      props.disableWhenValidated ? 'somethingIsChecked' : skip]] : skip,
    "hidden": [(currentStep, vals, valids, val, valid) => {
      if(currentStep) {
        return currentStep != props.order;
      }
      return props.hidden ? (props.hidden(vals, valids, val, valid)) : false;
    }, '../currentStep', '../val', '../valids', 'val', 'valid', '$start'],
  }
  if(props.defaultValue !== undefined) {
    struct.$init.val = props.defaultValue;
    struct.$init.initVal = props.defaultValue;
  }
  return gridMacros.skipEqual(struct, {
    focusedWithName: true,
    valWithName: true,
    beingCheckedWithName: true,
    beingChecked: true,
    somethingIsChecked: true,
    status: true,
    currentError: true,
    canShowErrors: true,
    errorsDisplayed: true,
    errorShown: true,
    disabled: true,
    hidden: true,
  });  
}, (state, props, $) => {
  return <div>Please override me!</div>;
});
