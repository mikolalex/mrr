import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $readFromDOM: ['a', 'b'],
  x: [a => a, 'a', 'b', 'c']
}, (state, props, $) => {
  return (
    <div>
      
    </div>
  );
});
