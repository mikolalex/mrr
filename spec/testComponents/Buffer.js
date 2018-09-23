import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $init: {
    
  },
  a: ['buffer', 'b', 100, 'N/A'],
}, (state, props, $) => {
  return (
    <div className="set-b" onClick={ $('b', 10) }>
      
    </div>
  );
});
