import React from 'react';
import { expect, assert } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
//import parallel from 'mocha.parallel';
import Adapter from 'enzyme-adapter-react-16';

import { withMrr, skip, Grid } from '../src';

import a from './setup';

import { mrrMount, timeline } from './utils';

import LoginForm from './testComponents/LoginForm';
import TimerWrapper from './testComponents/TimerWrapper';
import InputForm from './testComponents/InputForm';
import Merge from './testComponents/Merge';
import Split from './testComponents/Split';
import SkipN from './testComponents/SkipN';
import Init from './testComponents/Init';
import TestGG, { GG } from './testComponents/TestGG';
import Coll from './testComponents/Coll';

import { CardForm } from './testComponents/CardForm';
import Form1 from './testComponents/Form1';
import CascadeForm from './testComponents/CascadeForm';

import UndescribedCellError from './testComponents/UndescribedCellError';
import WrongStreamError from './testComponents/WrongStreamError';

import Error1 from './testComponents/Error1';
import Error2 from './testComponents/Error2';

configure({ adapter: new Adapter() });

const wait = ms => resolve => {
  setTimeout(resolve, ms);
};
const wwait = ms => () => {
  return new Promise(wait(ms));
};

const incr = new Function('a', 'return a + 1');
incr.toString = function(){ return '[INCREMENT]'; };

describe('Grid inheritance', () => {
  it('Should proper inherit grids', () => {
    const a = new Grid({
        $init: {
           b: 10,
        },
        a: [incr, 'b'],
    })

    const b = a.extend(props => ({
        c: [incr, props.c_parent || 'z']
    }))

    const struct1 = a.get({})
    const struct2 = b.get({
        c_parent: 'a'
    });
    const struct3 = b.get({});

    //console.log('_____________________ struct 2', struct2.c[1]);

    assert.equal(struct1.c, undefined);
    assert.equal(struct2.c[1], 'a');
    assert.equal(struct3.c[1], 'z');
  });   
});

describe('Form validation', () => {
  const wrapper = mount(<LoginForm />);
  it('Should validate', () => {
    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(2);
    //console.log('_______________________');
  });
  it('Should validate 2', () => {
    wrapper.find('.chb').simulate('change', { target: { checked: true, type: 'checkbox' } });
    expect(wrapper.find('.error')).to.have.length(0);
  });
  it('Should validate 3', () => {
    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(1);
    //console.log('_______________________');
  });
});

describe('Some input form', () => {
  const wrapper = mount(<InputForm />);
  it('Should show error on empty input', (done) => {

    wrapper.find('.submit').simulate('click');
    expect(wrapper.find('.error')).to.have.length(1);


    wrapper.find('.input-value')
      .simulate('change',  {target: {type: 'text', value: '12345'}});

    new Promise(wait(0))
    .then(() => {
      wrapper.find('.submit').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        assert(state['submission.success'], undefined);
        assert(state['apiRequest.error'], 'Wrong number!');

        wrapper.find('.input-value')
          .simulate('change',  {target: {type: 'text', value: '123456'}});
        wrapper.find('.submit').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        //console.log('ST', state);
        assert(state['submission.success'], '123456');
        done();
    }).catch(e => {
      console.log("E", e);
    });
    //expect(wrapper.find('.error')).to.have.length(0);

  });
});

describe('Ticks', () => {
  it('Test timer', (done) => {
    let c = 0;
    let d = 0;
    const onTimerMount = () => {
      ++c;
    };
    const onTimerUnmount = () => {
      ++d;
    };
    const props = {
      onTimerMount,
      onTimerUnmount,
    };
    mount(<TimerWrapper { ...props } />);
    setTimeout(() => {
      expect(c).to.equal(2);
      expect(d).to.equal(2);
      done();
    }, 1900);
  });
});


describe('Testing readFromDOM', () => {
  it('Should throw an exception when linking to undescribed cell', () => {
    //const component = mount(<UndescribedCellError />);
    expect(() => { 
        const a = mount(<UndescribedCellError />); 
    }).to.throw(Error);
  });
  it('Should throw an exception for trying to set an undescribed stream', () => {
    //const component = mount(<UndescribedCellError />);
    expect(() => { 
        const a = mount(<WrongStreamError />); 
    }).to.throw(Error);
  });
});


describe('Testing special error cells', () => {
  it('Should emit error to special $err.%cellname% cell', () => {
    const comp = mrrMount(Error1);

    comp.set('b', () => 42);
    const a42 = comp.get('a');

    comp.set('b', 33);
    assert.strictEqual(comp.get('errorCount'), 1);

    comp.set('b', 44);
    assert.strictEqual(comp.get('errorCount'), 2);

    comp.set('b', () => 42);
    assert.strictEqual(comp.get('errorCount'), 2);

  });
  it('Should emit error to general $err cell', () => {
    const comp = mrrMount(Error2);

    assert.strictEqual(comp.get('errorCount'), 0);

    comp.set('b', 33);
    assert.strictEqual(comp.get('errorCount'), 1);

    comp.set('d', 33);
    assert.strictEqual(comp.get('errorCount'), 2);

    comp.set('b', 44);
    assert.strictEqual(comp.get('errorCount'), 3);

  });
});


describe('Testing $props cell', () => {
  it('Should return proper props', (done) => {

    let cb1;
    let cb2;
    let y;

    const B = withMrr({
        y: [(props) => {
            y = props.y;
        }, '$props', 'x'],
        x: ['async', callback => {
            cb2 = callback;
        }, '$start'],
    }, (state, props, $) => <div />);

    const A = withMrr({
        z: ['async', callback => {
            cb1 = callback;
        }, '$start'],
    }, (state, props, $) => {
      return (
        <div>
            <B y={ state.z } />
        </div>
      );
    });
    mount(<A />);
    
    cb1(1);
    assert.strictEqual(y, undefined);
    cb2(true);
    assert.strictEqual(y, 1);
    
    cb1(42);
    assert.strictEqual(y, 1);
    cb2(true);
    assert.strictEqual(y, 42);
    
    done();
  });
});


/*

describe('', () => {
  it('', (done) => {
    const wrapper = mount(<TimerWrapper { ...props } />);

    expect(wrapper.find('div')).to.have.length(0);

    done();
  });
});

*/
