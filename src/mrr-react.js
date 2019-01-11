import React from 'react';

import cellMacros from './operators';
import MrrCore, { skip } from './mrr';
import { merge } from './gridMacros';

export const isOfType = (val, type, dataTypes) => dataTypes[type] ? dataTypes[type](val) : false;

const defDataTypes = {
    'array': {
        check: a => a instanceof Array,
    },
    'object': {
        check: a => a instanceof Object,
    },
    'func': {
        check: a => a instanceof Function,
    },
    'int': {
        check: a => typeof a === 'number',
    },
    'string': {
        check: a => typeof a === 'string',
    },
    'pair': {
        check: a => (a instanceof Array) && (a.length === 2),
        extends: ['array'],
    },
    'coll_update': {
        check: (a, types) => (
            a instanceof Array 
            && (a.length === 2) 
            && isOfType(a[0], 'object', types)
            && isOfType(a[1], 'object_or_int', types)
        )
    },
    'array_or_object': {
        check: a => a instanceof Object,
        extends: ['array', 'object'],
    },
    'object_or_int': {
        check: a => (a instanceof Object) || (typeof a === 'number'),
        extends: ['int', 'object'],
    },
}





const getWithMrr = (GG, macros, dataTypes) => (mrrStructure, render = null, parentClass = null) => {
    let mrrParentClass = mrrStructure;
    const parent = parentClass || React.Component;
    render = render || parent.prototype.render || (() => null);
    const cls = class Mrr extends parent {
        constructor(props, already_inited = false) {
            super(props, 'AI');
            this.props = props;
            if(already_inited !== 'AI'){
                const struct = this.getMrrStruct();
                this.mrr = new MrrCore(struct, props, a => this.setState(a), macros, dataTypes, GG);
                this.mrr.reactWrapper = this;
                this.state = this.mrr.initialState;
            }
        }
        componentDidMount(){
            this.mrr.onMount();
        }
        
        componentWillUnmount(){
            this.mrr.onUnmount();
        }
        __mrrGetComputed(){
            const parent_struct = parent.prototype.__mrrGetComputed
              ? parent.prototype.__mrrGetComputed.apply(this)
              : {};
            return merge(mrrStructure instanceof Function ?  mrrStructure(this.props || {}) : mrrStructure, parent_struct);
        }
		getMrrStruct(){
			if(!this.props){
				return this.__mrrGetComputed();
			}
			return merge(this.props.__mrr, this.__mrrGetComputed());
		}
        render(){
            const self = this;
            const jsx = render.call(this, this.state, this.props, this.mrr.toState.bind(this.mrr), (as, up, down) => ({ mrrConnect: this.mrr.mrrConnect(as, up, down)}), () => {
                self.mrr.__mrr.getRootHandlersCalled = true;
                const props = {
                    id: '__mrr_root_node_n' + self.mrr.__mrr.id,
                }
                for(let event_type in self.mrr.__mrr.root_el_handlers){
                    props['on' + event_type] = e => {
                        for(let [selector, handler, cell] of self.mrr.__mrr.root_el_handlers[event_type]){
                            if(e.target.matches('#__mrr_root_node_n' + self.mrr.__mrr.id + ' ' + selector)){
                                const value = handler(e);
                                self.mrr.setState({[cell]: value});
                            }
                        }
                    }
                }
                return props;
            });
            if(this.mrr.__mrr.usesEventDelegation && !this.mrr.__mrr.getRootHandlersCalled){
                console.warn('Looks like you forget to call getRootHandlers when using event delegation');
            }
            return jsx;
        }
    }
    return cls;
}

export const withMrr = getWithMrr(null, cellMacros, defDataTypes);

const def = withMrr({}, null, React.Component);
def.skip = skip;

export { skip };

const initGlobalGrid = (struct, availableMacros, availableDataTypes) => {
    const GG = new MrrCore(struct, {}, () => {}, availableMacros, availableDataTypes, true);
    GG.__mrr.subscribers = [];
    return GG;
}

export const createMrrApp = (conf) => {
    const availableMacros = Object.assign({}, cellMacros, conf.macros || {});
    const availableDataTypes = Object.assign({}, defDataTypes, conf.dataTypes || {});
    const GG = conf.globalGrid ? initGlobalGrid(conf.globalGrid, availableMacros, availableDataTypes) : null;
    const withMrr = getWithMrr(GG, availableMacros, availableDataTypes);
    return {
        withMrr,
        skip,
        GG,
    }
}

export default def;
