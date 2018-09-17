import React from 'react';
import { withMrr } from '../../src';

export default withMrr({
  $log: true,
  $expose: [],
  $init: {
     items: [{
       name: 'bar'
     }],
  },
  items: ['coll', {
       create: 'add_item',
       update: 'update_item',
       delete: 'delete_item'
       
  }],
}, (state, props, $) => {
  return (
    <div>
        <div className="add1" onClick={ $('add_item', { name: 'foo' }) }></div>
        <div className="add2" onClick={ $('add_item', { name: 'baz' }) }></div>
        <div className="add3" onClick={ $('add_item', { name: 'err' }) }></div>
            
        <div className="upd1" onClick={ $('update_item', [{ name: 'baz1' }, { name: 'baz' }]) }></div>
        <div className="upd2" onClick={ $('update_item', [{ age: 42 }, {}]) }></div>
        <div className="upd3" onClick={ $('update_item', [{ age: 0 }, 3]) }></div>
                
        <div className="del1" onClick={ $('delete_item', { name: 'Carl' }) }></div>
        <div className="del2" onClick={ $('delete_item', { name: 'bar' }) }></div>
        <div className="del3" onClick={ $('delete_item', 2) }></div>
        <div className="del4" onClick={ $('delete_item', {}) }></div>
    </div>
  );
});
