import React from 'react';
import useMrr from '../../src/mrr-react-hook';

const max_failed_attempts = 5;

const Merge = props => {
  const [state, $] = useMrr(props, {
    //$log: true,
    $init: {
        a: 10, 
        b: 20, 
        c: false
    },
    d: ['merge', {
      a: 42,
      b: a => a + 10,
      c: () => 0,
      $start: 20,
    }]
  });
  return (
    <div>
        <div className="input-a" onClick={ $('a') }></div>
        <div className="input-b" onClick={ $('b', 10) }></div>
        <div className="input-c" onClick={ $('c') }></div>
        <div className="output-d">{ state.d }</div>
    </div>
  );
};

export default Merge;
