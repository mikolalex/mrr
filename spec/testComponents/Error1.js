import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $init: {
  	errorCount: 0,
  },
  a: [a => {
  	return a();
  }, 'b'],
  errorCount: [a => {
  	return a + 1;
  }, '^', '$err.a'],
}, (state, props, $) => {
  return (
    <div>
      
    </div>
  );
});
