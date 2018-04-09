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

const setStateForLinkedCells = function(slave, master, as){
	if(slave.__mrr.linksNeeded[as]){
	    for(let master_cell_name in slave.__mrr.linksNeeded[as]){
		for(let slave_cell_name of slave.__mrr.linksNeeded[as][master_cell_name]){
			if(slave_cell_name[0] === '~') continue;
			slave.setState({[slave_cell_name]: master.mrrState[master_cell_name]});
		}
	    }
	}
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
				case 'edit':
					const [newProps, predicate] = changes;
					prev.map((item, i) => [i, item])
			    .filter(pair => matches(pair[1], predicate))
					.forEach(i => {
				  	next[i[0]] = Object.assign({}, next[i[0]], newProps);
					});
				break;
				case 'remove':
					next = next.filter(item => !matches(item, changes));
				break;
				case 'add':
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
			return ['funnel', (cell) => cell === setTrue, setTrue, setFalse]
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
	trigger: ([field, val]) => [a => a === val ? true : this.__mrr.skip, field],
	skipSame: ([field]) => [(z, x) => shallow_equal(z, x) ? skip : z, field, '^'],
	skipN: ([field, n]) => ['closure', () => {
		let count = 0;
		n = n || 1;
		return (val) => {
			if(++count > n){
				return val;
			} else {
				return this.__mrr.skip;
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

export const withMrr = (parentClassOrMrrStructure, render = null) => {
	if(!(parentClassOrMrrStructure instanceof Function)){
		render = render || (() => null);
		const mrrStructure = parentClassOrMrrStructure;
		parentClassOrMrrStructure = class MyMrrComponent extends React.Component {
			get computed(){
				return mrrStructure;
			}
			render(){
				return render.call(this, this.state, this.props, this.toState.bind(this), as => ({ mrrConnect: this.mrrConnect(as)}));
			}
		}
	} else {
		if(render){
			const mrrStructure = parentClassOrMrrStructure;
			parentClassOrMrrStructure = class MyMrrComponent extends React.Component {
				get computed(){
					return mrrStructure(this.props);
				}
				render(){
					return render.call(this, this.state, this.props, this.toState.bind(this), as => ({ mrrConnect: this.mrrConnect(as)}))
				}
			}
		}
	}
	return class Mrr extends parentClassOrMrrStructure {
		constructor(props, context) {
			super(props, context);
			this.__mrr = {
				closureFuncs: {},
				children: {},
				childrenCounter: 0,
				anonCellsCounter: 0,
				linksNeeded: {},
				realComputed: Object.assign({}, this.computed),
				constructing: true,
				thunks: {},
				skip,
				expose: [],
			};
			this.parseMrr();
			if(GG && this.__mrr.linksNeeded['^']){
				GG.__mrr.subscribers.push(this);
			}
			this.state = this.initialState;
			this.props = this.props || {};
			if(this.props.mrrConnect){
				this.props.mrrConnect.subscribe(this);
			}
			if(GG){
				setStateForLinkedCells(this, GG, '^');
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
		  if(key === "$expose") {
					this.__mrr.expose = row;
					return;
			};
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
				if(cell === '^') continue;
				if(!depMap[cell]){
					depMap[cell] = [];
				}
				depMap[cell].push(key);
			}
		}
		parseMrr(){
			const depMap = {};
			const mrr = this.__mrr.realComputed;
			const initial_compute = [];
			this.mrrState = Object.assign({}, this.state);
			const updateOnInit = {};
			for(let key in mrr){
				if(key === '$init'){
					let init_vals = mrr[key] instanceof Function ? mrr[key](this.props) : mrr[key];
					for(let cell in init_vals){
						this.__mrrSetState(cell, init_vals[cell]);
						updateOnInit[cell] = init_vals[cell];
						if(cell[0] !== '~'){
							initial_compute.push(cell);
						}
					}
					continue;
				}
				let fexpr = mrr[key];
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
			for(let cell1 of initial_compute){
				this.checkMrrCellUpdate(cell1, updateOnInit);
			}
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
			this.setState({[key]: val});
		}
		mrrConnect(as){
			const self = this;
			if(!as){
				as = '__rand_child_name_' + (++this.__mrr.childrenCounter);
			}
			return {
				subscribe: (child) => {
					child.$name = as;
					this.__mrr.children[as] = child;
					child.__mrrParent = self;
					child.__mrrLinkedAs = as;
					// read values for linked cells from child
					setStateForLinkedCells(this, child, as);
					setStateForLinkedCells(child, this, '..');
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
						? (	this.__mrr.constructing
								? this.initialState[arg_cell]
								: this.state[arg_cell]
							)
						: this.mrrState[arg_cell]
				}
			}));
			return res;
		}
		__mrrUpdateCell(cell, parent_cell, update){
			var val, func, args, updateNested, types = [];
      const superSetState = super.setState;
			const updateFunc = val => {
				if(val === this.__mrr.skip) return;
				this.__mrrSetState(cell, val, parent_cell);
				const update = {};
				update[cell] = val;
				this.checkMrrCellUpdate(cell, update);
				superSetState.call(this, update);
			}
			const fexpr = this.__mrr.realComputed[cell];
			if(typeof fexpr[0] === 'string'){
				types = fexpr[0].split('.');
			}

			if(types.indexOf('nested') !== -1){
				updateNested = (subcell, val) => {
					const subcellname = cell + '.' + subcell;
					this.__mrrSetState(subcellname, val, parent_cell);
					const update = {};
					update[subcellname] = val;
					this.checkMrrCellUpdate(subcellname, update);
					(parentClassOrMrrStructure.prototype.setState || (() => {})).call(this, update);
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
				if(val === this.__mrr.skip) return;
				update[cell] = val;
				this.__mrrSetState(cell, val, parent_cell);
				this.checkMrrCellUpdate(cell, update);
			}
		}
		checkMrrCellUpdate(parent_cell, update){
			if(this.mrrDepMap[parent_cell]){
				for(let cell of this.mrrDepMap[parent_cell]){
					this.__mrrUpdateCell(cell, parent_cell, update);
				}
			}
		}
		__mrrSetState(key, val, parent_cell){
			const styles = 'background: #898cec; color: white; padding: 1px;';
			if(this.__mrr.realComputed.$log || 0) {
				if(
          (this.__mrr.realComputed.$log && !(this.__mrr.realComputed.$log instanceof Array))
          ||
          ((this.__mrr.realComputed.$log instanceof Array) && (this.__mrr.realComputed.$log.indexOf(key) !== -1))){
          if(this.__mrr.realComputed.$log === 'no-colour'){
            console.log(key, val);
          } else {
            console.log('%c ' + this.__mrrPath + '::' + key
              //+ '(' + parent_cell +') '
              , styles, val);
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
					if(this.__mrr.children[as].__mrr.linksNeeded['..'] && this.__mrr.children[as].__mrr.linksNeeded['..'][key]){
						updateOtherGrid(this.__mrr.children[as], '..', key, val);
					}
				}
				let as  = this.__mrrLinkedAs;
				if(this.__mrrParent && this.__mrrParent.__mrr.linksNeeded[as] && this.__mrrParent.__mrr.linksNeeded[as][key]){
					updateOtherGrid(this.__mrrParent, as, key, val);
				}
				if(this.__mrrParent && this.__mrrParent.__mrr.linksNeeded['*'] && this.__mrrParent.__mrr.linksNeeded['*'][key]){
					updateOtherGrid(this.__mrrParent, '*', key, val);
				}
				if(GG && GG.__mrr.linksNeeded['*'] && GG.__mrr.linksNeeded['*'][key] && this.__mrr.expose.includes(key)){
					updateOtherGrid(GG, '*', key, val);
				}
			}
			this.mrrState[key] = val;
		}
		setState(ns, cb){
      if(!(ns instanceof Object)) {
        ns = ns.call(null, this.state, this.props);
      }
			const update = Object.assign({}, ns);
			for(let cell in update){
				this.__mrrSetState(cell, update[cell]);
			}
			for(let parent_cell in update){
				this.checkMrrCellUpdate(parent_cell, update);
			}
			if(!this.__mrr.constructing){
				return (parentClassOrMrrStructure.prototype.setState || (() => {})).call(this, update, cb);
			} else {
				for(let cell in update){
					this.initialState[cell] = update[cell];
				}
			}
		}

	}
}

const def = withMrr(React.Component);
def.skip = skip;

export const initGlobalGrid = (struct, force = false) => {
	if(GG && !force){
		throw new Error('Mrr Error: Global Grid already inited!');
	}
	class GlobalGrid {
		get computed(){
			return struct;
		}
	}
	const GlobalGridClass = withMrr(GlobalGrid);
	GG = new GlobalGridClass;
	GG.__mrr.subscribers = [];
}

export default def;
