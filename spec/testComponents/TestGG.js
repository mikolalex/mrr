import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $expose: {
      foo: 'bar'
  },
  $init: {
    foo: 10,
    baz: 30,
  },
}, (state, props, $) => {
  return (
    <div>
      
    </div>
  );
});
