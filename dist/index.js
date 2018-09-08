'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initGlobalGrid = exports.withMrr = exports.registerMacros = exports.skip = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// if polyfill used
var isPromise = function isPromise(a) {
    return a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
};

var cell_types = ['funnel', 'closure', 'nested', 'async'];
var isJustObject = function isJustObject(a) {
    return a instanceof Object && !(a instanceof Array) && !(a instanceof Function);
};
var GG = void 0;
var global_macros = {};

var log_styles_cell = 'background: #898cec; color: white; padding: 1px;';
var log_styles_mount = 'background: green; color: white; padding: 1px;';

var skip = exports.skip = new function MrrSkip() {}();

var registerMacros = exports.registerMacros = function registerMacros(name, func) {
    global_macros[name] = func;
};

var isUndef = function isUndef(a) {
    return a === null || a === undefined;
};

var always = function always(a) {
    return function (_) {
        return a;
    };
};

var shallow_equal = function shallow_equal(a, b) {
    if (a instanceof Object) {
        if (!b) return false;
        if (a instanceof Function) {
            return a.toString() === b.toString();
        }
        for (var k in a) {
            if (!a.hasOwnProperty(k)) {
                continue;
            }
            if (a[k] !== b[k]) {
                return false;
            }
        }
        for (var _k in b) {
            if (!b.hasOwnProperty(_k)) {
                continue;
            }
            if (a[_k] !== b[_k]) {
                return false;
            }
        }
        return true;
    }
    return a == b;
};

var matches = function matches(obj, subset) {
    for (var k in subset) {
        if (!shallow_equal(obj[k], subset[k])) {
            return false;
        }
    }
    return true;
};

var updateOtherGrid = function updateOtherGrid(grid, as, key, val) {
    var his_cells = grid.__mrr.linksNeeded[as][key];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = his_cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cell = _step.value;

            grid.setState(_defineProperty({}, cell, val));
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
    list: function list(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1),
            map = _ref4[0];

        var res = ['funnel', function (cell, val) {
            return val;
        }];

        var _loop = function _loop(type) {
            if (type !== 'custom') {
                res.push([function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return [type].concat(args);
                }, map[type]]);
            }
        };

        for (var type in map) {
            _loop(type);
        }
        return [function (_ref5, prev) {
            var _ref6 = _slicedToArray(_ref5, 2),
                type = _ref6[0],
                changes = _ref6[1];

            var next = [].concat(_toConsumableArray(prev));
            switch (type) {
                case 'update':
                    var _changes = _slicedToArray(changes, 2),
                        newProps = _changes[0],
                        predicate = _changes[1];

                    if (!(predicate instanceof Object)) {
                        // it's index
                        prev.map(function (item, i) {
                            return [i, item];
                        }).filter(function (pair) {
                            return Number(pair[0]) === Number(predicate);
                        }).forEach(function (i) {
                            next[i[0]] = Object.assign({}, next[i[0]], newProps);
                        });
                    } else {
                        prev.map(function (item, i) {
                            return [i, item];
                        }).filter(function (pair) {
                            return matches(pair[1], predicate);
                        }).forEach(function (i) {
                            next[i[0]] = Object.assign({}, next[i[0]], newProps);
                        });
                    }
                    break;
                case 'delete':
                    next = next.filter(function (item, i) {
                        if (changes instanceof Object) {
                            return !matches(item, changes);
                        } else {
                            return Number(i) !== changes;
                        }
                    });
                    break;
                case 'create':
                    if (changes instanceof Array) {
                        changes.forEach(function (item) {
                            return next.push(item);
                        });
                    } else {
                        next.push(changes);
                    }
                    break;
            }
            return next;
        }, res, '^'];
    },
    merge: function merge(_ref7) {
        var _ref8 = _toArray(_ref7),
            map = _ref8[0],
            others = _ref8.slice(1);

        if (isJustObject(map)) {
            var res = ['funnel', function (cell, val) {
                return [cell, val];
            }].concat(_toConsumableArray(Object.keys(map)));
            return [function (_ref9) {
                for (var _len2 = arguments.length, otherArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    otherArgs[_key2 - 1] = arguments[_key2];
                }

                var _ref10 = _slicedToArray(_ref9, 2),
                    cell = _ref10[0],
                    val = _ref10[1];

                return map[cell] instanceof Function ? map[cell].apply(map, [val].concat(otherArgs)) : map[cell];
            }, res].concat(_toConsumableArray(others));
        } else {
            var f = function f(a) {
                return a;
            };
            var args = [map].concat(_toConsumableArray(others));
            if (map instanceof Function) {
                f = map;
                args = others;
            }
            return ['funnel', function (cell, val) {
                return f(val);
            }].concat(_toConsumableArray(args));
        }
    },
    toggle: function toggle(_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2),
            setTrue = _ref12[0],
            setFalse = _ref12[1];

        return ['funnel', function (a, b) {
            return b;
        }, [always(true), setTrue], [always(false), setFalse]];
    },
    debounce: function debounce(_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2),
            time = _ref14[0],
            arg = _ref14[1];

        return ['async.closure', function () {
            var val = void 0,
                isTimeOut = false;
            return function (cb, value) {
                if (!isTimeOut) {
                    isTimeOut = setTimeout(function () {
                        isTimeOut = false;
                        cb(val);
                    }, time);
                } else {
                    //console.log('throttled', value);
                }
                val = value;
            };
        }, arg];
    },
    promise: function promise(_ref15) {
        var _ref16 = _toArray(_ref15),
            func = _ref16[0],
            argCells = _ref16.slice(1);

        if (!func instanceof Function) {
            argCells = [func].concat(_toConsumableArray(argCells));
            func = function func(a) {
                return a;
            };
        }
        return ['nested.closure', function () {
            var latest_num = void 0;
            var c = 0;
            var load_count = 0;
            return function (cb) {
                for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    args[_key3 - 1] = arguments[_key3];
                }

                ++load_count;
                cb('status', 'pending');
                var res = func.apply(null, args);
                if (!isPromise(res)) {
                    // some error
                    return;
                } else {
                    latest_num = ++c;
                    res.then(function (i, data) {
                        if (! --load_count) {
                            cb('status', 'resolved');
                        }
                        if (i !== latest_num) {
                            return;
                        } else {
                            cb('data', data);
                            cb('error', null);
                        }
                    }.bind(null, c)).catch(function (i, e) {
                        if (! --load_count) {
                            cb('status', 'error');
                        }
                        if (i !== latest_num) {
                            return;
                        } else {
                            cb('data', null);
                            cb('error', e);
                        }
                    }.bind(null, c));
                }
            };
        }].concat(_toConsumableArray(argCells));
    },
    split: function split(_ref17) {
        var _ref18 = _toArray(_ref17),
            map = _ref18[0],
            argCells = _ref18.slice(1);

        return ['nested', function (cb) {
            for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                args[_key4 - 1] = arguments[_key4];
            }

            for (var k in map) {
                var res = map[k].apply(null, args);
                if (res !== undefined && res !== null && res !== false) {
                    cb(k, res);
                }
            }
        }].concat(_toConsumableArray(argCells));
    },
    transist: function transist(cells) {
        return [function (a, b) {
            return a ? b : skip;
        }].concat(_toConsumableArray(cells));
    },
    closureMerge: function closureMerge(_ref19) {
        var _ref20 = _slicedToArray(_ref19, 2),
            initVal = _ref20[0],
            map = _ref20[1];

        var cells = Object.keys(map);
        return ['closure.funnel', function () {
            return function (cell, val) {
                if (map[cell] instanceof Function) {
                    return initVal = map[cell].call(null, initVal, val);
                } else {
                    return initVal = map[cell];
                }
            };
        }].concat(_toConsumableArray(cells));
    },
    closureMap: function closureMap(_ref21) {
        var _ref22 = _slicedToArray(_ref21, 2),
            initVal = _ref22[0],
            map = _ref22[1];

        var cells = Object.keys(map);
        return ['closure.funnel', function () {
            return function (cell, val) {
                if (map[cell] instanceof Function) {
                    return initVal = map[cell].call(null, initVal, val);
                } else {
                    return initVal = map[cell];
                }
            };
        }].concat(_toConsumableArray(cells));
    },
    mapPrev: function mapPrev(_ref23) {
        var _ref24 = _slicedToArray(_ref23, 1),
            map = _ref24[0];

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
    join: function join(_ref25) {
        var _ref26 = _toArray(_ref25),
            fields = _ref26.slice(0);

        return ['funnel', function (cell, val) {
            return val;
        }].concat(_toConsumableArray(fields));
    },
    '&&': function _(_ref27) {
        var _ref28 = _toArray(_ref27),
            cells = _ref28.slice(0);

        return [function () {
            var res = true;
            for (var i in arguments) {
                res = res && arguments[i];
                if (!res) {
                    return res;
                }
            }
            return res;
        }].concat(_toConsumableArray(cells));
    },
    '||': function _(_ref29) {
        var _ref30 = _toArray(_ref29),
            cells = _ref30.slice(0);

        return [function () {
            var res = false;
            for (var i in arguments) {
                res = res || arguments[i];
                if (res) {
                    return res;
                }
            }
            return res;
        }].concat(_toConsumableArray(cells));
    },
    trigger: function trigger(_ref31) {
        var _ref32 = _slicedToArray(_ref31, 2),
            field = _ref32[0],
            val = _ref32[1];

        return [function (a) {
            return a === val ? true : skip;
        }, field];
    },
    skipSame: function skipSame(_ref33) {
        var _ref34 = _slicedToArray(_ref33, 1),
            field = _ref34[0];

        return [function (z, x) {
            return shallow_equal(z, x) ? skip : z;
        }, field, '^'];
    },
    skipIf: function skipIf(_ref35) {
        var _ref36 = _toArray(_ref35),
            func = _ref36[0],
            fields = _ref36.slice(1);

        if (!fields.length) {
            fields = [func];
            func = function func(a) {
                return a;
            };
        }
        return [function () {
            var res = func.apply(null, arguments);
            return !res ? true : skip;
        }].concat(_toConsumableArray(fields));
    },
    when: function when(_ref37) {
        var _ref38 = _toArray(_ref37),
            func = _ref38[0],
            fields = _ref38.slice(1);

        if (!fields.length) {
            fields = [func];
            func = function func(a) {
                return a;
            };
        }
        return [function () {
            var res = func.apply(null, arguments);
            return !!res ? true : skip;
        }].concat(_toConsumableArray(fields));
    },
    turnsFromTo: function turnsFromTo(_ref39) {
        var _ref40 = _slicedToArray(_ref39, 3),
            from = _ref40[0],
            to = _ref40[1],
            cell = _ref40[2];

        return ['closure', function () {
            var prev_val = void 0;
            return function (val) {
                if (val === to && prev_val === from) {
                    prev_val = val;
                    return true;
                } else {
                    prev_val = val;
                    return skip;
                }
            };
        }, cell];
    },
    skipN: function skipN(_ref41) {
        var _ref42 = _slicedToArray(_ref41, 2),
            field = _ref42[0],
            n = _ref42[1];

        return ['closure', function () {
            var count = 0;
            n = n || 1;
            return function (val) {
                if (++count > n) {
                    return val;
                } else {
                    return skip;
                }
            };
        }, field];
    },
    accum: function accum(_ref43) {
        var _ref44 = _slicedToArray(_ref43, 2),
            cell = _ref44[0],
            time = _ref44[1];

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

var mrrJoin = function mrrJoin() {
    var child_struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent_struct = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var struct = Object.assign({}, parent_struct, child_struct);
    if (parent_struct && child_struct && parent_struct.$init && child_struct.$init) {
        struct.$init = Object.assign({}, parent_struct.$init || {}, child_struct.$init || {});
    }
    for (var k in struct) {
        if (k[0] === '+') {
            var real_k = k.substr(1);
            if (!struct[real_k]) {
                struct[real_k] = struct[k];
            } else {
                struct[real_k] = ['join', struct[k], struct[real_k]];
            }
            delete struct[k];
        }
    }
    return struct;
};

var objMap = function objMap(obj, func) {
    var res = {};
    for (var i in obj) {
        var _func = func(obj[i], i),
            _func2 = _slicedToArray(_func, 2),
            val = _func2[0],
            key = _func2[1];

        res[key] = val;
    }
    return res;
};

var withMrr = exports.withMrr = function withMrr(mrrStructure) {
    var _render = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var parentClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var mrrParentClass = mrrStructure;
    var parent = parentClass || _react2.default.Component;
    _render = _render || parent.prototype.render || function () {
        return null;
    };
    mrrParentClass = function (_parent) {
        _inherits(MyMrrComponent, _parent);

        function MyMrrComponent() {
            _classCallCheck(this, MyMrrComponent);

            return _possibleConstructorReturn(this, (MyMrrComponent.__proto__ || Object.getPrototypeOf(MyMrrComponent)).apply(this, arguments));
        }

        _createClass(MyMrrComponent, [{
            key: '__mrrGetComputed',
            value: function __mrrGetComputed() {
                var parent_struct = parent.prototype.__mrrGetComputed ? parent.prototype.__mrrGetComputed.apply(this) : {};
                return mrrJoin(this.props.__mrr, mrrJoin(mrrStructure instanceof Function ? mrrStructure(this.props || {}) : mrrStructure, parent_struct));
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var self = this;
                return _render.call(this, this.state, this.props, this.toState.bind(this), function (as) {
                    return { mrrConnect: _this2.mrrConnect(as) };
                });
            }
        }]);

        return MyMrrComponent;
    }(parent);
    var cls = function (_mrrParentClass) {
        _inherits(Mrr, _mrrParentClass);

        function Mrr(props, context, already_inited) {
            _classCallCheck(this, Mrr);

            var _this3 = _possibleConstructorReturn(this, (Mrr.__proto__ || Object.getPrototypeOf(Mrr)).call(this, props, context, true));

            if (already_inited) {
                //return;
            }
            _this3.props = props || {};
            _this3.__mrr = {
                closureFuncs: {},
                children: {},
                childrenCounter: 0,
                anonCellsCounter: 0,
                linksNeeded: {},
                constructing: true,
                thunks: {},
                skip: skip,
                expose: {},
                signalCells: {}
            };
            if (props && props.extractDebugMethodsTo) {
                props.extractDebugMethodsTo.getState = function () {
                    return _this3.mrrState;
                };
            }
            if (!_this3.__mrr.valueCells) {
                _this3.__mrr.valueCells = {};
            }
            _this3.__mrr.realComputed = Object.assign({}, objMap(_this3.__mrrGetComputed(), function (val, key) {
                if (key[0] === '~') {
                    key = key.substr(1);
                    _this3.__mrr.signalCells[key] = true;
                }
                if (key[0] === '=') {
                    key = key.substr(1);
                    _this3.__mrr.valueCells[key] = true;
                }
                return [val, key];
            }));
            _this3.parseMrr();
            if (GG && _this3.__mrr.linksNeeded['^']) {
                GG.__mrr.subscribers.push(_this3);
            }
            _this3.state = _this3.initialState;
            if (_this3.props.mrrConnect) {
                _this3.props.mrrConnect.subscribe(_this3);
            }
            _this3.__mrr.constructing = false;
            return _this3;
        }

        _createClass(Mrr, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.setState({
                    $start: true,
                    $props: this.props
                });
            }
        }, {
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                this.setState({ $props: nextProps });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.setState({ $end: true });
                if (this.__mrrParent) {
                    delete this.__mrrParent.__mrr.children[this.__mrrLinkedAs];
                }
                if (GG && this.__mrr.linksNeeded['^']) {
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
                    if (cell === '^' || cell === skip) {
                        // prev val of cell or "no cell"
                        continue;
                    }
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
                        var rowCopy = this.__mrr.realComputed[key].slice();
                        rowCopy[k] = anonName;
                        this.__mrr.realComputed[key] = rowCopy;
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
                    if (cell[0] === '-') {
                        // passive listening
                        continue;
                    }
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
                this.mrrState = Object.assign({}, this.state);
                var updateOnInit = {};
                for (var key in mrr) {
                    var fexpr = mrr[key];
                    if (key === '$log') continue;
                    if (fexpr === skip) continue;
                    if (key === '$meta') continue;
                    if (key === '$init') {
                        var init_vals = mrr[key] instanceof Function ? mrr[key](this.props) : mrr[key];
                        for (var cell in init_vals) {
                            this.__mrrSetState(cell, init_vals[cell], []);
                            updateOnInit[cell] = init_vals[cell];
                        }
                        continue;
                    }
                    if (key === "$expose") {
                        if (fexpr instanceof Array) {
                            var obj = {};
                            for (var k in fexpr) {
                                obj[fexpr[k]] = fexpr[k];
                            }
                            fexpr = obj;
                        }
                        this.__mrr.expose = fexpr;
                        continue;
                    };
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
                //console.log('parsed depMap', this.mrrDepMap);
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
                this.setState(_defineProperty({}, key, val), null, null, true);
            }
        }, {
            key: 'mrrConnect',
            value: function mrrConnect(as) {
                var _this4 = this;

                var self = this;
                if (isUndef(as)) {
                    as = '__rand_child_name_' + ++this.__mrr.childrenCounter;
                }
                return {
                    subscribe: function subscribe(child) {
                        child.$name = as;
                        child.state.$name = as;
                        _this4.__mrr.children[as] = child;
                        child.__mrrParent = self;
                        child.__mrrLinkedAs = as;
                        for (var a in child.__mrr.linksNeeded['..']) {
                            var child_cells = child.__mrr.linksNeeded['..'][a];
                            var val = self.mrrState[a];
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = child_cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var cell = _step2.value;

                                    child.mrrState[cell] = val;
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
                        }
                        if (_this4.__mrr.realComputed.$log && (_this4.__mrr.realComputed.$log === true || _this4.__mrr.realComputed.$log.indexOf('$$mount') !== -1)) {
                            if (_this4.__mrr.realComputed.$log === 'no-colour') {
                                console.log('CONNECTED: ' + (_this4.$name || '/') + as);
                            } else {
                                console.log('%c CONNECTED: ' + (_this4.$name || '/') + as, log_styles_mount);
                            }
                        }
                    }
                };
            }
        }, {
            key: 'toState',
            value: function toState(key, val) {
                var _this5 = this;

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
                            if (a && a.target && a.target.type) {
                                if (a.target.type === 'checkbox') {
                                    value = a.target.checked;
                                } else {
                                    a.preventDefault();
                                    if (a.target.type === 'submit') {
                                        value = true;
                                    } else {
                                        value = a.target.value;
                                    }
                                }
                            } else {
                                value = a;
                            }
                        }
                        if (value === skip) {
                            return;
                        }
                        if (key instanceof Array) {
                            var ns = {};
                            key.forEach(function (k) {
                                ns[k] = value;
                            });
                            _this5.setState(ns, null, null, true);
                        } else {
                            _this5.setState(_defineProperty({}, key, value), null, null, true);
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
                var _this6 = this;

                var arg_cells = this.__mrr.realComputed[cell].slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2).filter(function (a) {
                    return a !== skip;
                });
                var res = arg_cells.map(function (arg_cell) {
                    if (arg_cell === '^') {
                        //console.log('looking for prev val of', cell, this.mrrState, this.state);
                        return _this6.mrrState[cell];
                    } else {
                        if (arg_cell[0] === '-') {
                            arg_cell = arg_cell.slice(1);
                        }
                        if (arg_cell === '$name') {
                            return _this6.$name;
                        }
                        return _this6.mrrState[arg_cell] === undefined && _this6.state && _this6.__mrr.constructing ? _this6.initialState[arg_cell] : _this6.mrrState[arg_cell];
                    }
                });
                return res;
            }
        }, {
            key: '__mrrUpdateCell',
            value: function __mrrUpdateCell(cell, parent_cell, update, parent_stack) {
                var _this7 = this;

                var val,
                    func,
                    args,
                    _updateNested,
                    types = [];
                var superSetState = _get(Mrr.prototype.__proto__ || Object.getPrototypeOf(Mrr.prototype), 'setState', this);
                var updateFunc = function updateFunc(val) {
                    if (val === skip) {
                        return;
                    }
                    _this7.__mrrSetState(cell, val, parent_cell, parent_stack);
                    var update = {};
                    update[cell] = val;
                    _this7.checkMrrCellUpdate(cell, update, parent_stack, val);
                    superSetState.call(_this7, update, null, true);
                };
                var fexpr = this.__mrr.realComputed[cell];
                if (typeof fexpr[0] === 'string') {
                    types = fexpr[0].split('.');
                }

                if (types.indexOf('nested') !== -1) {
                    _updateNested = function updateNested(subcell, val) {
                        if (subcell instanceof Object) {
                            for (var k in subcell) {
                                _updateNested(k, subcell[k]);
                            }
                            return;
                        }
                        var subcellname = cell + '.' + subcell;
                        var stateSetter = mrrParentClass.prototype.setState || function () {};
                        _this7.__mrrSetState(subcellname, val, parent_cell, parent_stack);
                        var update = {};
                        update[subcellname] = val;
                        _this7.checkMrrCellUpdate(subcellname, update, parent_stack, val);
                        stateSetter.call(_this7, update, null, true);
                        var nested_update = _defineProperty({}, cell, _this7.mrrState[cell] instanceof Object ? _this7.mrrState[cell] : {});
                        nested_update[cell][subcell] = val;
                        stateSetter.call(_this7, nested_update, null, true);
                    };
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
                        args.unshift(_updateNested);
                    }
                    if (types.indexOf('async') !== -1) {
                        args.unshift(updateFunc);
                    }
                    if (types.indexOf('closure') !== -1) {
                        if (!this.__mrr.closureFuncs[cell]) {
                            var init_val = this.mrrState[cell];
                            this.__mrr.closureFuncs[cell] = fexpr[1](init_val);
                        }
                        func = this.__mrr.closureFuncs[cell];
                    } else {
                        func = this.__mrr.realComputed[cell][1];
                    }
                    if (!func || !func.apply) {
                        throw new Error('MRR_ERROR_101: closure type should provide function');
                    }
                    try {
                        val = func.apply(null, args);
                    } catch (e) {
                        if (this.__mrr.realComputed['$err.' + cell]) {
                            this.setState(_defineProperty({}, '$err.' + cell, e));
                        } else {
                            if (this.__mrr.realComputed.$err) {
                                this.setState({ $err: e });
                            } else {
                                throw e;
                            }
                        }
                        return;
                    }
                }
                if (types && types.indexOf('nested') !== -1) {
                    if (val instanceof Object) {
                        for (var k in val) {
                            _updateNested(k, val[k]);
                        }
                    }
                    return;
                }
                if (types && types.indexOf('async') !== -1) {
                    // do nothing!
                    return;
                }
                var current_val = this.mrrState[cell];
                if (this.__mrr.valueCells[cell] && shallow_equal(current_val, val)) {
                    //console.log('Duplicate', cell, val, this.__mrr.valueCells);
                    return;
                }
                if (isPromise(val)) {
                    val.then(updateFunc);
                } else {
                    if (val === skip) {
                        return;
                    }
                    update[cell] = val;
                    this.__mrrSetState(cell, val, parent_cell, parent_stack);
                    this.checkMrrCellUpdate(cell, update, parent_stack, val);
                }
            }
        }, {
            key: 'checkMrrCellUpdate',
            value: function checkMrrCellUpdate(parent_cell, update) {
                var parent_stack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
                var val = arguments[3];

                if (this.mrrDepMap[parent_cell]) {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = this.mrrDepMap[parent_cell][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var cell = _step3.value;

                            var next_parent_stack = this.__mrr.realComputed.$log ? [].concat(_toConsumableArray(parent_stack), [[parent_cell, val]]) : parent_stack;
                            this.__mrrUpdateCell(cell, parent_cell, update, next_parent_stack);
                        }
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
            }
        }, {
            key: '__mrrSetState',
            value: function __mrrSetState(key, val, parent_cell, parent_stack) {
                //@ todo: omit @@anon cells
                if (this.__mrr.realComputed.$log && key[0] !== '@') {
                    if (this.__mrr.realComputed.$log && !(this.__mrr.realComputed.$log instanceof Array) || this.__mrr.realComputed.$log instanceof Array && this.__mrr.realComputed.$log.indexOf(key) !== -1) {
                        if (this.__mrr.realComputed.$log === 'no-colour') {
                            console.log(key, val);
                        } else {
                            console.log('%c ' + this.__mrrPath + '::' + key
                            //+ '(' + parent_cell +') '
                            , log_styles_cell, val
                            //, JSON.stringify(parent_stack)
                            //, this
                            );
                        }
                    }
                }
                this.mrrState[key] = val;

                if (GG && GG === this) {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = this.__mrr.subscribers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var sub = _step4.value;

                            if (sub && sub.__mrr.linksNeeded['^'][key]) {
                                updateOtherGrid(sub, '^', key, this.mrrState[key]);
                            }
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
                } else {
                    for (var _as in this.__mrr.children) {
                        if (this.__mrr.children[_as].__mrr.linksNeeded['..'] && this.__mrr.children[_as].__mrr.linksNeeded['..'][key] && val === this.mrrState[key]) {
                            updateOtherGrid(this.__mrr.children[_as], '..', key, this.mrrState[key]);
                        }
                    }
                    var as = this.__mrrLinkedAs;
                    if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded[as] && this.__mrrParent.__mrr.linksNeeded[as][key] && val === this.mrrState[key]) {
                        updateOtherGrid(this.__mrrParent, as, key, this.mrrState[key]);
                    }
                    if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded['*'] && this.__mrrParent.__mrr.linksNeeded['*'][key] && val === this.mrrState[key]) {
                        updateOtherGrid(this.__mrrParent, '*', key, this.mrrState[key]);
                    }
                    if (this.__mrr.expose && this.__mrr.expose[key] && GG && GG.__mrr.linksNeeded['*'] && GG.__mrr.linksNeeded['*'][this.__mrr.expose[key]] && val === this.mrrState[key]) {
                        updateOtherGrid(GG, '*', this.__mrr.expose[key], this.mrrState[key]);
                    }
                }
            }
        }, {
            key: 'getUpdateQueue',
            value: function getUpdateQueue(cell) {}
        }, {
            key: 'setState',
            value: function setState(ns, cb, alreadyRun, topLevel) {
                if (!(ns instanceof Object)) {
                    ns = ns.call(null, this.state, this.props);
                }
                var update = Object.assign({}, ns);
                if (!alreadyRun) {
                    for (var cell in update) {
                        this.__mrrSetState(cell, update[cell], null, []);
                    }
                    for (var parent_cell in update) {
                        this.checkMrrCellUpdate(parent_cell, update);
                    }
                }
                if (!this.__mrr.constructing) {
                    return (mrrParentClass.prototype.setState || function () {}).call(this, update, cb, true);
                } else {
                    for (var _cell in update) {
                        this.initialState[_cell] = update[_cell];
                    }
                }
            }
        }, {
            key: '__mrrMacros',
            get: function get() {
                return Object.assign({}, defMacros, global_macros);
            }
        }, {
            key: '__mrrPath',
            get: function get() {
                return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : 'root';
            }
        }]);

        return Mrr;
    }(mrrParentClass);
    return cls;
};

var def = withMrr({}, null, _react2.default.Component);
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
            key: '__mrrGetComputed',
            value: function __mrrGetComputed() {
                return struct;
            }
        }]);

        return GlobalGrid;
    }();

    var GlobalGridClass = withMrr(null, null, GlobalGrid);
    GG = new GlobalGridClass();
    GG.__mrr.subscribers = [];
    return GG;
};

exports.default = def;