import React from 'react';
import { expect, assert } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
import Adapter from 'enzyme-adapter-react-16';

import a from './setup';

import LoginForm from './testComponents/LoginForm';
import TimerWrapper from './testComponents/TimerWrapper';
import InputForm from './testComponents/InputForm';
import Map from './testComponents/Map';

configure({ adapter: new Adapter() });

const wait = ms => resolve => {
  setTimeout(resolve, ms);
};
const wwait = ms => () => {
  return new Promise(wait(ms));
};

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

describe('Macros', () => {
  const wrapper = mount(<Map />);
  it('Test "map" macro', (done) => {
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
