import React from 'react';
import { expect, assert } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
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


describe('Mrr Forms', () => {
  it('Test validation', (done) => {
    const getStateObj_1 = {};
    const getStateObj_2 = {};
    const wrapper = mount(<CardForm dbg1={ getStateObj_1 } dbg2={ getStateObj_2 } />);


    new Promise(wait(0))
    .then(() => {
        wrapper.find('.submit').simulate('click');
    })
    .then(wwait(200))
    .then(() => {
        const disabled = wrapper.find('.submit').prop('disabled');
        expect(disabled).to.equal(true);
    })
    .then(wwait(800))
    .then(() => {
        expect(getStateObj_1.getState().controlsDisabled).to.equal(false);
        expect(getStateObj_2.getState().currentError).to.equal('Please enter card number');
        done();
    })
    .catch(e => {
        console.log("Error:", e);
    });
  });
  it('Test CascadeForm', done => {
    const wrapper = mount(<CascadeForm/>);
    new Promise(wait(0))
    .then(() => {
        expect(wrapper.find('select').length).to.equal(2);
        wrapper.find('select').first().simulate('change', {target: {value: '', type: 'select'}});
    })
    .then(wwait(300))
    .then(() => {
        expect(wrapper.find('select').length).to.equal(1);
        wrapper.find('select').first().simulate('change', {target: {value: 'Ukraine', type: 'select'}});
    })
    .then(wwait(300))
    .then(() => {
        expect(wrapper.find('select').length).to.equal(2);
        wrapper.find('select').at(1).simulate('change', {target: {value: 'Kyiv', type: 'select'}});
    })
    .then(wwait(300))
    .then(() => {
        expect(wrapper.find('select').length).to.equal(3);
        wrapper.find('select').first().simulate('change', {target: {value: '', type: 'select'}});
    })
    .then(wwait(300))
    .then(() => {
        expect(wrapper.find('select').length).to.equal(1);
        done();
    })
  });
  it('Test Form1', done => {
    const initVals = {
      "name": "Myk",
      "cities": [
        {
          "state": "UA",
          "city": "Konst"
        },
        {
          "state": "UA",
          "city": "Kyiv"
        },
        {
          "state": "GE",
          "city": "Atlanta"
        },
      ]
    }
    const wrapper = mount(<Form1 defaultValue={ initVals }/>);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.my-submit').simulate('click');
    })
    .then(wwait(200))
    .then(() => {
        expect(wrapper.find('.error').first().html()).to.equal('<div class="error">Empty</div>');
        //console.log('Html', wrapper.html());
        done();
        return;
    })
//    .then(wwait(600))
//    .then(() => {
//        const disabled = wrapper.find('.submit').prop('disabled');
//        assert(disabled, false);
//        done();
//    })
    .catch(e => {
        console.log("Error:", e);
        done();
    });
  })
});