import React from 'react';

// if polyfill used
const isPromise = a => a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;

const cell_types = ['funnel', 'closure', 'nested', 'async'];
const isJustObject = a => (a instanceof Object) && !(a instanceof Array) && !(a instanceof Function);
let GG;
let global_macros = {};

export const skip = new function MrrSkip(){};

export const registerMacros = (name, func) => {
    global_macros[name] = func;
}

const isUndef = a => (a === null || a === undefined);

const always = a => _ => a;

const shallow_equal = (a, b) => {
    if(a instanceof Object){
        if(!b) return false;
        if(a instanceof Function){
            return a.toString() === b.toString();
        }
        for(let k in a){
            if(!(a.hasOwnProperty(k))){
                continue;
            }
            if(a[k] != b[k]){
                return false;
            }
        }
        return true;
    }
    return a == b;
}

const matches = (obj, subset) => {
    for(let k in subset){
        if(!shallow_equal(obj[k], subset[k])){
            return false;
        }
    }
    return true;
}

const updateOtherGrid = (grid, as, key, val) => {
    const his_cells = grid.__mrr.linksNeeded[as][key];
    for(let cell of his_cells){
        grid.setState({[cell]: val});
    }
}

const defMacros = {
    map: ([map]) => {
        var res = ['funnel', (cell, val) => {
            return map[cell] instanceof Function ? map[cell](val) : map[cell];
        }];
        for(let cell in map){
            res.push(cell);
        }
        return res;
    },
    list: ([map]) => {
        const res = ['funnel', (cell, val) => val];
        for(let type in map){
            if(type !== 'custom'){
                res.push([(...args) => [type, ...args], map[type]]);
            }
        }
        return [([type, changes], prev) => {
            let next = [...prev];
            switch(type){
                case 'update':
                    const [newProps, predicate] = changes;
                    if(!(predicate instanceof Object)){
                        // it's index
                        prev.map((item, i) => [i, item])
                        .filter(pair => Number(pair[0]) === Number(predicate))
                        .forEach(i => {
                            next[i[0]] = Object.assign({}, next[i[0]], newProps);
                        });
                    } else {
                        prev.map((item, i) => [i, item])
                        .filter(pair => matches(pair[1], predicate))
                        .forEach(i => {
                            next[i[0]] = Object.assign({}, next[i[0]], newProps);
                        });
                    }
                break;
                case 'delete':
                    next = next.filter((item, i) => {
                        if(changes instanceof Object){
                            return !matches(item, changes)
                        } else {
                            return Number(i) !== changes;
                        }
                    });
                break;
                case 'create':
                    next.push(changes);
                break;
            }
            return next;
        }, res, '^'];
    },
    merge: ([map, ...others]) => {
        if(isJustObject(map)){
            var res = ['funnel', (cell, val) => [cell, val], ...Object.keys(map)];
            return [([cell, val], ...otherArgs) => {
                return map[cell] instanceof Function ? map[cell](val, ...otherArgs) : map[cell];
            }, res, ...others];
        } else {
            let f = a => a;
            let args = [map, ...others]
            if(map instanceof Function){
                f = map;
                args = others;
            }
            return ['funnel', (cell, val) => f(val), ...args];
        }
    },
    toggle: ([setTrue, setFalse]) => {
            return ['funnel', (a,b) => b, [always(true), setTrue], [always(false), setFalse]]
    },
    split: ([map, ...argCells]) => {
        return ['nested', (cb, ...args) => {
            for(let k in map){
                const res = map[k].apply(null, args);
                if(res){
                    cb(k, res);
                }
            }
        }, ...argCells];
    },
  transist: (cells) => {
    return [(a, b) => {
        return a ? b : skip;
    }, ...cells];
  },
  closureMerge: ([initVal, map]) => {
    const cells = Object.keys(map);
    return ['closure.funnel', () => {
        return (cell, val) => {
          if(map[cell] instanceof Function){
            return initVal = map[cell].call(null, initVal, val);
          } else {
            return initVal= map[cell];
          }
        }
    }, ...cells];
  },
  closureMap: ([initVal, map]) => {
    const cells = Object.keys(map);
    return ['closure.funnel', () => {
        return (cell, val) => {
          if(map[cell] instanceof Function){
            return initVal = map[cell].call(null, initVal, val);
          } else {
            return initVal= map[cell];
          }
        }
    }, ...cells];
  },
    mapPrev: ([map]) => {
        var res = ['closure.funnel', (prev) => {
            return (cell, val) => {
                prev = map[cell] instanceof Function ? map[cell](prev, val) : map[cell];
                return prev;
            }
        }];
        for(let cell in map){
            res.push(cell);
        }
        return res;
    },
    join: ([...fields]) => ['funnel', (cell, val) => val, ...fields],
    '&&': ([a, b]) => {
        return [(a, b) => (a && b), a, b];
    },
    trigger: ([field, val]) => [a => a === val ? true : skip, field],
    skipSame: ([field]) => [(z, x) => shallow_equal(z, x) ? skip : z, field, '^'],
    skipIf: ([func, ...fields]) => {
      if(!fields.length) {
        fields = [func];
        func = a => a;
      }
      return [function(){
        const res = func.apply(null, arguments);
        return !res ? true : skip;
      }, ...fields]
    },
    turnsFromTo: ([from, to, cell]) => ['closure', () => {
        let prev_val;
        return (val) => {
            if((val === to) && (prev_val === from)){
                prev_val = val;
                return true;
            } else {
                prev_val = val;
                return skip;
            }
        }
    }, cell],
    skipN: ([field, n]) => ['closure', () => {
        let count = 0;
        n = n || 1;
        return (val) => {
            if(++count > n){
                return val;
            } else {
                return skip;
            }
        }
    }, field],
    accum: ([cell, time]) => {
        var res = time
        ? ['async.closure', () => {
            const vals = {};
            let c = 0;
            return (cb, val) => {
                vals[++c] = val;
                setTimeout(function(i){
                    delete vals[i];
                    cb(Object.values(vals));
                }.bind(null, c), time);
                cb(Object.values(vals));
            }
        }, cell]
        : ['closure', () => {
            const vals = [];
            return (val) => {
                vals.push(val);
                return vals;
            }
        }, cell];
        return res;
    }
}

export const withMrr = (mrrStructure, render = null, parentClass = null) => {
    let mrrParentClass = mrrStructure;
    const parent = parentClass || React.Component;
    render = render || parent.prototype.render || (() => null);
    mrrParentClass = class MyMrrComponent extends parent {
        __mrrGetComputed(){
            const parent_struct = parent.prototype.__mrrGetComputed
              ? parent.prototype.__mrrGetComputed.apply(this)
              : {};
            return Object.assign({}, parent_struct, mrrStructure instanceof Function ?  mrrStructure(this.props || {}) : mrrStructure);
        }
        render(){
            const self = this;
            return render.call(this, this.state, this.props, this.toState.bind(this), as => ({ mrrConnect: this.mrrConnect(as)}));
        }
    }
    return class Mrr extends mrrParentClass {
        constructor(props, context, already_inited) {
            super(props, context, true);
            if(already_inited) {
              //return;
            }
            this.props = props || {};
            this.__mrr = {
                closureFuncs: {},
                children: {},
                childrenCounter: 0,
                anonCellsCounter: 0,
                linksNeeded: {},
                realComputed: Object.assign({}, this.__mrrGetComputed()),
                constructing: true,
                thunks: {},
                skip,
                expose: {},
            };
            this.parseMrr();
            if(GG && this.__mrr.linksNeeded['^']){
                GG.__mrr.subscribers.push(this);
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
                $props: this.props,
            });
        }
        componentWillReceiveProps(nextProps){
            this.setState({$props: nextProps});
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
            return Object.assign({}, defMacros, global_macros);
        }
        get __mrrPath(){
            return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : 'root';
        }
        parseRow(row, key, depMap){
            if(key === "$log") return;
            for(let k in row){
                var cell = row[k];
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
                }
                if(cell === '^'){
                    // prev val of cell
                    continue;
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
            const mrr = this.__mrr.realComputed;
            this.mrrState = Object.assign({}, this.state);
            const updateOnInit = {};
            for(let key in mrr){
                let fexpr = mrr[key];
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
                        fexpr = obj;
                    }
                    this.__mrr.expose = fexpr;
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
            //console.log('parsed depMap', this.mrrDepMap);
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
        mrrConnect(as){
            const self = this;
            if(isUndef(as)){
                as = '__rand_child_name_' + (++this.__mrr.childrenCounter);
            }
            return {
                subscribe: (child) => {
                    child.$name = as;
                    this.__mrr.children[as] = child;
                    child.__mrrParent = self;
                    child.__mrrLinkedAs = as;
                }
            }
        }
        toState(key, val){
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
            const res = this.__mrr.realComputed[cell].slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2).map((arg_cell => {
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
                    return (this.mrrState[arg_cell] === undefined && this.state)
                        ? (this.__mrr.constructing
                            ? this.initialState[arg_cell]
                            : this.state[arg_cell]
                        )
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
                    const subcellname = cell + '.' + subcell;
                    this.__mrrSetState(subcellname, val, parent_cell, parent_stack);
                    const update = {};
                    update[subcellname] = val;
                    this.checkMrrCellUpdate(subcellname, update, parent_stack, val);
                    (mrrParentClass.prototype.setState || (() => {})).call(this, update, null, true);
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
            if(current_val == val){
                //console.log('DUPLICATE!', val);
                //return;
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
            const styles = 'background: #898cec; color: white; padding: 1px;';
            if(this.__mrr.realComputed.$log || 0) {
                if(
                    (this.__mrr.realComputed.$log && !(this.__mrr.realComputed.$log instanceof Array))
                    ||
                    ((this.__mrr.realComputed.$log instanceof Array) && (this.__mrr.realComputed.$log.indexOf(key) !== -1))
                ){
                    if(this.__mrr.realComputed.$log === 'no-colour'){
                      console.log(key, val);
                    } else {
                      console.log('%c ' + this.__mrrPath + '::' + key
                        //+ '(' + parent_cell +') '
                        , styles, val, parent_stack);
                      //if(!parent_stack) debugger;
                    }
                }
            }
            if(GG && GG === this){
                for(let sub of this.__mrr.subscribers){
                    if(sub && sub.__mrr.linksNeeded['^'][key]){
                        updateOtherGrid(sub, '^', key, val);
                    }
                }
            } else {
                for(let as in this.__mrr.children){
                    if(    this.__mrr.children[as].__mrr.linksNeeded['..']
                        && this.__mrr.children[as].__mrr.linksNeeded['..'][key]
                    ){
                        updateOtherGrid(this.__mrr.children[as], '..', key, val);
                    }
                }
                let as  = this.__mrrLinkedAs;
                if(    this.__mrrParent
                    && this.__mrrParent.__mrr.linksNeeded[as]
                    && this.__mrrParent.__mrr.linksNeeded[as][key]
                ){
                    updateOtherGrid(this.__mrrParent, as, key, val);
                }
                if(    this.__mrrParent
                    && this.__mrrParent.__mrr.linksNeeded['*']
                    && this.__mrrParent.__mrr.linksNeeded['*'][key]
                ){
                    updateOtherGrid(this.__mrrParent, '*', key, val);
                }
                if(    this.__mrr.expose
                    && this.__mrr.expose[key]
                    && GG
                    && GG.__mrr.linksNeeded['*']
                    && GG.__mrr.linksNeeded['*'][this.__mrr.expose[key]]
                ){
                    updateOtherGrid(GG, '*', this.__mrr.expose[key], val);
                }
            }
            this.mrrState[key] = val;
        }
        getUpdateQueue(cell){

        }
        setState(ns, cb, alreadyRun, topLevel){
            if(topLevel){
                //console.log('SSSSS', ns);
            }
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
}

const def = withMrr({}, null, React.Component);
def.skip = skip;

export const initGlobalGrid = (struct, force = false) => {
    if(GG && !force){
        throw new Error('Mrr Error: Global Grid already inited!');
    }
    class GlobalGrid {
        __mrrGetComputed(){
            return struct;
        }
    }
    const GlobalGridClass = withMrr(null, null, GlobalGrid);
    GG = new GlobalGridClass;
    GG.__mrr.subscribers = [];
    return GG;
}

export default def;
