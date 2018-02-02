import React from 'react';
import { expect } from 'chai';
import { shallow, configure } from 'enzyme';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import Adapter from 'enzyme-adapter-react-16';
import MyComponent from './MyComponent';

configure({ adapter: new Adapter() });

describe('<MyComponent />', () => {

  it('Submit empty field', () => {
    const wrapper = shallow(<MyComponent />);
    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(2);
    console.log('_______________________');

    wrapper.find('.chb').simulate('change', { target: { checked: true, type: 'checkbox' } });
    expect(wrapper.find('.error')).to.have.length(0);
    console.log('_______________________');

    wrapper.find('.submitButton').simulate('click');
    expect(wrapper.find('.error')).to.have.length(1);
    console.log('_______________________');

  });
});
