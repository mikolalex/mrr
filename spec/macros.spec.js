import React from 'react';
import { expect, assert } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
import parallel from 'mocha.parallel';
import Adapter from 'enzyme-adapter-react-16';

import a from './setup';

import LoginForm from './testComponents/LoginForm';
import TimerWrapper from './testComponents/TimerWrapper';
import InputForm from './testComponents/InputForm';
import Merge from './testComponents/Merge';
import Split from './testComponents/Split';
import SkipN from './testComponents/SkipN';
import Init from './testComponents/Init';
import TestGG, { GG } from './testComponents/TestGG';
import Coll from './testComponents/Coll';
import Buffer from './testComponents/Buffer';

import { CardForm } from './testComponents/CardForm';
import Form1 from './testComponents/Form1';
import CascadeForm from './testComponents/CascadeForm';

import UndescribedCellError from './testComponents/UndescribedCellError';
import WrongStreamError from './testComponents/WrongStreamError';

import { mrrMount, timeline } from './utils';

configure({ adapter: new Adapter() });

const wait = ms => resolve => {
  setTimeout(resolve, ms);
};
const wwait = ms => () => {
  return new Promise(wait(ms));
};





parallel('Macros', () => {
  it('Test "remember" macro', (done) => {
    const comp = mrrMount(Buffer);
    timeline([
        [0, () => {
            comp.set('b', 10);
            assert.equal(comp.get('a'), 10);
        }],
        [50, () => {
            assert.equal(comp.get('a'), 10);
        }],
        [200, () => {
            assert.equal(comp.get('a'), 'N/A');
            comp.set('b', 42);
            assert.equal(comp.get('a'), 42);
        }],
        [250, () => {
            assert.equal(comp.get('a'), 42);
            done();
        }],
    ])
  });
  it('Test "merge" macro', (done) => {
    const wrapper = mount(<Merge />);
    const state = wrapper.state();
    assert(state.d, 20);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert(state.d, 42);


        wrapper.find('.input-c').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state.d, 0);
        done();
    }).catch(e => {
        console.log("E", e);
    });
  });
  
  
  it('Test "split" macro', (done) => {
    const wrapper = mount(<Split />);
    const state = wrapper.state();
    assert.strictEqual(state.a, 11);
    assert.strictEqual(state['a.c'], undefined);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.input-1').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['a.c'], true);
        
        wrapper.find('.input-2').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['a.d'], 10);
        done();
    }).catch(e => {
        console.log("E", e);
        done();
    });
  });
  it('Test "coll" macro', () => {
        const debug = {};
        const wrapper = mount(<Coll extractDebugMethodsTo={ debug } />);
        assert.strictEqual(debug.getState().items.length, 1);
        
        wrapper.find('.add1').simulate('click');
        assert.strictEqual(debug.getState().items.length, 2);
        
        wrapper.find('.add2').simulate('click');
        assert.strictEqual(debug.getState().items.length, 3);
        
        wrapper.find('.add3').simulate('click');
        assert.strictEqual(debug.getState().items.length, 4);
        
        
        
        wrapper.find('.upd1').simulate('click');
        assert.strictEqual(debug.getState().items[2].name, 'baz1');
        
        wrapper.find('.upd2').simulate('click');
        assert.strictEqual(debug.getState().items[0].age, 42);
        assert.strictEqual(debug.getState().items[1].age, 42);
        assert.strictEqual(debug.getState().items[2].age, 42);
        assert.strictEqual(debug.getState().items[3].age, 42);
        
        wrapper.find('.upd3').simulate('click');
        assert.strictEqual(debug.getState().items[3].age, 0);
        
        
        
        wrapper.find('.del1').simulate('click');
        assert.strictEqual(debug.getState().items.length, 4);
        
        wrapper.find('.del2').simulate('click');
        assert.strictEqual(debug.getState().items.length, 3);
        assert.strictEqual(debug.getState().items[0].name, 'foo');
        
        wrapper.find('.del3').simulate('click');
        assert.strictEqual(debug.getState().items.length, 2);
        assert.strictEqual(debug.getState().items[1].name, 'baz1');
        
        wrapper.find('.del4').simulate('click');
        assert.strictEqual(debug.getState().items.length, 0);
        
  });
  
  it('Test "skipN" macro', (done) => {
    const wrapper = mount(<SkipN />);
    const state = wrapper.state();
    assert.strictEqual(state.b, 20);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['b'], 20);
        
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['b'], 20);
        
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['b'], 20);
        
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert.strictEqual(state['b'], 11);
        done();
        
    }).catch(e => {
        console.log("E", e);
        done();
    });
  });
  it('Test init execution', () => {
    const wrapper = mount(<Init />);
  });
});
