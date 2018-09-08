import React from 'react';
import { createMrrApp } from '../../src';

export const { withMrr, GG } = createMrrApp({
    globalGrid: {
        a: [a => a + 10, '*/bar'],
        b: [a => a + 10, '*/baz'],
    },
});

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
