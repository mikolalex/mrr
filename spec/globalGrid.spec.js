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
import TestGG_2 from './testComponents/TestGG_2';
import Coll from './testComponents/Coll';

import { CardForm } from './testComponents/CardForm';
import Form1 from './testComponents/Form1';
import CascadeForm from './testComponents/CascadeForm';

import UndescribedCellError from './testComponents/UndescribedCellError';
import WrongStreamError from './testComponents/WrongStreamError';

configure({ adapter: new Adapter() });

const wait = ms => resolve => {
  setTimeout(resolve, ms);
};
const wwait = ms => () => {
  return new Promise(wait(ms));
};


parallel('Testing global grid', () => {
  it('Test cells\' linking with $expose', () => {
    const component = mount(<TestGG />);
    
    assert.strictEqual(GG.mrrState['*/bar'], 10);
    assert.strictEqual(GG.mrrState['a'], 20);
    assert.strictEqual(GG.mrrState['*/baz'], undefined);
    assert.strictEqual(GG.mrrState['b'], undefined);
  });
  
  it('Should return GG state', (done) => {
    let d;
    const component = mount(<TestGG_2 setVal={val => d = val}/>);
    setTimeout(() => {
      assert.strictEqual(d, 20);
      done();
    }, 20);
  });
});