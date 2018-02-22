import React from 'react';
import { expect } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
import Adapter from 'enzyme-adapter-react-16';

import a from './setup';

import LoginForm from './testComponents/LoginForm';
import TimerWrapper from './testComponents/TimerWrapper';
import InputForm from './testComponents/InputForm';

configure({ adapter: new Adapter() });

describe('Form validation', () => {
  it('Should validate', () => {
    const wrapper = mount(<LoginForm />);
    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(2);
    //console.log('_______________________');

    wrapper.find('.chb').simulate('change', { target: { checked: true, type: 'checkbox' } });
    expect(wrapper.find('.error')).to.have.length(0);
    //console.log('_______________________');

    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(1);
    //console.log('_______________________');
  });
});
  
describe('Some input form', () => {
  const wrapper = mount(<InputForm />);
  it('Should show error on empty input', () => {

    wrapper.find('.submit').simulate('click');
    expect(wrapper.find('.error')).to.have.length(1);

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
/*

describe('', () => {
  it('', (done) => {
    const wrapper = mount(<TimerWrapper { ...props } />);

    expect(wrapper.find('div')).to.have.length(0);

    done();
  });
});

*/
