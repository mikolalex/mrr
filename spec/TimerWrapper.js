import React from 'react';
import { withMrr } from '../src';
import Timer from './Timer';

const set = (cb, val) => { 
  cb(val); 
}

export default withMrr({
  $log: 'no-colour',
  $expose: [],
  $init: {
    timerShown: false,
  },
  timerShown: ['async', (cb) => {
    setTimeout(set.bind(null, cb, true), 300);
    setTimeout(set.bind(null, cb, false), 600);
    setTimeout(set.bind(null, cb, true), 1000);
    setTimeout(set.bind(null, cb, false), 1400);
  }, '$start'],
}, (state, props, $) => {
  return (
    <div>
      { state.timerShown && <Timer { ...props }/> }
    </div>
  );
});
