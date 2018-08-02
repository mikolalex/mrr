import React from 'react';
import { withMrr, skip } from '../../src';
import { Input, Form, ListForm, TimeForm } from '../../src/Form';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;


const styles = `

.my-input label {
    width: 200px;
    display: inline-block;
    text-align: right;
    padding: 0 10px;
}

.my-input {
    padding: 10px;
    margin: 0 10px;
}

.form {
    border: 1px dotted grey;
    padding: 5px;
    margin: 5px;
}

`;


const MyForm = withMrr({
    //$log: ['val', 'valids'],
  }, (state, props, $, connectAs) => {
    return (
      <div className="form">
        <style dangerouslySetInnerHTML={ {__html: styles} } />
        <Input
          label="Name"
          type="text" { ...connectAs('name') }
          errors={ {
            'Name too short': (val, vals) => {
              return !val || (val.length < 2);
            },
          } }
        />
        <Input type="password" { ...connectAs('pw') }
          label="Password"
          errors={{
            'Empty': not,
          }}
          disabled={ (vals, valids) => { 
            //console.log('PW DISABLED', vals, valids, !valids || !valids.name);
            return !valids || !valids.name;
          } }
        />
        <Input type="password" { ...connectAs('pw_rt') }
          label="Retype password"
          errors={{
            'Empty': not,
            'Dont match': (val, vals) => !vals || (val !== vals.pw)
          }}
          __mrr={
            {
              //$log: true,
            }
          }
          disabled={ (vals, valids) => !valids || !valids.name }
          hidden={
            (vals, valids) => Boolean(!valids || !valids.pw || !valids.name)
          }
        />
        <ListForm
          defaultValue={ props.defaultValue.cities }
          __mrr={{ $log: [] }} 
          childProps={{
            __mrr: { 
              $log: [] 
            },
            fields: {
              state: {
                label: 'State/country',
                errors: {
                  'Too short': (val, vals) => {
                    return !val || (val.length < 2);
                  },
                },
              },
              city: {
                label: 'City',
                errors: {
                  'Empty': not,
                }
              }
            },
           errors: {
             'Please select city or state': (vals, valids) => {
                return !vals || (!vals.city && !vals.state);
              }
           }
        }} 
        { ...connectAs('cities') } 
        errors={{
          'Too few cities': (val, vals, valids, num) => num < 2
        }}/>
      { state.errorShown && <div className="error">
        { state.currentError }
      </div> }
      <button onClick={ $('clear') }>Clear</button>&nbsp;&nbsp;&nbsp;
      <button className="my-submit" onClick={ $('submit') }>Submit</button>
  </div>);
}, Form);


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

class MyElement extends React.Component {
  render(){
    return <div>
      <MyForm errors={{
        'Too easy': (val, vals, valids) => {
          //console.log('TE', val, vals, valids);
          return true;
        }
      }} defaultValue={ initVals } />
    </div>;
  }
}

export default MyForm;