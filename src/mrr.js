import GridMacros from './gridMacros';
import CellMacros from './operators';

export const skip = new function MrrSkip(){};

const cell_types = ['funnel', 'closure', 'nested', 'async'];
let global_macros = {};

const log_styles_cell = 'background: #898cec; color: white; padding: 1px;';
const log_styles_mount = 'background: green; color: white; padding: 1px;';

export const registerMacros = (name, func) => {
    global_macros[name] = func;
}

const html_aspects = {
    val: () => {
        return ['Change', e => e.target.value];
    },
    click: () => {
        return ['Click', e => e];
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

let currentChange;
let ids = 0;
const type_delimiter = ': ';

const allGrids = {};

const isUndef = a => (a === null || a === undefined);

const runGridMethodIfExists = (method, id, ...params) => {
  if(allGrids[id]){
    allGrids[id][method](...params);
  }
}

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

const updateOtherGrid = (grid, as, key, val, level) => {
    const his_cells = grid.__mrr.linksNeeded[as][key];
    for(let cell of his_cells){
        grid.setState({[cell]: val}, level);
    }
}

const swapObj = a => {
    const b = {};
    for(let k in a){
        b[a[k]] = k;
    }
    return b;
}

const objFlipArr = a => {
    const b = {};
    for(let k in a){
        if(!b[a[k]]){
            b[a[k]] = [];
        }
        b[a[k]].push(k);
    }
    return b;
}

const objMap = (obj, func) => {
    const res = {};
    for(let i in obj){
        const [val, key] = func(obj[i], i);
        res[key] = val;
    }
    return res;
}

const isPromise = a => a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;

const systemCells = ['$start', '$end', '$state', '^/$state', '$props', '$name', '$async', '$nested', '$changedCellName'];


const recur = (obj, key, func) => {
    func(obj);
    var val = obj;
    if(key instanceof Array){
        for(let field of key){
            val = val[field];
            if(!val) break;
        }
        
    } else {
        val = val[key];
    }
    if(val){
        for(let k in val){
            recur(val[k], key, func);
        }
    }
}

class Mrr {
    constructor(mrrStructure, props = {}, setOuterState = () => {}, macros = CellMacros, dataTypes = {}, GG = false) {
        this.macros = macros;
        this.GG = (GG && (GG !== true)) ? GG : null;
        this.dataTypes = dataTypes;
        this.setOuterState = setOuterState;
        this.isGG = GG === true;
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
        allGrids[this.__mrr.id] = this;
        
        if(props && props.extractDebugMethodsTo){
            props.extractDebugMethodsTo.getState = () => {
                return this.mrrState;
            }
            props.extractDebugMethodsTo.self = this;
        }
        if(!this.__mrr.valueCells){
            this.__mrr.valueCells = {};
        }
        this.__mrr.realComputed = Object.assign({}, objMap(mrrStructure, (val, key) => {
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
        if(this.GG){
            if(this.__mrr.linksNeeded['^']){
                this.GG.__mrr.subscribers.push(this);
                this.checkLinkedCellsTypes(this, this.GG, '^');
                for(let a in this.__mrr.linksNeeded['^']){
                    const child_cells = this.__mrr.linksNeeded['^'][a];
                    const val = this.GG.mrrState[a];
                    for(let cell of child_cells){
                        this.mrrState[cell] = val;
                    }
                }
            }
            this.checkLinkedCellsTypes(this.GG, this, '*');
        }
        //this.state = this.initialState;
        if(this.props.mrrConnect){
            this.props.mrrConnect.subscribe(this);
        }
        this.__mrr.constructing = false;
    }
    onMount(){
        this.setState({
            $start: true,
        });
    }
    
    onUnmount(){
        this.setState({$end: true});
        if(this.__mrrParent){
            delete this.__mrrParent.__mrr.children[this.__mrrLinkedAs];
        }
        if(this.GG && this.__mrr.linksNeeded['^']){
            const i = this.GG.__mrr.subscribers.indexOf(this);
            delete this.GG.__mrr.subscribers[i];
        }
        delete allGrids[this.__mrr.id];
    }
    get __mrrMacros(){
        return Object.assign({}, this.macros, global_macros);
    }
    get __mrrPath(){
        return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : (this.isGG ? 'GG' : 'root');
    }
    
    get innerState(){
        return Object.assign({}, this.mrrState);
    }
    
    setCellDataType(cell, type){
        if(!this.dataTypes[type]){
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
			if(!cell) debugger;
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

    logChange(){
        let currentLevel = -1;
        //console.log('CHANGE', currentChange);
        for(let k in currentChange){
            const [str, style, val, level] = currentChange[k];
            if(level > (currentLevel + 1)){
                const diff = level - (currentLevel + 1);
                for(let j = k; currentChange[j] && currentChange[j][3] >= currentLevel; j++){
                    currentChange[j][3] -= diff;
                }
            }
            currentLevel = level;
        }
        currentLevel = -1;
        console.group('');
        for(let k in currentChange){
            const [str, style, val, level] = currentChange[k];
            if(level !== currentLevel){
                if(level > currentLevel){
                    //console.group(level);
                } else {
                    const riz = (currentLevel - level);
                    for(let s = currentLevel; s > level; s--){
                        //console.groupEnd();
                    }
                }
            }
            //if(level <= currentLevel){
                console.log.apply(console, [new Array(level + 1).fill('').join('___') + ' ' + str, style, val]);
            //}
            currentLevel = level;
        }
        for(let s = currentLevel; s >= 0; s--){
            //console.groupEnd();
        }
        console.groupEnd();
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
            if(systemCells.indexOf(key) !== -1){
              throw new Error('Cannot redefine system cell: ' + key);
            }
            if(key === '$init'){
                if(mrr.$log && mrr.$log.showTree){
                    currentChange = [];
                }
                let init_vals = mrr[key] instanceof Function ? mrr[key](this.props) : mrr[key];
                for(let cell in init_vals){
                    this.__mrrSetState(cell, init_vals[cell], null, [], 0);
                    updateOnInit[cell] = init_vals[cell];
                }
                if(mrr.$log && mrr.$log.showTree){
                    this.logChange();
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
            if(key === "$writeToDOM") {
                this.__mrr.writeToDOM = {};
                for(let item of fexpr){
                    this.__mrr.writeToDOM[item] = true;
                }
                continue;
            };
            if(key === "$toBeLinked") {
                this.__mrr.toBeLinked = {};
                for(let item of fexpr){
                    this.__mrr.toBeLinked[item] = true;
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
                    && (!this.__mrr.toBeLinked || !this.__mrr.toBeLinked[cn])
                    && (cn.indexOf('.') === -1)
                    && (systemCells.indexOf(cn) === -1)
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
        this.setState({[key]: val});
    }
    checkLinkedCellsTypes(a, b, linked_as){
        if(!a) debugger;
        for(let v in a.__mrr.linksNeeded[linked_as]){
            const needed_cells = a.__mrr.linksNeeded[linked_as][v];
            for(let cell of needed_cells){
                if(a.__mrr.dataTypes[cell] && b.__mrr.dataTypes[v] && (
                    isMatchingType(b.__mrr.dataTypes[v], a.__mrr.dataTypes[cell], this.dataTypes, {
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
    mrrConnect(as, upstream = {}, downstream = {}){
        const self = this;
        if(isUndef(as)){
            as = '__rand_child_name_' + (++this.__mrr.childrenCounter);
        }
        return {
            subscribe: (child) => {
                let upstreamObj = upstream;
                if(upstreamObj instanceof Array){
                    let r = {};
                    for(let cell of upstreamObj){
                        r[cell] = cell;
                    }
                    upstreamObj = r;
                }
                child.upstream = objFlipArr(upstreamObj);
                
                let downstreamObj = downstream;
                if(downstreamObj instanceof Array){
                    let r = {};
                    for(let cell of downstreamObj){
                        r[cell] = cell;
                    }
                    downstreamObj = r;
                }
                for(let k in downstreamObj){
                    let parent_cell = downstreamObj[k];
                    if(!child.__mrr.linksNeeded['..']){
                        child.__mrr.linksNeeded['..'] = {};
                    }
                    if(!child.__mrr.linksNeeded['..'][parent_cell]){
                        child.__mrr.linksNeeded['..'][parent_cell] = [];
                    }
                    if(child.__mrr.linksNeeded['..'][parent_cell].indexOf(k) === -1){
                        child.__mrr.linksNeeded['..'][parent_cell].push(k);
                    }
                }
                
                child.$name = as;
                this.__mrr.children[as] = child;
                child.__mrrParent = self;
                child.__mrrLinkedAs = as;
                for(let a in child.__mrr.linksNeeded['..']){
                    const child_cells = child.__mrr.linksNeeded['..'][a];
                    const val = self.mrrState[a];
                    for(let cell of child_cells){
                        child.mrrState[cell] = val;
                        child.initialState[cell] = val;
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
                      console.log('CONNECTED: ' + (this.$name || '') + '/' + as, child.__mrr.realComputed);
                    } else {
                      console.log('%c CONNECTED: ' + (this.$name || '') + '/' + as, log_styles_mount, child.__mrr.realComputed);
                    }
                } 
            }
        }
    }
    toState(key, val, notHandleFunctions){
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
                    if(val instanceof Function && !notHandleFunctions){
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
                    this.setState(ns);
                } else {
                    this.setState({[key]: value});
                }
            }
            if(val === undefined){
                this.__mrr.thunks[key] = func;
            }
            return func;
        }
    }
    __getCellArgs(cell, parent_cell, parent_stack, level){
        const arg_cells = this.__mrr.realComputed[cell]
            .slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2)
            .filter(a => a !== skip);
        const found = {}
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
                  return this.reactWrapper ? this.reactWrapper.props : undefined;
                }
                if(arg_cell === '$async'){
                  found.$async = true;
                  return runGridMethodIfExists.bind(null, 'updateAsync', this.__mrr.id, cell, parent_cell, parent_stack);
                }
                if(arg_cell === '$nested'){
                  return runGridMethodIfExists.bind(null, 'updateNested', this.__mrr.id, cell, parent_cell, parent_stack, level);
                }
                if(arg_cell === '$changedCellName'){
                  return parent_cell;
                }
                if(arg_cell === '$changedCellName'){
                  return parent_cell;
                }
                if(arg_cell === '$state'){
                  return Object.assign({}, this.mrrState);
                }
                if(arg_cell === '^/$state'){
                  if(this.GG){
                    return Object.assign({}, this.GG.mrrState);
                  } else {
                    return;
                  }
                }
                return ((this.mrrState[arg_cell] === undefined) && this.state && this.__mrr.constructing)
                    ? this.initialState[arg_cell]
                    : this.mrrState[arg_cell]
            }
        }));
        return [res, found];
    }
    __mrrSetError(cell, e){
        if(this.mrrDepMap['$err.' + cell]){
            this.setState({['$err.' + cell]: e});
        } else {
            if(this.mrrDepMap.$err){
                this.setState({$err: e});
            } else {
                throw e;
            }
        }
    }
    
    getGraph(){
        let c = 0;
        const cells = {
            
        };
        const edges = [];
        const setCell = (cell, gridId) => {
            if(!cells[gridId]){
                cells[gridId] = {};
            }
            if(!cells[gridId][cell]){
                cells[gridId][cell] = ++c;
                return c;
            } else {
                return cells[gridId][cell];
            }
        };
        const nodes = [];
        const getId = (gridId, cell) => {
            return cells[gridId][cell];
        };
        const addLink = (fromCell, fromGrid, toCell, toGrid) => {
            const from = setCell(fromCell, fromGrid);
            const to = setCell(toCell, toGrid);
            edges.push({
                from,
                to,
                arrows: 'to',
            })
        };
        recur(this, ['__mrr', 'children'], (child) => {
            for(let cn in child.mrrDepMap){
                for(let depC of child.mrrDepMap[cn]){
                    addLink(cn, child.__mrr.id, depC, child.__mrr.id);
                }
            }
            for(let type in child.__mrr.linksNeeded){
              for(let masterCell in child.__mrr.linksNeeded[type]){
                for(let childCell of child.__mrr.linksNeeded[type][masterCell]){
                  if(type === '*'){
                    for(let ch in child.__mrr.children){
                      let childId = child.__mrr.children[ch].__mrr.id;
                      addLink(masterCell, childId, depC, child.__mrr.id);
                    }
                  }
                }
              }
            }
        });
        for(let gridId in cells){
            for(let cellname in cells[gridId]){
                nodes.push({
                    id: cells[gridId][cellname],
                    label: gridId + '/' + cellname,
                })
            }
        }
        return [nodes, edges];
    }
    
    
    updateAsync(cell, parent_cell, parent_stack, val){
      if(val === skip) {
          return;
      }
      if(this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          currentChange = [];
      }
      this.__mrrSetState(cell, val, parent_cell, parent_stack, 0);
      const update = {};
      update[cell] = val;
      this.checkMrrCellUpdate(cell, update, parent_stack, val, 0);
      this.setOuterState(update, null, true);
      if(this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          this.logChange();
      }
    }
    
    updateNested(cell, parent_cell, parent_stack, level, subcell, val){
      if(subcell instanceof Object){
          for(let k in subcell){
              updateNested(k, subcell[k]);
          }
          return;
      }
      if(this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          currentChange = [];
      }
      const subcellname = cell + '.' + subcell;
      const stateSetter = this.setOuterState;
      this.__mrrSetState(subcellname, val, parent_cell, parent_stack, level);
      const update = {};
      update[subcellname] = val;
      this.checkMrrCellUpdate(subcellname, update, parent_stack, val, level);
      stateSetter.call(this, update, null, true);
      const nested_update = {
          [cell]: this.mrrState[cell] instanceof Object ? this.mrrState[cell] : {}
      }
      nested_update[cell][subcell] = val;
      stateSetter.call(this, nested_update, null, true);
      if(this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          this.logChange();
      }
    }
    
    __mrrUpdateCell(cell, parent_cell, update, parent_stack, level){
        var val, func, args, updateNested, updateFunc, types = [];
        
        const fexpr = this.__mrr.realComputed[cell];
        if(typeof fexpr[0] === 'string'){
            types = fexpr[0].split('.');
        }

        if(types.indexOf('nested') !== -1){
            updateNested = runGridMethodIfExists.bind(null, 'updateNested', this.__mrr.id, cell, parent_cell, parent_stack, level);
        }
        let found = {};

        if(fexpr[0] instanceof Function){
            func = this.__mrr.realComputed[cell][0];
            [args, found] = this.__getCellArgs(cell, parent_cell, parent_stack, level);
            try {
                val = func.apply(null, args);
            } catch (e) {
                this.__mrrSetError(cell, e);
                return;
            }
        } else {
            if(types.indexOf('funnel') !== -1){
                args = [parent_cell, this.mrrState[parent_cell], this.mrrState[cell]];
            } else {
                [args, found] = this.__getCellArgs(cell, parent_cell, parent_stack, level);
            }
            if(types.indexOf('nested') !== -1){
                args.unshift(updateNested)
            }
            if(types.indexOf('async') !== -1){
                updateFunc = updateFunc = runGridMethodIfExists.bind(null, 'updateAsync', this.__mrr.id, cell, parent_cell, parent_stack);
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
                this.__mrrSetError(cell, e);
                return;
            }
        }
        if(this.__mrr.dataTypes[cell] && (val !== skip)){
            if(!this.dataTypes[this.__mrr.dataTypes[cell]]){
                throw new Error('Undeclared type: ' + this.__mrr.dataTypes[cell] + " for cell " + cell);
            }
            if(!(this.dataTypes[this.__mrr.dataTypes[cell]].check(val, this.dataTypes))){
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
        if((types && (types.indexOf('async') !== -1)) || (found.$async)){
            // do nothing!
            return;
        }
        const current_val = this.mrrState[cell];
        if(this.__mrr.valueCells[cell] && shallow_equal(current_val, val)){
            //console.log('Duplicate', cell, val, this.__mrr.valueCells);
            return;
        }
        if(isPromise(val)){
            if(!updateFunc){
                updateFunc = runGridMethodIfExists.bind(null, 'updateAsync', this.__mrr.id, cell, parent_cell, parent_stack);
            }
            val.then(updateFunc)
        } else {
            if(val === skip) {
                return;
            }
            update[cell] = val;
            this.__mrrSetState(cell, val, parent_cell, parent_stack, level);
            this.checkMrrCellUpdate(cell, update, parent_stack, val, level);
        }
    }
    checkMrrCellUpdate(parent_cell, update, parent_stack = [], val, level){
        if(this.mrrDepMap[parent_cell]){
            for(let cell of this.mrrDepMap[parent_cell]){
                const next_parent_stack = this.__mrr.realComputed.$log ? [...parent_stack, [parent_cell, val]] : parent_stack;
                this.__mrrUpdateCell(cell, parent_cell, update, next_parent_stack, level + 1);
            }
        }
    }
    __mrrSetState(key, val, parent_cell, parent_stack, level){
        //@ todo: omit @@anon cells
        if(this.__mrr.realComputed.$log 
            && (key[0] !== '@')
        ) {
            if(
                (this.__mrr.realComputed.$log === true)
                ||
                ((this.__mrr.realComputed.$log instanceof Array) && (this.__mrr.realComputed.$log.indexOf(key) !== -1))
                ||
                (this.__mrr.realComputed.$log.cells 
                    && (
                        (this.__mrr.realComputed.$log.cells === true)
                        || 
                        (this.__mrr.realComputed.$log.cells.indexOf(key) !== -1)
                    )
                )
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
                  if(this.__mrr.realComputed.$log.showTree){
                    logArgs.push(level);
                    currentChange.push(logArgs);
                  } else {
                    console.log.apply(console, logArgs);
                  }
                }
            }
        }
        this.mrrState[key] = val;

        if(this.isGG){
            if(this.__mrr.subscribers){
                for(let sub of this.__mrr.subscribers){
                    if(sub && sub.__mrr.linksNeeded['^'][key]){
                        updateOtherGrid(sub, '^', key, this.mrrState[key], level + 1);
                    }
                }
            }
        } else {
            for(let as in this.__mrr.children){
                if(    this.__mrr.children[as].__mrr.linksNeeded['..']
                    && this.__mrr.children[as].__mrr.linksNeeded['..'][key]
                    && (val === this.mrrState[key])
                ){
                    updateOtherGrid(this.__mrr.children[as], '..', key, this.mrrState[key], level + 1);
                }
            }
            let as  = this.__mrrLinkedAs;
            if(    this.__mrrParent
                && this.__mrrParent.__mrr.linksNeeded[as]
                && this.__mrrParent.__mrr.linksNeeded[as][key]
                && (val === this.mrrState[key])
            ){
                updateOtherGrid(this.__mrrParent, as, key, this.mrrState[key], level + 1);
            }
            if(    this.__mrrParent
                && this.upstream
                && this.upstream[key]
                && (val === this.mrrState[key])
            ){
                for(let parentCell of this.upstream[key]){
                    this.__mrrParent.setState({[parentCell]: val}, level + 1);
                }
            }
            if(    this.__mrrParent
                && this.__mrrParent.__mrr.linksNeeded['*']
                && this.__mrrParent.__mrr.linksNeeded['*'][key]
                && (val === this.mrrState[key])
            ){
                updateOtherGrid(this.__mrrParent, '*', key, this.mrrState[key], level + 1);
            }
            if(    this.__mrr.expose
                && this.__mrr.expose[key]
                && this.GG
                && this.GG.__mrr.linksNeeded['*']
                && this.GG.__mrr.linksNeeded['*'][this.__mrr.expose[key]]
                && (val === this.mrrState[key])
            ){
                updateOtherGrid(this.GG, '*', this.__mrr.expose[key], this.mrrState[key], level + 1);
            }
        }
    }
    getUpdateQueue(cell){

    }
    setState(ns, level = 0){
      if(!(ns instanceof Object)) {
          ns = ns.call(null, this.state, this.props);
      }
      const update = Object.assign({}, ns);
      if(!level && this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          currentChange = [];
      }
      for(let cell in update){
          this.__mrrSetState(cell, update[cell], null, [], level);
      }
      for(let parent_cell in update){
          this.checkMrrCellUpdate(parent_cell, update, [], null, level);
      }
      if(!level && this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree){
          this.logChange();
      }
      if(!this.__mrr.constructing){
          let real_update = {};
          if(this.__mrr.writeToDOM){
              let once = false;
              for(let key in update){
                  if(this.__mrr.writeToDOM[key]){
                      real_update[key] = update[key];
                      once = true;
                  }
              }
              if(!once) return;
          } else {
              real_update = update;
          }
          return this.setOuterState(real_update, true);
          //return (mrrParentClass.prototype.setState || (() => {})).call(this, real_update, cb, true);
      } else {
          for(let cell in update){
              this.initialState[cell] = update[cell];
          }
      }
    }
}

const Grid = function Grid(struct){
	this.struct = struct instanceof Array ? struct : [struct];
}
Grid.prototype.extend = function(child){
	return new Grid([...this.struct, child]);
}

Grid.prototype.get = function(props = {}){
	let res;
    for(let i in this.struct){
        const struct = this.struct[i] instanceof Function ? this.struct[i](props) : this.struct[i];
        if(i == 0) {
            res = struct;
        } else {
            res = GridMacros.merge(struct, res);
        }
    }
    return res;
}

export { Grid };

export default Mrr;