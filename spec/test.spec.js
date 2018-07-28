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
import TestGG from './testComponents/TestGG';

import { CardForm } from './testComponents/SuperForm';

import { initGlobalGrid } from '../src';

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


describe('Mrr Forms', () => {
  it('Test validation', (done) => {
    const wrapper = mount(<CardForm />);

    new Promise(wait(0))
    .then(() => {
        wrapper.find('.submit').simulate('click');
    })
    .then(wwait(200))
    .then(() => {
        const disabled = wrapper.find('.submit').prop('disabled');
        assert(disabled, true);
    })
    .then(wwait(600))
    .then(() => {
        const disabled = wrapper.find('.submit').prop('disabled');
        assert(disabled, false);
        done();
    })
    .catch(e => {
        console.log("E", e);
    });
  });
});

describe('Macros', () => {
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


describe('Testing global grid', () => {
  it('Test cells\' linking with $expose', () => {
    const GG = initGlobalGrid({
        a: [a => a + 10, '*/bar'],
        b: [a => a + 10, '*/baz'],
    })
    const component = mount(<TestGG />);
    
    assert.strictEqual(GG.mrrState['*/bar'], 10);
    assert.strictEqual(GG.mrrState['a'], 20);
    assert.strictEqual(GG.mrrState['*/baz'], undefined);
    assert.strictEqual(GG.mrrState['b'], undefined);
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
