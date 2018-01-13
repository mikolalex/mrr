'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.initGlobalGrid = exports.withMrr = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// if polyfill used
var isPromise = function isPromise(a) {
	return a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
};

var cell_types = ['funnel', 'closure', 'nested', 'async'];
var skip = new function MrrSkip() {}();
var GG = void 0;

var setStateForLinkedCells = function setStateForLinkedCells(slave, master, as) {
	if (slave.__mrr.linksNeeded[as]) {
		for (var master_cell_name in slave.__mrr.linksNeeded[as]) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = slave.__mrr.linksNeeded[as][master_cell_name][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var slave_cell_name = _step.value;

					if (slave_cell_name[0] === '~') continue;
					slave.setState(_defineProperty({}, slave_cell_name, master.mrrState[master_cell_name]));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}
};
var updateOtherGrid = function updateOtherGrid(grid, as, key, val) {
	var his_cells = grid.__mrr.linksNeeded[as][key];
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = his_cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var cell = _step2.value;

			grid.setState(_defineProperty({}, cell, val));
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}
};

var defMacros = {
	map: function map(_ref) {
		var _ref2 = _slicedToArray(_ref, 1),
		    _map = _ref2[0];

		var res = ['funnel', function (cell, val) {
			return _map[cell] instanceof Function ? _map[cell](val) : _map[cell];
		}];
		for (var cell in _map) {
			res.push(cell);
		}
		return res;
	},
	mapPrev: function mapPrev(_ref3) {
		var _ref4 = _slicedToArray(_ref3, 1),
		    map = _ref4[0];

		var res = ['closure.funnel', function (prev) {
			return function (cell, val) {
				prev = map[cell] instanceof Function ? map[cell](prev, val) : map[cell];
				return prev;
			};
		}];
		for (var cell in map) {
			res.push(cell);
		}
		return res;
	},
	join: function join(_ref5) {
		var _ref6 = _toArray(_ref5),
		    fields = _ref6.slice(0);

		return ['funnel', function (cell, val) {
			return val;
		}].concat(_toConsumableArray(fields));
	},
	'&&': function _(_ref7) {
		var _ref8 = _slicedToArray(_ref7, 2),
		    a = _ref8[0],
		    b = _ref8[1];

		return [function (a, b) {
			return a && b;
		}, a, b];
	},
	trigger: function trigger(_ref9) {
		var _ref10 = _slicedToArray(_ref9, 2),
		    field = _ref10[0],
		    val = _ref10[1];

		return [function (a) {
			return a === val ? true : undefined.__mrr.skip;
		}, field];
	},
	skipSame: function skipSame(_ref11) {
		var _ref12 = _slicedToArray(_ref11, 1),
		    field = _ref12[0];

		return [function (z, x) {
			return z == x ? undefined.__mrr.skip : z;
		}, field, '^'];
	},
	skipN: function skipN(_ref13) {
		var _ref14 = _slicedToArray(_ref13, 2),
		    field = _ref14[0],
		    n = _ref14[1];

		return ['closure', function () {
			var count = 0;
			n = n || 1;
			return function (val) {
				if (++count > n) {
					return val;
				} else {
					return undefined.__mrr.skip;
				}
			};
		}, field];
	},
	accum: function accum(_ref15) {
		var _ref16 = _slicedToArray(_ref15, 2),
		    cell = _ref16[0],
		    time = _ref16[1];

		var res = time ? ['async.closure', function () {
			var vals = {};
			var c = 0;
			return function (cb, val) {
				vals[++c] = val;
				setTimeout(function (i) {
					delete vals[i];
					cb(Object.values(vals));
				}.bind(null, c), time);
				cb(Object.values(vals));
			};
		}, cell] : ['closure', function () {
			var vals = [];
			return function (val) {
				vals.push(val);
				return vals;
			};
		}, cell];
		return res;
	}
};

var withMrr = exports.withMrr = function withMrr(parentClassOrMrrStructure) {
	var _render = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	if (!(parentClassOrMrrStructure instanceof Function)) {
		_render = _render || function () {
			return null;
		};
		var mrrStructure = parentClassOrMrrStructure;
		parentClassOrMrrStructure = function (_React$Component) {
			_inherits(MyMrrComponent, _React$Component);

			function MyMrrComponent() {
				_classCallCheck(this, MyMrrComponent);

				return _possibleConstructorReturn(this, (MyMrrComponent.__proto__ || Object.getPrototypeOf(MyMrrComponent)).apply(this, arguments));
			}

			_createClass(MyMrrComponent, [{
				key: 'render',
				value: function render() {
					return _render.apply(this);
				}
			}, {
				key: 'computed',
				get: function get() {
					return mrrStructure;
				}
			}]);

			return MyMrrComponent;
		}(_react2.default.Component);
	}
	return function (_parentClassOrMrrStru) {
		_inherits(Mrr, _parentClassOrMrrStru);

		function Mrr(props, context) {
			_classCallCheck(this, Mrr);

			var _this2 = _possibleConstructorReturn(this, (Mrr.__proto__ || Object.getPrototypeOf(Mrr)).call(this, props, context));

			_this2.__mrr = {
				closureFuncs: {},
				children: {},
				childrenCounter: 0,
				anonCellsCounter: 0,
				linksNeeded: {},
				realComputed: Object.assign({}, _this2.computed),
				constructing: true,
				thunks: {},
				skip: skip
			};
			_this2.parseMrr();
			if (GG && _this2.__mrr.linksNeeded['^^']) {
				GG.__mrr.subscribers.push(_this2);
			}
			_this2.state = _this2.initialState;
			_this2.props = _this2.props || {};
			if (_this2.props.mrrConnect) {
				_this2.props.mrrConnect.subscribe(_this2);
			}
			_this2.setState({ $start: true });
			if (GG) {
				setStateForLinkedCells(_this2, GG, '^^');
			}
			_this2.__mrr.constructing = false;
			return _this2;
		}

		_createClass(Mrr, [{
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				if (this.__mrrParent) {
					delete this.__mrrParent.children[this.__mrrLinkedAs];
				}
				if (GG && this.__mrr.linksNeeded['^^']) {
					var i = GG.__mrr.subscribers.indexOf(this);
					delete GG.__mrr.subscribers[i];
				}
			}
		}, {
			key: 'parseRow',
			value: function parseRow(row, key, depMap) {
				if (key === "$log") return;
				for (var k in row) {
					var cell = row[k];
					if (k === '0') {
						if (!(cell instanceof Function) && (!cell.indexOf || cell.indexOf('.') === -1 && cell_types.indexOf(cell) === -1)) {
							// it's macro
							if (!this.__mrrMacros[cell]) {
								throw new Error('Macros ' + cell + ' not found!');
							}
							var new_row = this.__mrrMacros[cell](row.slice(1));
							this.__mrr.realComputed[key] = new_row;
							this.parseRow(new_row, key, depMap);
							return;
						}
						continue;
					}
					if (cell instanceof Function) continue;
					if (cell instanceof Array) {
						// anon cell
						var anonName = '@@anon' + ++this.__mrr.anonCellsCounter;
						this.__mrr.realComputed[anonName] = cell;
						this.__mrr.realComputed[key][k] = anonName;
						this.parseRow(cell, anonName, depMap);
						cell = anonName;
					}
					if (cell.indexOf('/') !== -1) {
						var _cell$split = cell.split('/'),
						    _cell$split2 = _slicedToArray(_cell$split, 2),
						    from = _cell$split2[0],
						    parent_cell = _cell$split2[1];

						if (from[0] === '~') {
							from = from.slice(1);
						}
						if (!this.__mrr.linksNeeded[from]) {
							this.__mrr.linksNeeded[from] = {};
						}
						if (!this.__mrr.linksNeeded[from][parent_cell]) {
							this.__mrr.linksNeeded[from][parent_cell] = [];
						}
						if (this.__mrr.linksNeeded[from][parent_cell].indexOf(cell) === -1) {
							this.__mrr.linksNeeded[from][parent_cell].push(cell);
						}
					}
					if (cell === '^') {
						// prev val of cell
						continue;
					}
					if (cell[0] === '-') {
						// passive listening
						continue;
					}
					if (cell === '^') continue;
					if (!depMap[cell]) {
						depMap[cell] = [];
					}
					depMap[cell].push(key);
				}
			}
		}, {
			key: 'parseMrr',
			value: function parseMrr() {
				var depMap = {};
				var mrr = this.__mrr.realComputed;
				var initial_compute = [];
				this.mrrState = Object.assign({}, this.state);
				var updateOnInit = {};
				for (var key in mrr) {
					if (key === '$init') {
						for (var cell in mrr[key]) {
							this.__mrrSetState(cell, mrr[key][cell]);
							updateOnInit[cell] = mrr[key][cell];
							if (cell[0] !== '~') {
								initial_compute.push(cell);
							}
						}
						continue;
					}
					var fexpr = mrr[key];
					if (!(fexpr instanceof Array)) {
						if (typeof fexpr === 'string') {
							// another cell
							fexpr = [function (a) {
								return a;
							}, fexpr];
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
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = initial_compute[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var cell1 = _step3.value;

						this.checkMrrCellUpdate(cell1, updateOnInit);
					}
					//console.log('parsed depMap', this.mrrDepMap);
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}
		}, {
			key: 'setStateFromEvent',
			value: function setStateFromEvent(key, e) {
				var val;
				switch (e.target.type) {
					case 'checkbox':
						val = e.target.checked;
						break;
					default:
						val = e.target.value;
						break;
				}
				this.setState(_defineProperty({}, key, val));
			}
		}, {
			key: 'toStateAs',
			value: function toStateAs(key, val) {
				this.setState(_defineProperty({}, key, val));
			}
		}, {
			key: 'mrrConnect',
			value: function mrrConnect(as) {
				var _this3 = this;

				var self = this;
				if (!as) {
					as = '__rand_child_name_' + ++this.__mrr.childrenCounter;
				}
				return {
					subscribe: function subscribe(child) {
						_this3.__mrr.children[as] = child;
						child.__mrrParent = self;
						child.__mrrLinkedAs = as;
						// read values for linked cells from child
						setStateForLinkedCells(_this3, child, as);
						setStateForLinkedCells(child, _this3, '..');
					}
				};
			}
		}, {
			key: 'toState',
			value: function toState(key, val) {
				var _this4 = this;

				if (val === undefined && this.__mrr.thunks[key]) {
					//console.log('=== skip');
					return this.__mrr.thunks[key];
				} else {
					//console.log('=== generate');
					var func = function func(a) {
						var value = void 0;
						if (val !== undefined) {
							if (val instanceof Function) {
								value = val(a);
							} else {
								value = val;
							}
						} else {
							if (a && a.target && a.target instanceof Node) {
								if (a.target.type === 'checkbox') {
									value = a.target.checked;
								} else if (a.target.type === 'submit') {
									value = true;
								} else {
									value = a.target.value;
								}
							} else {
								value = a;
							}
						}
						if (key instanceof Array) {
							var ns = {};
							key.forEach(function (k) {
								ns[k] = value;
							});
							_this4.setState(ns);
						} else {
							_this4.setState(_defineProperty({}, key, value));
						}
					};
					if (val === undefined) {
						this.__mrr.thunks[key] = func;
					}
					return func;
				}
			}
		}, {
			key: '__getCellArgs',
			value: function __getCellArgs(cell) {
				var _this5 = this;

				var res = this.__mrr.realComputed[cell].slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2).map(function (arg_cell) {
					if (arg_cell === '^') {
						//console.log('looking for prev val of', cell, this.mrrState, this.state);
						return _this5.mrrState[cell];
					} else {
						if (arg_cell[0] === '-') {
							arg_cell = arg_cell.slice(1);
						}
						return _this5.mrrState[arg_cell] === undefined && _this5.state ? _this5.__mrr.constructing ? _this5.initialState[arg_cell] : _this5.state[arg_cell] : _this5.mrrState[arg_cell];
					}
				});
				return res;
			}
		}, {
			key: '__mrrUpdateCell',
			value: function __mrrUpdateCell(cell, parent_cell, update) {
				var _this6 = this;

				var val, func, args, types;
				var updateFunc = function updateFunc(val) {
					if (val === _this6.__mrr.skip) return;
					_this6.__mrrSetState(cell, val);
					var update = {};
					update[cell] = val;
					_this6.checkMrrCellUpdate(cell, update);
					_get(Mrr.prototype.__proto__ || Object.getPrototypeOf(Mrr.prototype), 'prototype', _this6).setState.call(_this6, update);
				};
				var fexpr = this.__mrr.realComputed[cell];
				if (typeof fexpr[0] === 'string') {
					types = fexpr[0].split('.');
				}
				if (fexpr[0] instanceof Function) {
					func = this.__mrr.realComputed[cell][0];
					args = this.__getCellArgs(cell);

					val = func.apply(null, args);
				} else {
					if (types.indexOf('funnel') !== -1) {
						args = [parent_cell, this.mrrState[parent_cell], this.mrrState[cell]];
					} else {
						args = this.__getCellArgs(cell);
					}
					if (types.indexOf('nested') !== -1) {
						args.unshift(function (subcell, val) {
							var subcellname = cell + '.' + subcell;
							_this6.__mrrSetState(subcellname, val);
							var update = {};
							update[subcellname] = val;
							_this6.checkMrrCellUpdate(subcellname, update);
							(parentClassOrMrrStructure.prototype.setState || function () {}).call(_this6, update);
						});
					}
					if (types.indexOf('async') !== -1) {
						args.unshift(updateFunc);
					}
					if (types.indexOf('closure') !== -1) {
						if (!this.__mrr.closureFuncs[cell]) {
							var init_val = this.__mrr.realComputed.$init ? this.__mrr.realComputed.$init[cell] : null;
							this.__mrr.closureFuncs[cell] = fexpr[1](init_val);
						}
						func = this.__mrr.closureFuncs[cell];
					} else {
						func = this.__mrr.realComputed[cell][1];
					}
					if (!func || !func.apply) {
						throw new Error('MRR_ERROR_101: closure type should provide function');
					}
					val = func.apply(null, args);
				}
				if (types && (types.indexOf('nested') !== -1 || types.indexOf('async') !== -1)) {
					// do nothing!
					return;
				}
				if (isPromise(val)) {
					val.then(updateFunc);
				} else {
					if (val === this.__mrr.skip) return;
					update[cell] = val;
					this.__mrrSetState(cell, val);
					this.checkMrrCellUpdate(cell, update);
				}
			}
		}, {
			key: 'checkMrrCellUpdate',
			value: function checkMrrCellUpdate(parent_cell, update) {
				if (this.mrrDepMap[parent_cell]) {
					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;

					try {
						for (var _iterator4 = this.mrrDepMap[parent_cell][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var cell = _step4.value;

							this.__mrrUpdateCell(cell, parent_cell, update);
						}
					} catch (err) {
						_didIteratorError4 = true;
						_iteratorError4 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}
						} finally {
							if (_didIteratorError4) {
								throw _iteratorError4;
							}
						}
					}
				}
			}
		}, {
			key: '__mrrSetState',
			value: function __mrrSetState(key, val) {
				if (this.__mrr.realComputed.$log || 0) {
					if (this.__mrr.realComputed.$log === true || this.__mrr.realComputed.$log instanceof Array && this.__mrr.realComputed.$log.indexOf(key) !== -1) {
						console.log('%c ' + key + ' ', 'background: #898cec; color: white; padding: 1px;', val);
					}
				}
				if (GG && GG === this) {
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = this.__mrr.subscribers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var sub = _step5.value;

							if (sub && sub.__mrr.linksNeeded['^^'][key]) {
								updateOtherGrid(sub, '^^', key, val);
							}
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5.return) {
								_iterator5.return();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}
				} else {
					for (var _as in this.__mrr.children) {
						if (this.__mrr.children[_as].__mrr.linksNeeded['..'] && this.__mrr.children[_as].__mrr.linksNeeded['..'][key]) {
							updateOtherGrid(this.__mrr.children[_as], '..', key, val);
						}
						if (this.__mrr.children[_as].__mrr.linksNeeded['^'] && this.__mrr.children[_as].__mrr.linksNeeded['^'][key]) {
							updateOtherGrid(this.__mrr.children[_as], '^', key, val);
						}
					}
					var as = this.__mrrLinkedAs;
					if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded[as] && this.__mrrParent.__mrr.linksNeeded[as][key]) {
						updateOtherGrid(this.__mrrParent, as, key, val);
					}
					if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded['*'] && this.__mrrParent.__mrr.linksNeeded['*'][key]) {
						updateOtherGrid(this.__mrrParent, '*', key, val);
					}
					if (GG && GG.__mrr.linksNeeded['*'] && GG.__mrr.linksNeeded['*'][key]) {
						updateOtherGrid(GG, '*', key, val);
					}
				}
				this.mrrState[key] = val;
			}
		}, {
			key: 'setState',
			value: function setState(ns) {
				var update = Object.assign({}, ns);
				for (var cell in update) {
					this.__mrrSetState(cell, update[cell]);
				}
				for (var parent_cell in update) {
					this.checkMrrCellUpdate(parent_cell, update);
				}
				if (!this.__mrr.constructing) {
					return (parentClassOrMrrStructure.prototype.setState || function () {}).call(this, update);
				} else {
					for (var _cell in update) {
						this.initialState[_cell] = update[_cell];
					}
				}
			}
		}, {
			key: '__mrrMacros',
			get: function get() {
				return Object.assign({}, defMacros, this.__mrrCustomMacros || {});
			}
		}]);

		return Mrr;
	}(parentClassOrMrrStructure);
};

var def = withMrr(_react2.default.Component);
def.skip = skip;

var initGlobalGrid = exports.initGlobalGrid = function initGlobalGrid(struct) {
	var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	if (GG && !force) {
		throw new Error('Mrr Error: Global Grid already inited!');
	}

	var GlobalGrid = function () {
		function GlobalGrid() {
			_classCallCheck(this, GlobalGrid);
		}

		_createClass(GlobalGrid, [{
			key: 'computed',
			get: function get() {
				return struct;
			}
		}]);

		return GlobalGrid;
	}();

	var GlobalGridClass = withMrr(GlobalGrid);
	GG = new GlobalGridClass();
	GG.__mrr.subscribers = [];
};

exports.default = def;