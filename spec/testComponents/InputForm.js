import React from 'react';
import { withMrr, skip } from '../../src';

const max_failed_attempts = 5;

export default withMrr({
  //$log: true,
  $init: {
    validInput: false,
    input: '',
    failedAttempts: 0,
  },
  validInput: [a => a.length > 3 ? a : false, 'input'],
  submission: ['nested', (cb, validInput) => (validInput ? {
      success: validInput,
    } : {
      error: true,
    }
  ), '-validInput', 'submit'],
  apiRequest: ['nested', (cb, text) => {
    cb('loading', true);
    new Promise((resolve) => {
      setTimeout(resolve, 1);
    }).then(() => {
      if (text % 2) {
        cb('error', 'Wrong number!');
      } else {
        cb('success', '');
      }
    })
    .catch(e => cb('error', e.errorMessage))
    .then(() => cb('loading', false));
  }, 'submission.success'],
  correctInputs: 'apiRequest.success',
  failedAttempts: ['closureMap', 0, {
    'apiRequest.error': (prevVal) => prevVal + 1,
    'apiRequest.success': () => 0,
  }],
  inputErrorShown: ['merge', {
    'submission.error': 'Please enter at least 3 characters',
    'apiRequest.error': e => e,
    'input': false,
  }],
}, (state, props, $) => {
  return (
    <form>
      { state.failedAttempts < max_failed_attempts
      ? <div>
          <input className="input-value" onChange={ $('input') } disabled={ state['apiRequest.loading'] } />
          <input type="submit" className="submit" onClick={ $('submit') } />
          { state.inputErrorShown &&
              <div className="error"> { state.inputErrorShown } </div>
          }
        </div>
      : <div>
          You did too much failed attempts!
        </div>
      }
    </form>
  );
});
