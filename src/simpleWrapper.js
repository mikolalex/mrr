import Mrr from './mrr';

import cellMacros from './operators';
import { defDataTypes } from './dataTypes';

const simpleWrapper = (struct, meta = {}) => {
    const availableMacros = Object.assign({}, cellMacros, meta.macros);
    const availableDataTypes = Object.assign({}, defDataTypes, meta.dataTypes);
    const handlers = {};
    const obj = new Mrr(struct, meta.props || {}, {
        setOuterState: (update) => {
            for(let cell in update){
                if(handlers[cell]){
                    for(let f of handlers[cell]){
                        f(update[cell]);
                    }
                }
            }
        },
        macros: availableMacros,
        dataTypes: availableDataTypes,
        strict: meta.strict,
    });
    obj.onMount();
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
        },        
		connect: (child_struct, as, up, down) => {
            const props = { mrrConnect: obj.mrrConnect(as, up, down) };
            return simpleWrapper(child_struct, { props }); 
		}
    }
}

export { simpleWrapper };
