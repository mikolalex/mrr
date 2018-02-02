import React from 'react';
import { expect } from 'chai';
import { shallow, configure } from 'enzyme';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import Adapter from 'enzyme-adapter-react-16';
import MyComponent from './MyComponent';

configure({ adapter: new Adapter() });

describe('<MyComponent />', () => {
  it('renders three <Foo /> components', () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find('.foo')).to.have.length(1);
  });
});