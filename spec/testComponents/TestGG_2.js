import React from 'react';
import { createMrrApp } from '../../src';

export const { withMrr, GG } = createMrrApp({
    globalGrid: {
        a: [a => a + 10, '*/bar'],
        b: [a => a + 10, '*/baz'],
    },
});

export default withMrr(props => ({
  $expose: {
      bar: 'foo'
  },
  $init: {
    foo: 10,
    baz: 30,
  },
  d: ['async', (cb) => setTimeout(cb, 10), '$start'],
  e: [(globalState) => props.setVal(globalState.a), '^/$state', 'd'],
}), (state, props, $) => {
  return (
    <div>
      
    </div>
  );
});
