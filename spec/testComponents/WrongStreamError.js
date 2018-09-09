import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $readFromDOM: ['a', 'b'],
  x: [a => a, 'a', 'b']
}, (state, props, $) => {
  return (
    <div onClick={ $("foo") }>
      
    </div>
  );
});
