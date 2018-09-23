import React from 'react';

import defMacros from './defMacros';

// if polyfill used
const isPromise = a => a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;

const cell_types = ['funnel', 'closure', 'nested', 'async'];
let global_macros = {};

const log_styles_cell = 'background: #898cec; color: white; padding: 1px;';
const log_styles_mount = 'background: green; color: white; padding: 1px;';

export const skip = new function MrrSkip(){};

export const registerMacros = (name, func) => {
    global_macros[name] = func;
}

const isUndef = a => (a === null || a === undefined);

export const shallow_equal = (a, b) => {
    if(a instanceof Object){
        if(!b) return false;
        if(a instanceof Function){
            return a.toString() === b.toString();
        }
        for(let k in a){
            if(!(a.hasOwnProperty(k))){
                continue;
            }
            if(a[k] !== b[k]){
                return false;
            }
        }
        for(let k in b){
            if(!(b.hasOwnProperty(k))){
                continue;
            }
            if(a[k] !== b[k]){
                return false;
            }
        }
        return true;
    }
    return a == b;
}

const updateOtherGrid = (grid, as, key, val) => {
    const his_cells = grid.__mrr.linksNeeded[as][key];
    for(let cell of his_cells){
        grid.setState({[cell]: val});
    }
}

const swapObj = a => {
    const b = {};
    for(let k in a){
        b[a[k]] = k;
    }
    return b;
}

const joinAsObject = (target_struct, parent, child, key) => {
    if(parent && child && parent[key] && child[key]) {
        target_struct[key] = Object.assign({}, parent[key], child[key]);
    }
}
const joinAsArray = (target_struct, parent, child, key) => {
    if(parent && child && parent[key] && child[key]) {
        target_struct[key] = [...parent[key], ...child[key]];
    }
}

const mrrJoin = (child_struct = {}, parent_struct = {}) => {
    const struct = Object.assign({}, parent_struct, child_struct);
    joinAsObject(struct, parent_struct, child_struct, '$init');
    joinAsArray(struct, parent_struct, child_struct, '$readFromDOM');
    joinAsArray(struct, parent_struct, child_struct, '$expose');
    for(let k in struct){
        if(k[0] === '+'){
            const real_k = k.substr(1);
            if(!struct[real_k]){
                struct[real_k] = struct[k];
            } else {
                struct[real_k] = ['join', struct[k], struct[real_k]];
            }
            delete struct[k];
        }
    }
    return struct;
}

const objMap = (obj, func) => {
    const res = {};
    for(let i in obj){
        const [val, key] = func(obj[i], i);
        res[key] = val;
    }
    return res;
}

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

const isMatchingType = (master_type, slave_type, types, actions) => {
    if(master_type === slave_type) {
        actions.matches ? actions.matches() : null;
        return;
    }
    if(!types[slave_type]){
        debugger;
    }
    let matches = false;
    if(types[master_type].extends){
        for(let parent_type of types[master_type].extends){
            isMatchingType(parent_type, slave_type, types, {
                matches: () => {
                    actions.matches();
                    matches = true;
                },
            });
        }
    }
    if(matches) return;
    let maybe = false;
    if(types[slave_type].extends){
        for(let parent_type of types[slave_type].extends){
            isMatchingType(master_type, parent_type, types, {
                matches: () => {
                    if(types[slave_type].extends.length > 1){
                        actions.matches ? actions.matches() : null;
                    } else {
                        actions.maybe ? actions.maybe() : null;
                    }
                    maybe = true;
                },
                maybe: () => {
                    actions.maybe ? actions.maybe() : null;
                    maybe = true;
                }
            })
        }
    }
    if(maybe) return;
    actions.not ? actions.not() : null;
}

const type_delimiter = ': ';

let ids = 0;

const html_aspects = {
    val: () => {
        return ['Change', e => e.target.value];
    },
    click: () => {
        return ['Click', e => e];
    },
}

const getWithMrr = (GG, macros, dataTypes) => (mrrStructure, render = null, parentClass = null, isGlobal = false) => {
    let mrrParentClass = mrrStructure;
    const parent = parentClass || React.Component;
    render = render || parent.prototype.render || (() => null);
    mrrParentClass = class MyMrrComponent extends parent {
        __mrrGetComputed(){
            const parent_struct = parent.prototype.__mrrGetComputed
              ? parent.prototype.__mrrGetComputed.apply(this)
              : {};
            return mrrJoin(this.props.__mrr, mrrJoin(mrrStructure instanceof Function ?  mrrStructure(this.props || {}) : mrrStructure, parent_struct));
        }
        render(){
            const self = this;
            const jsx = render.call(this, this.state, this.props, this.toState.bind(this), as => ({ mrrConnect: this.mrrConnect(as)}), () => {
                self.__mrr.getRootHandlersCalled = true;
                const props = {
                    id: '__mrr_root_node_n' + self.__mrr.id,
                }
                for(let event_type in self.__mrr.root_el_handlers){
                    props['on' + event_type] = e => {
                        for(let [selector, handler, cell] of self.__mrr.root_el_handlers[event_type]){
                            if(e.target.matches('#__mrr_root_node_n' + self.__mrr.id + ' ' + selector)){
                                const value = handler(e);
                                self.setState({[cell]: value}, null, null, true);
                            }
                        }
                    }
                }
                return props;
            });
            if(this.__mrr.usesEventDelegation && !this.__mrr.getRootHandlersCalled){
                console.warn('Looks like you forget to call getRootHandlers when using event delegation');
            }
            return jsx;
        }
    }
    const cls = class Mrr extends mrrParentClass {
        constructor(props, context, already_inited, isGG) {
            super(props, context, true);
            if(already_inited) {
              //return;
            }
            if(isGG) {
              this.isGG = true;
            }
            this.props = props || {};
            this.__mrr = {
                id: ++ids,
                closureFuncs: {},
                children: {},
                childrenCounter: 0,
                anonCellsCounter: 0,
                linksNeeded: {},
                constructing: true,
                thunks: {},
                skip,
                expose: {},
                signalCells: {},
                dataTypes: {},
                dom_based_cells: {},
                root_el_handlers: {},
                alreadyInitedLinkedCells: {},
            };
            if(props && props.extractDebugMethodsTo){
                props.extractDebugMethodsTo.getState = () => {
                    return this.mrrState;
                }
                props.extractDebugMethodsTo.self = this;
            }
            if(!this.__mrr.valueCells){
                this.__mrr.valueCells = {};
            }
            this.__mrr.realComputed = Object.assign({}, objMap(this.__mrrGetComputed(), (val, key) => {
                if(key[0] === '~'){
                    key = key.substr(1);
                    this.__mrr.signalCells[key] = true;
                }
                if(key[0] === '='){
                    key = key.substr(1);
                    this.__mrr.valueCells[key] = true;
                }
                if(key.indexOf(type_delimiter) !== -1){
                    let type;
                    [key, type] = key.split(type_delimiter);
                    this.setCellDataType(key, type);
                }
                return [val, key];
            }));
            this.parseMrr();
            if(GG){
                if(this.__mrr.linksNeeded['^']){
                    GG.__mrr.subscribers.push(this);
                    this.checkLinkedCellsTypes(this, GG, '^');
                    for(let a in this.__mrr.linksNeeded['^']){
                        const child_cells = this.__mrr.linksNeeded['^'][a];
                        const val = GG.mrrState[a];
                        for(let cell of child_cells){
                            this.mrrState[cell] = val;
                        }
                    }
                }
                this.checkLinkedCellsTypes(GG, this, '*');
            }
            this.state = this.initialState;
            if(this.props.mrrConnect){
                this.props.mrrConnect.subscribe(this);
            }
            this.__mrr.constructing = false;
        }
        componentDidMount(){
            this.setState({
                $start: true,
            });
        }
        
        componentWillUnmount(){
            this.setState({$end: true});
            if(this.__mrrParent){
                delete this.__mrrParent.__mrr.children[this.__mrrLinkedAs];
            }
            if(GG && this.__mrr.linksNeeded['^']){
                const i = GG.__mrr.subscribers.indexOf(this);
                delete GG.__mrr.subscribers[i];
            }
        }
        get __mrrMacros(){
            return Object.assign({}, macros, global_macros);
        }
        get __mrrPath(){
            return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : (this.isGG ? 'GG' : 'root');
        }
        setCellDataType(cell, type){
            if(!dataTypes[type]){
                throw new Error('Undeclared type: ' + type);
            }
            cell = cell[0] === '-' ? cell.slice(1) : cell;
            if(!this.__mrr.dataTypes[cell]){
                this.__mrr.dataTypes[cell] = type;
            } else {
                if(this.__mrr.dataTypes[cell] !== type){
                    throw new Error("Different type annotation for the same cell found: " + this.__mrr.dataTypes[cell] + ', ' + type + ' for cell "' + cell + '"')
                }
            }
        }
        parseRow(row, key, depMap){
            if(key === "$log") return;
            for(let k in row){
                var cell = row[k];
                if((cell === '^') || (cell === skip)){
                    // prev val of cell or "no cell"
                    continue;
                }
                if(k === '0') {
                    if(!(cell instanceof Function) && (!cell.indexOf ||  (cell.indexOf('.') === -1) && (cell_types.indexOf(cell) === -1))){
                        // it's macro
                        if(!this.__mrrMacros[cell]){
                            throw new Error('Macros ' + cell + ' not found!');
                        }
                        var new_row = this.__mrrMacros[cell](row.slice(1));
                        this.__mrr.realComputed[key] = new_row;
                        this.parseRow(new_row, key, depMap);
                        return;
                    }
                    continue;
                }
                if(cell instanceof Function) continue;
                if(cell instanceof Array) {
                    // anon cell
                    const anonName = '@@anon' + (++this.__mrr.anonCellsCounter);
                    this.__mrr.realComputed[anonName] = cell;
                    const rowCopy = this.__mrr.realComputed[key].slice();
                    rowCopy[k] = anonName;
                    this.__mrr.realComputed[key] = rowCopy;
                    this.parseRow(cell, anonName, depMap);
                    cell = anonName;
                }
                
                if(cell.indexOf(type_delimiter) !== -1){
                    let type;
                    [cell, type] = cell.split(type_delimiter);
                    row[k] = cell;
                    this.setCellDataType(cell, type);
                }
                
                if(cell.indexOf('|') !== -1){
                    this.__mrr.usesEventDelegation = true;
                    const real_cell = cell[0] === '-' ? cell.slice(1) : cell;
                    if(!this.__mrr.dom_based_cells[real_cell]) {
                        const [selector, aspect] = real_cell.split('|').map(a => a.trim());
                        const [event_type, handler] = html_aspects[aspect]();
                        if(!this.__mrr.root_el_handlers[event_type]){
                            this.__mrr.root_el_handlers[event_type] = [];
                        }
                        this.__mrr.root_el_handlers[event_type].push([selector, handler, real_cell]);
                        
                        
                        this.__mrr.dom_based_cells[real_cell] = true;
                    }
                }
                
                if(cell.indexOf('/') !== -1){
                    let [from, parent_cell] = cell.split('/');
                    if(from[0] === '~'){
                        from = from.slice(1);
                    }
                    if(!this.__mrr.linksNeeded[from]){
                        this.__mrr.linksNeeded[from] = {};
                    }
                    if(!this.__mrr.linksNeeded[from][parent_cell]){
                        this.__mrr.linksNeeded[from][parent_cell] = [];
                    }
                    if(this.__mrr.linksNeeded[from][parent_cell].indexOf(cell) === -1){
                        this.__mrr.linksNeeded[from][parent_cell].push(cell);
                    }
                } else {
                    this.mentionedCells[cell[0] === '-' ? cell.slice(1) : cell] = true;
                }
                if(cell[0] === '-'){
                    // passive listening
                    continue;
                }
                if(!depMap[cell]){
                    depMap[cell] = [];
                }
                depMap[cell].push(key);
            }
        }
        parseMrr(){
            const depMap = {};
            this.mentionedCells = {};
            const mrr = this.__mrr.realComputed;
            this.mrrState = Object.assign({}, this.state);
            const updateOnInit = {};
            for(let key in mrr){
                let fexpr = mrr[key];
                if(key === '$log') continue;
                if(fexpr === skip) continue;
                if(key === '$meta') continue;
                if(key === '$init'){
                    let init_vals = mrr[key] instanceof Function ? mrr[key](this.props) : mrr[key];
                    for(let cell in init_vals){
                        this.__mrrSetState(cell, init_vals[cell], []);
                        updateOnInit[cell] = init_vals[cell];
                    }
                    continue;
                }
                if(key === "$expose") {
                    if(fexpr instanceof Array) {
                        let obj = {};
                        for(let k in fexpr) {
                            obj[fexpr[k]] = fexpr[k];
                        }
                        this.__mrr.expose = obj;
                    } else {
                        this.__mrr.expose = swapObj(fexpr);
                    }
                    continue;
                };
                if(key === "$readFromDOM") {
                    this.__mrr.readFromDOM = {};
                    for(let item of fexpr){
                        this.__mrr.readFromDOM[item] = true;
                    }
                    continue;
                };
                if(!(fexpr instanceof Array)){
                    if(typeof fexpr === 'string'){
                        // another cell
                        fexpr = [a => a, fexpr];
                        this.__mrr.realComputed[key] = fexpr;
                    } else {
                        // dunno
                        console.warn('Strange F-expr:', fexpr);
                        continue;
                    }
                }
                this.parseRow(fexpr, key, depMap);
            }
            this.initialState = updateOnInit;
            this.mrrDepMap = depMap;
            if(this.__mrr.readFromDOM){
                for(let cn in this.mentionedCells){
                    if(
                        !this.__mrr.realComputed[cn] 
                        && !this.__mrr.readFromDOM[cn] 
                        && (cn.indexOf('.') === -1)
                        && (cn !== '$start')
                        && (cn !== '$end')
                    ){
                        throw new Error('Linking to undescribed cell: ' + cn);
                    }
                }
            }
        }
        setStateFromEvent(key, e){
            var val;
            switch(e.target.type){
                case 'checkbox':
                    val = e.target.checked;
                break;
                default:
                    val = e.target.value;
                break;
            }
            this.setState({[key]: val});
        }
        toStateAs(key, val){
            this.setState({[key]: val}, null, null, true);
        }
        checkLinkedCellsTypes(a, b, linked_as){
            for(let v in a.__mrr.linksNeeded[linked_as]){
                const needed_cells = a.__mrr.linksNeeded[linked_as][v];
                for(let cell of needed_cells){
                    if(a.__mrr.dataTypes[cell] && b.__mrr.dataTypes[v] && (
                        isMatchingType(b.__mrr.dataTypes[v], a.__mrr.dataTypes[cell], dataTypes, {
                            not: () => {
                                throw new Error('Types mismatch! ' + a.__mrr.dataTypes[cell] + ' vs. ' + b.__mrr.dataTypes[v] + ' in ' + cell);
                            },
                            maybe: () => {
                                console.warn('Not fully compliant types: expecting ' + a.__mrr.dataTypes[cell] + ', got ' + b.__mrr.dataTypes[v]);
                            },
                        })
                    )) {
                    }
                }
            }
        }
        mrrConnect(as){
            const self = this;
            if(isUndef(as)){
                as = '__rand_child_name_' + (++this.__mrr.childrenCounter);
            }
            return {
                subscribe: (child) => {
                    child.$name = as;
                    child.state.$name = as;
                    this.__mrr.children[as] = child;
                    child.__mrrParent = self;
                    child.__mrrLinkedAs = as;
                    for(let a in child.__mrr.linksNeeded['..']){
                        const child_cells = child.__mrr.linksNeeded['..'][a];
                        const val = self.mrrState[a];
                        for(let cell of child_cells){
                            child.mrrState[cell] = val;
                        }
                    }
                    this.checkLinkedCellsTypes(child, this, '..');
                    this.checkLinkedCellsTypes(this, child, as);
                    this.checkLinkedCellsTypes(this, child, '*');
                    if(this.__mrr.realComputed.$log
                       && (
                           (this.__mrr.realComputed.$log === true) 
                           ||
                           (this.__mrr.realComputed.$log.showMount)
                          )
                    ){
                        if(this.__mrr.realComputed.$log === 'no-colour'){
                          console.log('CONNECTED: ' + (this.$name || '/') + as);
                        } else {
                          console.log('%c CONNECTED: ' + (this.$name || '/') + as, log_styles_mount);
                        }
                    }   
                }
            }
        }
        toState(key, val){
            if(this.__mrr.readFromDOM && !this.__mrr.readFromDOM[key]){
                throw new Error('MRERR_101: trying to create undescribed stream: ' + key, this.__mrr.readFromDOM);
            }
            if(val === undefined && this.__mrr.thunks[key]){
                //console.log('=== skip');
                return this.__mrr.thunks[key];
            } else {
                //console.log('=== generate');
                const func = (a) => {
                    let value;
                    if(val !== undefined){
                        if(val instanceof Function){
                            value = val(a);
                        } else {
                            value = val;
                        }
                    } else {
                        if(a && a.target && a.target.type){
                            if(a.target.type === 'checkbox'){
                                value = a.target.checked;
                            } else {
                                a.preventDefault();
                                if(a.target.type === 'submit'){
                                    value = true;
                                } else {
                                    value = a.target.value;
                                }
                            }
                        } else {
                            value = a;
                        }
                    }
                    if(value === skip){
                        return;
                    }
                    if(key instanceof Array){
                        const ns = {};
                        key.forEach(k => {
                            ns[k] = value;
                        })
                        this.setState(ns, null, null, true);
                    } else {
                        this.setState({[key]: value}, null, null, true);
                    }
                }
                if(val === undefined){
                    this.__mrr.thunks[key] = func;
                }
                return func;
            }
        }
        __getCellArgs(cell){
            const arg_cells = this.__mrr.realComputed[cell]
                .slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2)
                .filter(a => a !== skip);
            const res = arg_cells.map((arg_cell => {
                if(arg_cell === '^'){
                    //console.log('looking for prev val of', cell, this.mrrState, this.state);
                    return this.mrrState[cell];
                } else {
                    if(arg_cell[0] === '-'){
                        arg_cell = arg_cell.slice(1);
                    }
                    if(arg_cell === '$name'){
                      return this.$name;
                    }
                    if(arg_cell === '$props'){
                      return this.props;
                    }
                    return ((this.mrrState[arg_cell] === undefined) && this.state && this.__mrr.constructing)
                        ? this.initialState[arg_cell]
                        : this.mrrState[arg_cell]
                }
            }));
            return res;
        }
        __mrrUpdateCell(cell, parent_cell, update, parent_stack){
            var val, func, args, updateNested, types = [];
            const superSetState = super.setState;
            const updateFunc = val => {
                if(val === skip) {
                    return;
                }
                this.__mrrSetState(cell, val, parent_cell, parent_stack);
                const update = {};
                update[cell] = val;
                this.checkMrrCellUpdate(cell, update, parent_stack, val);
                superSetState.call(this, update, null, true);
            }
            const fexpr = this.__mrr.realComputed[cell];
            if(typeof fexpr[0] === 'string'){
                types = fexpr[0].split('.');
            }

            if(types.indexOf('nested') !== -1){
                updateNested = (subcell, val) => {
                    if(subcell instanceof Object){
                        for(let k in subcell){
                            updateNested(k, subcell[k]);
                        }
                        return;
                    }
                    const subcellname = cell + '.' + subcell;
                    const stateSetter = mrrParentClass.prototype.setState || (() => {});
                    this.__mrrSetState(subcellname, val, parent_cell, parent_stack);
                    const update = {};
                    update[subcellname] = val;
                    this.checkMrrCellUpdate(subcellname, update, parent_stack, val);
                    stateSetter.call(this, update, null, true);
                    const nested_update = {
                        [cell]: this.mrrState[cell] instanceof Object ? this.mrrState[cell] : {}
                    }
                    nested_update[cell][subcell] = val;
                    stateSetter.call(this, nested_update, null, true);
                }
            }

            if(fexpr[0] instanceof Function){
                func = this.__mrr.realComputed[cell][0];
                args = this.__getCellArgs(cell);

                val = func.apply(null, args);
            } else {
                if(types.indexOf('funnel') !== -1){
                    args = [parent_cell, this.mrrState[parent_cell], this.mrrState[cell]];
                } else {
                    args = this.__getCellArgs(cell);
                }
                if(types.indexOf('nested') !== -1){
                    args.unshift(updateNested)
                }
                if(types.indexOf('async') !== -1){
                    args.unshift(updateFunc)
                }
                if(types.indexOf('closure') !== -1){
                    if(!this.__mrr.closureFuncs[cell]){
                        const init_val = this.mrrState[cell];
                        this.__mrr.closureFuncs[cell] = fexpr[1](init_val);
                    }
                    func = this.__mrr.closureFuncs[cell];
                } else {
                    func = this.__mrr.realComputed[cell][1];
                }
                if(!func || !func.apply) {
                    throw new Error('MRR_ERROR_101: closure type should provide function');
                }
                try {
                  val = func.apply(null, args);
                } catch (e) {
                    if(this.__mrr.realComputed['$err.' + cell]){
                        this.setState({['$err.' + cell]: e});
                    } else {
                        if(this.__mrr.realComputed.$err){
                            this.setState({$err: e});
                        } else {
                            throw e;
                        }
                    }
                    return;
                }
            }
            if(this.__mrr.dataTypes[cell] && (val !== skip)){
                if(!dataTypes[this.__mrr.dataTypes[cell]]){
                    throw new Error('Undeclared type: ' + this.__mrr.dataTypes[cell] + " for cell " + cell);
                }
                if(!(dataTypes[this.__mrr.dataTypes[cell]].check(val, dataTypes))){
                    throw new Error('Wrong data type for cell ' + cell + ': ' + val + ', expecting ' + this.__mrr.dataTypes[cell]);
                }
            }
            if(types && (types.indexOf('nested') !== -1)){
                if(val instanceof Object){
                    for(let k in val){
                        updateNested(k, val[k]);
                    }
                }
                return;
            }
            if(types && (types.indexOf('async') !== -1)){
                // do nothing!
                return;
            }
            const current_val = this.mrrState[cell];
            if(this.__mrr.valueCells[cell] && shallow_equal(current_val, val)){
                //console.log('Duplicate', cell, val, this.__mrr.valueCells);
                return;
            }
            if(isPromise(val)){
                val.then(updateFunc)
            } else {
                if(val === skip) {
                    return;
                }
                update[cell] = val;
                this.__mrrSetState(cell, val, parent_cell, parent_stack);
                this.checkMrrCellUpdate(cell, update, parent_stack, val);
            }
        }
        checkMrrCellUpdate(parent_cell, update, parent_stack = [], val){
            if(this.mrrDepMap[parent_cell]){
                for(let cell of this.mrrDepMap[parent_cell]){
                    const next_parent_stack = this.__mrr.realComputed.$log ? [...parent_stack, [parent_cell, val]] : parent_stack;
                    this.__mrrUpdateCell(cell, parent_cell, update, next_parent_stack);
                }
            }
        }
        __mrrSetState(key, val, parent_cell, parent_stack){
            //@ todo: omit @@anon cells
            if(this.__mrr.realComputed.$log 
                && (key[0] !== '@')
            ) {
                if(
                    (this.__mrr.realComputed.$log === true)
                    ||
                    ((this.__mrr.realComputed.$log instanceof Array) && (this.__mrr.realComputed.$log.indexOf(key) !== -1))
                    ||
                    (this.__mrr.realComputed.$log.cells && (this.__mrr.realComputed.$log.cells.indexOf(key) !== -1))
                ){
                    if(this.__mrr.realComputed.$log === 'no-colour'){
                      console.log(key, val);
                    } else {
                      const logArgs = ['%c ' + this.__mrrPath + '::' + key,
                        //+ '(' + parent_cell +') ',
                        log_styles_cell,
                        val
                      ];
                      if(this.__mrr.realComputed.$log.showStack){
                          logArgs.push(JSON.stringify(parent_stack))
                      }
                      console.log.apply(console, logArgs);
                    }
                }
            }
            this.mrrState[key] = val;
            
            if(isGlobal){
                if(this.__mrr.subscribers){
                    for(let sub of this.__mrr.subscribers){
                        if(sub && sub.__mrr.linksNeeded['^'][key]){
                            updateOtherGrid(sub, '^', key, this.mrrState[key]);
                        }
                    }
                }
            } else {
                for(let as in this.__mrr.children){
                    if(    this.__mrr.children[as].__mrr.linksNeeded['..']
                        && this.__mrr.children[as].__mrr.linksNeeded['..'][key]
                        && (val === this.mrrState[key])
                    ){
                        updateOtherGrid(this.__mrr.children[as], '..', key, this.mrrState[key]);
                    }
                }
                let as  = this.__mrrLinkedAs;
                if(    this.__mrrParent
                    && this.__mrrParent.__mrr.linksNeeded[as]
                    && this.__mrrParent.__mrr.linksNeeded[as][key]
                    && (val === this.mrrState[key])
                ){
                    updateOtherGrid(this.__mrrParent, as, key, this.mrrState[key]);
                }
                if(    this.__mrrParent
                    && this.__mrrParent.__mrr.linksNeeded['*']
                    && this.__mrrParent.__mrr.linksNeeded['*'][key]
                    && (val === this.mrrState[key])
                ){
                    updateOtherGrid(this.__mrrParent, '*', key, this.mrrState[key]);
                }
                if(    this.__mrr.expose
                    && this.__mrr.expose[key]
                    && GG
                    && GG.__mrr.linksNeeded['*']
                    && GG.__mrr.linksNeeded['*'][this.__mrr.expose[key]]
                    && (val === this.mrrState[key])
                ){
                    updateOtherGrid(GG, '*', this.__mrr.expose[key], this.mrrState[key]);
                }
            }
        }
        getUpdateQueue(cell){

        }
        setState(ns, cb, alreadyRun, topLevel){
            if(!(ns instanceof Object)) {
                ns = ns.call(null, this.state, this.props);
            }
            const update = Object.assign({}, ns);
            if(!alreadyRun){
              for(let cell in update){
                  this.__mrrSetState(cell, update[cell], null, []);
              }
              for(let parent_cell in update){
                  this.checkMrrCellUpdate(parent_cell, update);
              }
            }
            if(!this.__mrr.constructing){
                return (mrrParentClass.prototype.setState || (() => {})).call(this, update, cb, true);
            } else {
                for(let cell in update){
                    this.initialState[cell] = update[cell];
                }
            }
        }

    }
    return cls;
}

export const withMrr = getWithMrr(null, defMacros, defDataTypes);

const def = withMrr({}, null, React.Component);
def.skip = skip;

const initGlobalGrid = (struct, availableMacros, availableDataTypes) => {
    class GlobalGrid {
        __mrrGetComputed(){
            return struct;
        }
    }
    const GwithMrr = getWithMrr(null, availableMacros, availableDataTypes);
    const GlobalGridClass = GwithMrr(null, null, GlobalGrid, true);
    const GG = new GlobalGridClass(null, null, null, true);
    GG.__mrr.subscribers = [];
    return GG;
}

export const createMrrApp = (conf) => {
    const availableMacros = Object.assign({}, defMacros, conf.macros || {});
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
