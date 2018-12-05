import React from 'react';
import { withMrr, skip, gridMacros } from './myMrr';
import Form from './Form';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;

const state = () => {
  let state = {};
  return (a) => {
    state = Object.assign({}, state);
    state[a[1]] = a[0];
    return state;
  };
};


const styles = `

.my-input label {
    width: 200px;
    display: inline-block;
    text-align: right;
    padding: 0 10px;
}

.my-input {
    padding: 10px;
    margin: 0 10px;
}

.form {
    border: 1px dotted grey;
    padding: 5px;
    margin: 5px;
}

`;


const set = () => {
  let state = new Set;
  return (a) => {
    state.add(a[0]);
    return state;
  };
};
const objFlip = obj => {
  const flippedObj = {};
  for(let k in obj){
    flippedObj[obj[k]] = k;
  }
  return flippedObj;
}


const isPromise = a => a && a.constructor && a.constructor.name === 'Promise';

const getValidationFunc = props => (cb, val, vals, valids, orders, currentStep) => {
  if(!props.errors){
    return;
  }
  const promises = [];
  for(let msg in props.errors){
    const res = props.errors[msg](val, vals, valids, currentStep);
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

export default withMrr(props => {
  
  const valPrefix = props.validateOnlyAfterSubmit ? '-' : '';
  return gridMacros.skipEqual({
    $init: {
      currentStep: 1,
    },
    currentStep: ['merge', {
        "makeNextStep.next": (_, prev) => Number(prev) + 1,
        prevStep: (_, prev) => prev - 1 || 1,
        toStep: id,
    }, '^'],
    makeNextStep: ['split', {
      'next': (orders, currentStep) => orders[currentStep + 1],
      'final': (orders, currentStep) => !orders[currentStep + 1],
    }, '-orders', '-currentStep', 'makeNextStepAfterValidation'],
    "allSteps": [a => a.size, ['closure', set, '*/orderWithName']],
    validation: ['nested', 
      getValidationFunc(props), 
      valPrefix + 'val', ['skipSame', valPrefix + '../val'], '-valids', 'makeNextStep.final'],
    "mayProceed": ['toggle', 'nextStep', 'val'],
    validSoFar: ['join', ['closure', () => {
        const state = {};
        return (valids, orders, currentStep, mayProceed) => {
          if(!orders) return skip;
          const key = orders[currentStep];
          const ok = (state[key] === 'checking') && (valids[key] === true) && mayProceed;
          state[key] = valids[key];
          return ok;
        }
      }, 'valids', '-orders', '-currentStep', '-mayProceed'], 
      [(valids, orders, currentStep) => {
        if(!orders) return skip;
        const key = orders[currentStep];
        return !valids || (valids[key] === true) || (valids[key] === undefined);
      }, 
      '-valids', '-orders', '-currentStep', 'nextStep'],
    ],
    submit: ['merge', '../submit', 'nextStep'],
    makeNextStepAfterValidation: ['skipIf', not, 'validSoFar'],
    //reset: ['skipSame', 'currentStep'],
    "orders": [objFlip, ['closure', state, '*/orderWithName']],
    "successfulSubmit": ['transist', '-val', 'makeNextStep.final'],
  }, {
    allSteps: true,
    mayProceed: true,
    orders: true,
  });

}, null, Form);
