import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $init: {
  	errorCount: 0,
  },
  a: [a => {
  	return a();
  }, 'b'],
  c: [a => {
  	return a();
  }, 'd'],
  errorCount: [a => {
  	return a + 1;
  }, '^', '$err'],
}, (state, props, $) => {
  return (
    <div>
      
    </div>
  );
});
