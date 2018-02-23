import React from 'react';
import { withMrr, skip } from '../../src';

export default withMrr({
  //$log: true,
  $init: {
    isFormValid: false,
    input: '',
    failedAttempts: 0,
  },
  isFormValid: [a => a.length > 3, 'input'],
  submission: ['nested', (cb, isValid, text) => {
      return isValid ? {
        success: text,
      } : {
        error: true,
      };
  }, '-isFormValid', '-input', 'submit'],
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
    'apiRequest.error': (prevVal) => {
        return prevVal + 1;
    },
    'apiRequest.success': () => 0,
  }],
  inputErrorShown: ['map', {
    'submission.error': 'Please enter at least 3 characters',
    'apiRequest.error': e => e,
    'input': false,
  }],
}, (state, props, $) => {
  return (
    <form>
      { state.failedAttempts < 5
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
