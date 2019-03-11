import React from 'react';
import { expect, assert } from 'chai';
import { shallow, configure, mount } from 'enzyme';
import { describe, it } from 'mocha';
import Adapter from 'enzyme-adapter-react-16';

import { withMrr, skip, Grid, Mrr, simpleWrapper } from '../src';

import a from './setup';

import { mrrMount, timeline } from './utils';

import Merge from './testComponents/Merge.hooks';

/*describe('Testing using hooks', () => {
  it('Test "merge" macro', (done) => {
    const wrapper = mount(<Merge />);
    const d = wrapper.find('.output-d').html();
    assert.strictEqual(d, 20);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.input-a').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const state = wrapper.state();
        const d = wrapper.find('.output-d').html();
        assert.strictEqual(d, 42);


        wrapper.find('.input-c').simulate('click');
    })
    .then(wwait(10))
    .then(() => {
        const d = wrapper.find('.output-d').html();
        assert.strictEqual(d, 0);
        done();
    }).catch(e => {
        console.log("E", e);
    });
  });
});*/