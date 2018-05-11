import React from 'react';
import { withMrr, skip } from '../../src';

export default withMrr({
  //$log: true,
  $init: {
      "a": 10,
      b: 20,
  },
  c: [(a, b) => {
     //
     console.log('C is computed', a, b);
     return 42;
  }, 'a', 'b'],
}, (state, props, $) => {
  return (
    <div>
        
    </div>
  );
});
