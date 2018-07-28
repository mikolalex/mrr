import React from 'react';
import { withMrr, skip } from '../';

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

export default withMrr({
  $log: ['allSteps'],
  $init: {
    isFormValid: false,
    input: '',
    failedAttempts: 0,
    currentStep: 1,
  },
  submit: ['merge', '../submit', 'tryNextStep'],
  currentStep: ['merge', {
      nextStep: (_, prev, orders) => {
        const next = Number(prev) + 1;
        if(orders[next]){
          return next;
        } else {
          return prev;
        }
      },
      prevStep: (_, prev) => prev - 1 || 1,
      toStep: id,
  }, '^', '-orders'],
  vals: ['skipSame', ['closure', state, '*/valWithName']],
  allSteps: ['skipSame', [a => a.size, ['closure', set, '*/orderWithName']]],
  valids: ['skipSame', ['closure', state, '*/validWithName']],
  validSoFar: [(valids, orders, currentStep) => {
    let valid = true;
    for(let i = 1; i <= currentStep; i++){
      valid = valid && valids[orders[i]];
    }
    //console.log('Valid so far?', valids, orders, currentStep, valid);
    return valid;
  }, '-valids', '-orders', '-currentStep', 'tryNextStep'],
  nextStep: ['skipIf', not, 'validSoFar'],
  reset: ['skipSame', 'currentStep'],
  orders: ['skipSame', [objFlip, ['closure', state, '*/orderWithName']]],
  'valWithName': [(val, name) => [val, name], 'vals', '$name'],
  'validWithName': [(valids, name) => {
    let valid = true;
    for(let k in valids){
        if(!valids[k]) {
            valid = false;
            break;
        }
    }
    return [valid, name];
  }, 'valids', '$name']
}, (state, props, $, connectAs) => {
    return 'Please override me!';
})
