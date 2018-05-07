import React from 'react';
import { withMrr, skip } from '../../src';

const max_failed_attempts = 5;

export default withMrr({
  //$log: true,
  $init: {
      a: 10, 
      b: 20, 
      c: false
  },
  d: ['merge', {
    a: 42,
    b: a => a + 10,
    c: () => 0,
    $start: 20,
  }]
  
}, (state, props, $) => {
  return (
    <div>
        <div className="input-a" onClick={ $('a') }></div>
        <div className="input-b" onClick={ $('b', 10) }></div>
        <div className="input-c" onClick={ $('c') }></div>
    </div>
  );
});
