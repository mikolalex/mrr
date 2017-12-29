import React from 'react';

// if polyfill used
const isPromise = a => a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;

const cell_types = ['funnel', 'closure', 'nested', 'async'];
const skip = new function MrrSkip(){};

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

class Mrr extends React.Component {
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
		};
		this.parseMrr();
		if(this.props.mrrConnect){
			this.props.mrrConnect.subscribe(this);
		}
		this.setState({$start: true});
		this.__mrr.constructing = false;
    }
	get __mrrMacros(){
		return Object.assign({}, { 
			map: ([map]) => {
				var res = ['funnel', (cell, val) => {
					return map[cell] instanceof Function ? map[cell](val) : map[cell];
				}];
				for(let cell in map){
					res.push(cell);
				}
				return res;
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
			skipSame: ([field]) => [(z, x) => z == x ? this.__mrr.skip : z, field, '^'],
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
		}, this.__mrrCustomMacros || {});
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
				this.__mrr.realComputed[key][k] = anonName;
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
				for(let cell in mrr[key]){
					this.__mrrSetState(cell, mrr[key][cell]);
					updateOnInit[cell] = mrr[key][cell];
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
					if(a && a.target && (a.target instanceof Node)){
						if(a.target.type === 'checkbox'){
							value = a.target.checked;
						} else if(a.target.type === 'submit'){
							value = true;
						} else {
							value = a.target.value;
						}
					} else {
						value = a;
					}
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
		var val, func, args, types;
		const updateFunc = val => {
			if(val === this.__mrr.skip) return;
			this.__mrrSetState(cell, val);
			const update = {};
			update[cell] = val;
			this.checkMrrCellUpdate(cell, update);
			React.Component.prototype.setState.call(this, update);
		}
		const fexpr = this.__mrr.realComputed[cell];
		if(typeof fexpr[0] === 'string'){
			types = fexpr[0].split('.');
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
				args.unshift((subcell, val) => {
					const subcellname = cell + '.' + subcell;
					this.__mrrSetState(subcellname, val);
					const update = {};
					update[subcellname] = val;
					this.checkMrrCellUpdate(subcellname, update);
					React.Component.prototype.setState.call(this, update);
				})
			} 
			if(types.indexOf('async') !== -1){
				args.unshift(updateFunc)
			} 
			if(types.indexOf('closure') !== -1){
				if(!this.__mrr.closureFuncs[cell]){
					const init_val = this.__mrr.realComputed.$init ? this.__mrr.realComputed.$init[cell] : null;
					this.__mrr.closureFuncs[cell] = fexpr[1](init_val);
				}
				func = this.__mrr.closureFuncs[cell];
			} else {
				func = this.__mrr.realComputed[cell][1];
			}
			if(!func || !func.apply) {
				throw new Error('MRR_ERROR_101: closure type should provide function');
			}
			val = func.apply(null, args);
		}
		if(types && ((types.indexOf('nested') !== -1) || (types.indexOf('async') !== -1))){
			// do nothing!
			return;
		}
		if(isPromise(val)){
			val.then(updateFunc)
		} else {
			if(val === this.__mrr.skip) return;
			update[cell] = val;
			this.__mrrSetState(cell, val);
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
	__mrrSetState(key, val){
		if(this.__mrr.realComputed.$log || 0) {
			if((this.__mrr.realComputed.$log === true) || ((this.__mrr.realComputed.$log instanceof Array) && (this.__mrr.realComputed.$log.indexOf(key) !== -1))){
				console.log('%c ' + key + ' ', 'background: #898cec; color: white; padding: 1px;', val);
			}
		}
		for(let as in this.__mrr.children){
			if(this.__mrr.children[as].__mrr.linksNeeded['..'] && this.__mrr.children[as].__mrr.linksNeeded['..'][key]){
				updateOtherGrid(this.__mrr.children[as], '..', key, val);
			}
			if(this.__mrr.children[as].__mrr.linksNeeded['^'] && this.__mrr.children[as].__mrr.linksNeeded['^'][key]){
				updateOtherGrid(this.__mrr.children[as], '^', key, val);
			}
		}
		let as  = this.__mrrLinkedAs;
		if(this.__mrrParent && this.__mrrParent.__mrr.linksNeeded[as] && this.__mrrParent.__mrr.linksNeeded[as][key]){
			updateOtherGrid(this.__mrrParent, as, key, val);
		}
		if(this.__mrrParent && this.__mrrParent.__mrr.linksNeeded['*'] && this.__mrrParent.__mrr.linksNeeded['*'][key]){
			updateOtherGrid(this.__mrrParent, '*', key, val);
		}
		this.mrrState[key] = val;
	}
	setState(ns){
		const update = Object.assign({}, ns);
		for(let cell in update){
			this.__mrrSetState(cell, update[cell]);
		}
		for(let parent_cell in update){
			this.checkMrrCellUpdate(parent_cell, update);
		}
		if(!this.__mrr.constructing){
			return React.Component.prototype.setState.call(this, update);
		} else {
			for(let cell in update){
				this.initialState[cell] = update[cell];
			}
		}
	}
		
}

Mrr.skip = skip;

export default Mrr;