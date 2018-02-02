import React from 'react';
import { withMrr } from '../src';

const errorStyle = {
  border: '1px solid red',
};
const checkNumberApiCall = () => new Promise(res => setTimeout(res, 1000));

export default withMrr({
  $log: true,
  $expose: ['loginCredentials', 'redirectAfterLogin'],
  $init: {
    number: '',
  },
  localValidation: ['nested', (cb, number, terms) => {
    let error = false;
    if (!number.length) {
      error = true;
      cb('numberError', true);
    }
    if (!terms) {
      error = true;
      cb('termsError', true);
    }
    if (!error) {
      cb('number', number);
    }
  }, '-number', '-termsAccepted', 'submit'],
  apiValidation: ['nested', (cb, number) => {
    cb('pending', true);
    checkNumberApiCall(number).then(() => {
      cb('success', { foo: 42 });
    }).catch(e => {
      cb('pending', false);
      cb('error', e.text);
    });
  }, 'localValidation.number'],
  refreshFormErrors: ['join', 'termsAccepted', 'number', '$start'],
  inputValid: ['map', {
    'apiValidation.error': false,
    'localValidation.numberError': false,
    'refreshFormErrors': true,
  }],
  termsValid: ['map', {
    'localValidation.termsError': false,
    'refreshFormErrors': true,
  }],
  apiError: ['map', {
    'apiValidation.error': a => a,
    'number': '',
  }],
  loginCredentials: 'apiValidation.success',
  redirectAfterLogin: [(cb) => setTimeout(cb, 1000), 'apiValidation.success'],
}, (state, props, $) => {
  return (
    <div>
      <div>
        { state['apiValidation.success'] ? 'Wait a second...' : 'Welcome' }
      </div>
      <input onChange={ $('number') } value={ state.number } style={ state.inputValid ? {} : errorStyle } />
      { state.apiError &&
        <div className="tooltip">
          { state.apiError }
        </div>
      }
      <button onClick={ $('submit') } >
        { state['apiValidation.pending'] ? 'Wait...' : 'Next' }
      </button>
      <div className="foo" style={ state.termsValid ? {} : errorStyle } >
        <input type="checkbox" onChange={ $('termsAccepted') } />
      </div>
    </div>
  );
});
