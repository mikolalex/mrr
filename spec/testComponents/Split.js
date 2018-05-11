import React from 'react';
import { withMrr, skip } from '../../src';

const max_failed_attempts = 5;

export default withMrr({
  $log: true,
  $init: {
      a: 11,
  },
  a: ['split', {
    b: a => a > 10,
    c: a => a < 10,
    d: a => a == 10 && a,
  }, 'x']
  
}, (state, props, $) => {
  return (
    <div>
        <div className="input-1" onClick={ $('x', 5) }></div>
        <div className="input-2" onClick={ $('x', 10) }></div>
        <div className="input-3" onClick={ $('x', 20) }></div>
    </div>
  );
});
