import React from 'react';
import { mount } from 'enzyme';

export const mrrMount = (Component) => {
    const debug = {};
    const wrapper = mount(<Component extractDebugMethodsTo={ debug } />);
    const component = debug.self;
    return {
        set: (cell, val) => {
            component.toState(cell, val, true)();
        },
        get: cell => {
            return component.mrrState[cell];
        }
    }
}

export const timeline = (arr) => {
    for(let [time, func] of arr){
        setTimeout(func, time || 0);
    }
}