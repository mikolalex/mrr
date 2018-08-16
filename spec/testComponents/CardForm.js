import React from 'react';
import { withMrr, skip } from '../../src';
import { Input, Form, ListForm, TimeForm } from '../../src/Form';

const not = a => !a;
const incr = a => a + 1;
const always = a => _ => a;
const id = a => a;

const concat = function(){
  //console.log('concat', arguments);
  return Array.prototype.join.call(arguments, '');
}

const num3 = val => val.match(/^\d{0,3}$/);
const num4 = val => val.match(/^\d{0,4}$/);

const defVal = {
  "number": "12321231111112",
  "expires": "01/19",
  "cvv": "349"
};

class CardForm extends React.Component {
    render(){
        return <Form 
            disableWhenValidated={ true }
            extractDebugMethodsTo={ this.props.dbg1 }
            __mrr={{ 
              //$log: ['disabled', 'somethingIsChecked'], 
            }} defaultValue={ defVal } fields={{
            number: {
              extractDebugMethodsTo: this.props.dbg2,
              label: 'Enter card number',
              validateOnlyAfterSubmit: true,
              type: Form,
              assemble: ({ d1, d2, d3, d4 }) => concat(d1, d2, d3, d4),
              disassemble: num => ({
                d1: num.slice(0, 4),
                d2: num.slice(4, 8),
                d3: num.slice(8, 12),
                d4: num.slice(12, 16),
              }),
              __mrr: {
                //$log: true,
              },
              errors: {
                'Please enter card number': (vals = {}) => {
                  return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve(concat(vals.d1, vals.d2, vals.d3, vals.d4).length !== 16);
                    }, 500);
                  })
                },
                'Wrond mask': (vals = {}) => {
                  return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve(false);
                    }, 400);
                  })
                },
              },
              fields: {
                d1: {
                  filter: num4
                },
                d2: {
                  filter: num4
                },
                d3: {
                  filter: num4
                },
                d4: {
                  filter: num4
                },
              }
            },
            expires: {
              label: 'Valid until',
              type: Form,
              assemble: ({ month, year }) => month && year ? (month + '/' + year) : null,
              disassemble: val => ({ month: val.split('/')[0], year: val.split('/')[1] }),
              fields: {
                month: {
                  type: 'select',
                  options: ['01', '02', '03'],
                },
                year: {
                  type: 'select',
                  getOptions: [() => {
                    return ['18', '19', '20'];
                  }, '$start'],
                }
              }
            },
            cvv: {
              label: 'CVV',
              filter: num3,
              type: 'password',
              errors: {
                'Empty': not
              }
            }
          }
        } />
    }
}

export default CardForm;

export { CardForm };