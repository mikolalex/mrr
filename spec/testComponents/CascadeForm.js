import React from 'react';
import { withMrr, skip } from '../../../mrr/src';

import { Form, Input, ListForm } from '../../src/Form';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;
const prop = a => b => b[a];
const objProp = (a, def) => (b) => {
    if(!b) return def;
    return a[b] !== undefined ? a[b] : def;
}

const concat = function(){
  //console.log('concat', arguments);
  return Array.prototype.join.call(arguments, '');
}

const defVal = {
    country: 'Ukraine',
};

const performAsync = func => {
    return function(cb, ...args){
        cb('loading', true);
        const p = func.apply(null, args);
        p.then(data => {
            cb('loading', false);
            cb('data', data);
        }).catch(err => {
            cb('loading', false);
            cb('error', err);
        })
    }
}

const wait = time => func => (function(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(func instanceof Function ? func.apply(null, arguments) : func);
        }, time);
    })
});

const after1second = wait(200);
const regions = {
    'Ukraine': ['Donetsk region', 'Kyiv'],
    'USA': ['Tennessee', 'Georgia'],
}

const cities = {
    Georgia: ['Atlanta'],
    Kyiv: ['Kyiv'],
};

class CascadeForm extends React.Component {
    render(){
        return <Form 
            __mrr={{ 
              region_disabled: 'region/disabled',
            }} 
            defaultValue={ defVal } 
            fields={{
                country: {
                    __mrr: {
                        getOptions: ['nested', performAsync(after1second(['Ukraine', 'USA'])), '$start'],
                        options: 'getOptions.data',
                        disabled: 'getOptions.loading',
                    },
                    type: 'select',
                },
                region: {
                    type: 'select',
                    hidden: (vals) => !vals.country,
                    __mrr: {
                        '+clear': ['when', vals => !vals.country, '../val'],
                        '=selectedCountry': [prop('country'), '../val', '$start'],
                        getOptions: ['nested', performAsync(after1second(objProp(regions, []))), 'selectedCountry', '$start'],
                        options: 'getOptions.data',
                        disabled: 'getOptions.loading',
                    }
                },
                city: {
                    type: 'select',
                    hidden: (vals) => !vals.region,
                    __mrr: {
                        '=selectedRegion': [prop('region'), '../val', '$start'],
                        getOptions: ['nested', performAsync(after1second(objProp(cities, []))), 'selectedRegion', '$start'],
                        options: 'getOptions.data',
                        disabled: ['||', 'getOptions.loading', '../region_disabled'],
                    }
                }
            }}
        />
    }
}

export default CascadeForm;
