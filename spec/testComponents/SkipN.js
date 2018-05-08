import React from 'react';
import { withMrr, skip } from '../../src';

const max_failed_attempts = 5;

export default withMrr({
  //$log: true,
  $init: {
      b: 20, 
  },
  b: ['skipN', [a => a + 1, 'a'], '3'],
}, (state, props, $) => {
  return (
    <div>
        <div className="input-a" onClick={ $('a', 10) }></div>
    </div>
  );
});
