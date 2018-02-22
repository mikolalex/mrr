import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $log: 'no-colour',
  $expose: [],
  $init: {
    
  },
  timer: ['closure', () => {
      return (cell, props) => {
          if(cell === '$start'){
            props.onTimerMount();
          }
          if(cell === '$end'){
            props.onTimerUnmount();
          }
      };
  }, ['funnel', a => a, '$start', '$end'], '-$props'],
}, (state, props, $) => {
  return (
    <div>
      Timer
    </div>
  );
});
