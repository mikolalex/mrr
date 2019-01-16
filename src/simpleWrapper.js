import Mrr from './mrr';

import cellMacros from './operators';
import { defDataTypes } from './dataTypes';

const simpleWrapper = (struct, macros = {}, dataTypes = {}) => {
    const availableMacros = Object.assign({}, cellMacros, macros);
    const availableDataTypes = Object.assign({}, defDataTypes, dataTypes);
    const handlers = {};
    const obj = new Mrr(struct, {}, (update) => {
        for(let cell in update){
            if(handlers[cell]){
                for(let f of handlers[cell]){
                    f(update[cell]);
                }
            }
        }
    }, availableMacros, availableDataTypes);
    return {
        set: (cell, val) => {
            obj.toState(cell, val)();
        },
        get: (cell) => {
            return obj.mrrState[cell];
        },  
        onChange: (cell, func) => {
            if(!handlers[cell]){
                handlers[cell] = [];
            }
            handlers[cell].push(func);
        }   
    }
}

export { simpleWrapper };