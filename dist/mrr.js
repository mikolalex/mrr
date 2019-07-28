'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Grid = exports.shallow_equal = exports.registerMacros = exports.skip = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _gridMacros = require('./gridMacros');

var _gridMacros2 = _interopRequireDefault(_gridMacros);

var _operators = require('./operators');

var _operators2 = _interopRequireDefault(_operators);

var _cell7 = require('./cell');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var skip = exports.skip = new function MrrSkip() {}();

var cell_types = ['funnel', 'closure', 'nested', 'async'];
var global_macros = {};

var log_styles_cell = 'background: #898cec; color: white; padding: 1px;';
var log_styles_mount = 'background: green; color: white; padding: 1px;';

var registerMacros = exports.registerMacros = function registerMacros(name, func) {
    global_macros[name] = func;
};

var html_aspects = {
    val: function val() {
        return ['Change', function (e) {
            return e.target.value;
        }];
    },
    click: function click() {
        return ['Click', function (e) {
            return e;
        }];
    }

    //  ERR_COUNTER = 1

};var isMatchingType = function isMatchingType(master_type, slave_type, types, actions) {
    if (master_type === slave_type) {
        actions.matches ? actions.matches() : null;
        return;
    }
    if (!types[slave_type]) {
        throw new Error('MRERR_102: cannot find type: ' + slave_type);
    }
    var _matches = false;
    if (types[master_type].extends) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = types[master_type].extends[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var parent_type = _step.value;

                isMatchingType(parent_type, slave_type, types, {
                    matches: function matches() {
                        actions.matches();
                        _matches = true;
                    }
                });
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
    if (_matches) return;
    var _maybe = false;
    if (types[slave_type].extends) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = types[slave_type].extends[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _parent_type = _step2.value;

                isMatchingType(master_type, _parent_type, types, {
                    matches: function matches() {
                        if (types[slave_type].extends.length > 1) {
                            actions.matches ? actions.matches() : null;
                        } else {
                            actions.maybe ? actions.maybe() : null;
                        }
                        _maybe = true;
                    },
                    maybe: function maybe() {
                        actions.maybe ? actions.maybe() : null;
                        _maybe = true;
                    }
                });
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
    if (_maybe) return;
    actions.not ? actions.not() : null;
};

var currentChange = void 0;
var currentChangeCells = void 0;
var ids = 0;
var type_delimiter = ': ';

var allGrids = {};

var isUndef = function isUndef(a) {
    return a === null || a === undefined;
};

var runGridMethodIfExists = function runGridMethodIfExists(method, id) {
    for (var _len = arguments.length, params = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        params[_key - 2] = arguments[_key];
    }

    if (allGrids[id]) {
        var _allGrids$id;

        (_allGrids$id = allGrids[id])[method].apply(_allGrids$id, params);
    }
};

var shallow_equal = exports.shallow_equal = function shallow_equal(a, b) {
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

var updateOtherGrid = function updateOtherGrid(grid, as, key, val, level) {
    var his_cells = grid.__mrr.linksNeeded[as][key];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = his_cells[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var cell = _step3.value;

            grid.setState(_defineProperty({}, cell, val), level);
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
};

var swapObj = function swapObj(a) {
    var b = {};
    for (var k in a) {
        b[a[k]] = k;
    }
    return b;
};

var objFlipArr = function objFlipArr(a) {
    var b = {};
    for (var k in a) {
        if (!b[a[k]]) {
            b[a[k]] = [];
        }
        b[a[k]].push(k);
    }
    return b;
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

var isPromise = function isPromise(a) {
    return a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
};

var systemCells = ['$start', '$end', '$state', '^/$state', '$props', '$name', '$async', '$nested', '$changedCellName'];

var recur = function recur(obj, key, func) {
    func(obj);
    var val = obj;
    if (key instanceof Array) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = key[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var field = _step4.value;

                val = val[field];
                if (!val) break;
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
        val = val[key];
    }
    if (val) {
        for (var k in val) {
            recur(val[k], key, func);
        }
    }
};

var Mrr = function () {
    function Mrr(mrrStructure) /* setOuterState = () => {}, *macros = CellMacros, dataTypes = {}, GG = false*/{
        var _this = this;

        var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Mrr);

        this.macros = meta.macros || _operators2.default;
        this.GG = meta.GG && meta.GG !== true ? meta.GG : null;
        this.dataTypes = meta.dataTypes || {};
        this.setOuterState = meta.setOuterState || function () {};
        this.isGG = meta.GG === true;
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
            skip: skip,
            expose: {},
            signalCells: {},
            dataTypes: {},
            dom_based_cells: {},
            root_el_handlers: {},
            alreadyInitedLinkedCells: {}
        };
        allGrids[this.__mrr.id] = this;

        if (props && props.extractDebugMethodsTo) {
            props.extractDebugMethodsTo.getState = function () {
                return _this.mrrState;
            };
            props.extractDebugMethodsTo.self = this;
        }
        if (!this.__mrr.valueCells) {
            this.__mrr.valueCells = {};
        }
        this.__mrr.realComputed = Object.assign({}, objMap(mrrStructure, function (val, key) {
            if (key[0] === '~') {
                key = key.substr(1);
                _this.__mrr.signalCells[key] = true;
            }
            if (key[0] === '=') {
                key = key.substr(1);
                _this.__mrr.valueCells[key] = true;
            }
            if (key.indexOf(type_delimiter) !== -1) {
                var type = void 0;

                var _key$split = key.split(type_delimiter);

                var _key$split2 = _slicedToArray(_key$split, 2);

                key = _key$split2[0];
                type = _key$split2[1];

                _this.setCellDataType(key, type);
            }
            return [val, key];
        }));
        this.parseMrr();
        if (this.GG) {
            if (this.__mrr.linksNeeded['^']) {
                this.GG.__mrr.subscribers.push(this);
                this.checkLinkedCellsTypes(this, this.GG, '^');
                for (var a in this.__mrr.linksNeeded['^']) {
                    var child_cells = this.__mrr.linksNeeded['^'][a];
                    var val = this.GG.mrrState[a];
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = child_cells[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var cell = _step5.value;

                            this.mrrState[cell] = val;
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
                }
            }
            this.checkLinkedCellsTypes(this.GG, this, '*');
        }
        //this.state = this.initialState;
        if (this.props.mrrConnect) {
            this.props.mrrConnect.subscribe(this);
        }
        this.__mrr.constructing = false;
    }

    _createClass(Mrr, [{
        key: 'onMount',
        value: function onMount() {
            this.setState({
                $start: true
            });
        }
    }, {
        key: 'onUnmount',
        value: function onUnmount() {
            this.setState({ $end: true });
            if (this.__mrrParent) {
                delete this.__mrrParent.__mrr.children[this.__mrrLinkedAs];
            }
            if (this.GG && this.__mrr.linksNeeded['^']) {
                var i = this.GG.__mrr.subscribers.indexOf(this);
                delete this.GG.__mrr.subscribers[i];
            }
            delete allGrids[this.__mrr.id];
        }
    }, {
        key: 'setCellDataType',
        value: function setCellDataType(cell, type) {
            if (!this.dataTypes[type]) {
                throw new Error('MRERR_106: Undeclared type: ' + type);
            }
            cell = cell[0] === '-' ? cell.slice(1) : cell;
            if (!this.__mrr.dataTypes[cell]) {
                this.__mrr.dataTypes[cell] = type;
            } else {
                if (this.__mrr.dataTypes[cell] !== type) {
                    throw new Error("MRERR_107: Different type annotation for the same cell found: " + this.__mrr.dataTypes[cell] + ', ' + type + ' for cell "' + cell + '"');
                }
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
                            throw new Error('MRERR_108: Macros "' + cell + '" not found!');
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
                if (!cell) {
                    throw new Error('No cell!');
                }
                if (cell.indexOf(type_delimiter) !== -1) {
                    var type = void 0;

                    var _cell$split = cell.split(type_delimiter);

                    var _cell$split2 = _slicedToArray(_cell$split, 2);

                    cell = _cell$split2[0];
                    type = _cell$split2[1];

                    row[k] = cell;
                    this.setCellDataType(cell, type);
                }

                if (cell.indexOf('|') !== -1) {
                    this.__mrr.usesEventDelegation = true;
                    var real_cell = cell[0] === '-' ? cell.slice(1) : cell;
                    if (!this.__mrr.dom_based_cells[real_cell]) {
                        var _real_cell$split$map = real_cell.split('|').map(function (a) {
                            return a.trim();
                        }),
                            _real_cell$split$map2 = _slicedToArray(_real_cell$split$map, 2),
                            selector = _real_cell$split$map2[0],
                            aspect = _real_cell$split$map2[1];

                        var _html_aspects$aspect = html_aspects[aspect](),
                            _html_aspects$aspect2 = _slicedToArray(_html_aspects$aspect, 2),
                            event_type = _html_aspects$aspect2[0],
                            handler = _html_aspects$aspect2[1];

                        if (!this.__mrr.root_el_handlers[event_type]) {
                            this.__mrr.root_el_handlers[event_type] = [];
                        }
                        this.__mrr.root_el_handlers[event_type].push([selector, handler, real_cell]);

                        this.__mrr.dom_based_cells[real_cell] = true;
                    }
                }

                if (cell.indexOf('/') !== -1) {
                    var _cell$split3 = cell.split('/'),
                        _cell$split4 = _slicedToArray(_cell$split3, 2),
                        from = _cell$split4[0],
                        parent_cell = _cell$split4[1];

                    if (parent_cell.indexOf('~') === 0) {
                        parent_cell = parent_cell.substr(1);
                        if (!this.__mrr.immediatelyUpdatedLinks) {
                            this.__mrr.immediatelyUpdatedLinks = {};
                        }
                        this.__mrr.immediatelyUpdatedLinks[parent_cell] = true;
                    }
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
                } else {
                    this.mentionedCells[cell[0] === '-' ? cell.slice(1) : cell] = true;
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
        key: 'logChange',
        value: function logChange() {
            var currentLevel = -1;
            //console.log('CHANGE', currentChange);
            for (var k in currentChange) {
                var _currentChange$k = _slicedToArray(currentChange[k], 4),
                    str = _currentChange$k[0],
                    style = _currentChange$k[1],
                    val = _currentChange$k[2],
                    level = _currentChange$k[3];

                if (level > currentLevel + 1) {
                    var diff = level - (currentLevel + 1);
                    for (var j = k; currentChange[j] && currentChange[j][3] >= currentLevel; j++) {
                        currentChange[j][3] -= diff;
                    }
                }
                currentLevel = level;
            }
            currentLevel = -1;
            console.group('');
            for (var _k2 in currentChange) {
                var _currentChange$_k = _slicedToArray(currentChange[_k2], 4),
                    str = _currentChange$_k[0],
                    style = _currentChange$_k[1],
                    val = _currentChange$_k[2],
                    level = _currentChange$_k[3];

                if (level !== currentLevel) {
                    if (level > currentLevel) {
                        //console.group(level);
                    } else {
                        var riz = currentLevel - level;
                        for (var s = currentLevel; s > level; s--) {
                            //console.groupEnd();
                        }
                    }
                }
                //if(level <= currentLevel){
                console.log.apply(console, [new Array(level + 1).fill('').join('___') + ' ' + str, style, val]);
                //}
                currentLevel = level;
            }
            for (var _s = currentLevel; _s >= 0; _s--) {
                //console.groupEnd();
            }
            console.groupEnd();
        }
    }, {
        key: 'parseMrr',
        value: function parseMrr() {
            var depMap = {};
            this.mentionedCells = {};
            var mrr = this.__mrr.realComputed;
            this.mrrState = Object.assign({}, this.state);
            var updateOnInit = {};
            for (var key in mrr) {
                if (key === 'undefined') {
                    throw new Error('MRERR_117: cellname cannot be undefined or "undefined"!');
                }
                var fexpr = mrr[key];
                if (key === '$log') continue;
                if (key === '$debug') continue;
                if (fexpr === skip) continue;
                if (fexpr === _cell7.fromDOM) continue;
                if (fexpr === _cell7.fromParent) continue;
                if (fexpr === _cell7.fromChildren) continue;
                if (fexpr === _cell7.fromOthers) continue;
                if (systemCells.indexOf(key) !== -1) {
                    throw new Error('MRERR_109: Cannot redefine system cell: ' + key);
                }
                if (key === '$init') {
                    if (mrr.$log && mrr.$log.showTree) {
                        currentChange = [];
                    }
                    if (mrr.$debug) {
                        currentChangeCells = {};
                    }
                    var init_vals = mrr[key] instanceof Function ? mrr[key](this.props) : mrr[key];
                    for (var cell in init_vals) {
                        this.__mrrSetState(cell, init_vals[cell], null, [], 0);
                        updateOnInit[cell] = init_vals[cell];
                    }
                    if (mrr.$log && mrr.$log.showTree) {
                        this.logChange();
                    }
                    continue;
                }
                if (key === "$expose") {
                    if (fexpr instanceof Array) {
                        var obj = {};
                        for (var k in fexpr) {
                            obj[fexpr[k]] = fexpr[k];
                        }
                        this.__mrr.expose = obj;
                    } else {
                        this.__mrr.expose = swapObj(fexpr);
                    }
                    continue;
                };
                if (key === "$readFromDOM") {
                    this.__mrr.readFromDOM = {};
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = fexpr[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var item = _step6.value;

                            this.__mrr.readFromDOM[item] = true;
                        }
                    } catch (err) {
                        _didIteratorError6 = true;
                        _iteratorError6 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                _iterator6.return();
                            }
                        } finally {
                            if (_didIteratorError6) {
                                throw _iteratorError6;
                            }
                        }
                    }

                    continue;
                };
                if (key === "$meta") {
                    if (fexpr.strict) {
                        this.__mrr.strict = true;
                    }
                    if (fexpr.writeToDOM) {
                        this.__mrr.writeToDOM = {};
                        var _iteratorNormalCompletion7 = true;
                        var _didIteratorError7 = false;
                        var _iteratorError7 = undefined;

                        try {
                            for (var _iterator7 = fexpr.writeToDOM[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                var _item = _step7.value;

                                this.__mrr.writeToDOM[_item] = true;
                            }
                        } catch (err) {
                            _didIteratorError7 = true;
                            _iteratorError7 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }
                            } finally {
                                if (_didIteratorError7) {
                                    throw _iteratorError7;
                                }
                            }
                        }
                    }
                    continue;
                };
                if (key === "$writeToDOM") {
                    this.__mrr.writeToDOM = {};
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = fexpr[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var _item2 = _step8.value;

                            this.__mrr.writeToDOM[_item2] = true;
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }

                    continue;
                };
                if (key === "$toBeLinked") {
                    this.__mrr.toBeLinked = {};
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = fexpr[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var _item3 = _step9.value;

                            this.__mrr.toBeLinked[_item3] = true;
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                _iterator9.return();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
                    }

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
                        throw new Error('MRERR_114: wrong F-expression: ' + fexpr + '. Only strings and arrays are allowed as F-expressions');
                    }
                }
                this.parseRow(fexpr, key, depMap);
            }
            this.initialState = updateOnInit;
            this.mrrDepMap = depMap;
            if (this.__mrr.readFromDOM) {
                for (var cn in this.mentionedCells) {
                    if (!this.__mrr.realComputed[cn] && !this.__mrr.readFromDOM[cn] && (!this.__mrr.toBeLinked || !this.__mrr.toBeLinked[cn]) && cn.indexOf('.') === -1 && systemCells.indexOf(cn) === -1) {
                        throw new Error('MRERR_110: Linking to undescribed cell: ' + cn);
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
        key: 'checkLinkedCellsTypes',
        value: function checkLinkedCellsTypes(a, b, linked_as) {
            var _this2 = this;

            if (!a) debugger;

            var _loop = function _loop(v) {
                var needed_cells = a.__mrr.linksNeeded[linked_as][v];
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    var _loop2 = function _loop2() {
                        var cell = _step10.value;

                        if (a.__mrr.dataTypes[cell] && b.__mrr.dataTypes[v] && isMatchingType(b.__mrr.dataTypes[v], a.__mrr.dataTypes[cell], _this2.dataTypes, {
                            not: function not() {
                                throw new Error('MRERR_111: Types mismatch! ' + a.__mrr.dataTypes[cell] + ' vs. ' + b.__mrr.dataTypes[v] + ' in ' + cell);
                            },
                            maybe: function maybe() {
                                console.warn('Not fully compliant types: expecting ' + a.__mrr.dataTypes[cell] + ', got ' + b.__mrr.dataTypes[v]);
                            }
                        })) {}
                    };

                    for (var _iterator10 = needed_cells[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        _loop2();
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }
            };

            for (var v in a.__mrr.linksNeeded[linked_as]) {
                _loop(v);
            }
        }
    }, {
        key: 'mrrConnect',
        value: function mrrConnect(as) {
            var _this3 = this;

            var upstream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var downstream = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var self = this;
            if (isUndef(as)) {
                as = '__rand_child_name_' + ++this.__mrr.childrenCounter;
            }
            return {
                subscribe: function subscribe(child) {
                    child.subscribed = true;
                    var upstreamObj = upstream;
                    if (upstreamObj instanceof Array) {
                        var r = {};
                        var _iteratorNormalCompletion11 = true;
                        var _didIteratorError11 = false;
                        var _iteratorError11 = undefined;

                        try {
                            for (var _iterator11 = upstreamObj[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                var _cell = _step11.value;

                                r[_cell] = _cell;
                            }
                        } catch (err) {
                            _didIteratorError11 = true;
                            _iteratorError11 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }
                            } finally {
                                if (_didIteratorError11) {
                                    throw _iteratorError11;
                                }
                            }
                        }

                        upstreamObj = r;
                    }
                    child.upstream = objFlipArr(upstreamObj);
                    if (_this3.__mrr.strict) {
                        for (var w in child.upstream) {
                            var deps = child.upstream[w];
                            var _iteratorNormalCompletion12 = true;
                            var _didIteratorError12 = false;
                            var _iteratorError12 = undefined;

                            try {
                                for (var _iterator12 = deps[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                    var dep = _step12.value;

                                    var type = _this3.__mrr.realComputed[dep];
                                    if (type !== _cell7.fromChildren && type !== _cell7.fromOthers) {
                                        console.error('MRERR_115: cannot link to undescribed cell in strict mode! Trying to link to ' + dep + ' from child');
                                    }
                                }
                            } catch (err) {
                                _didIteratorError12 = true;
                                _iteratorError12 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                        _iterator12.return();
                                    }
                                } finally {
                                    if (_didIteratorError12) {
                                        throw _iteratorError12;
                                    }
                                }
                            }
                        }
                    }

                    var downstreamObj = downstream;
                    if (downstreamObj instanceof Array) {
                        var _r = {};
                        var _iteratorNormalCompletion13 = true;
                        var _didIteratorError13 = false;
                        var _iteratorError13 = undefined;

                        try {
                            for (var _iterator13 = downstreamObj[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                var _cell2 = _step13.value;

                                _r[_cell2] = _cell2;
                            }
                        } catch (err) {
                            _didIteratorError13 = true;
                            _iteratorError13 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                    _iterator13.return();
                                }
                            } finally {
                                if (_didIteratorError13) {
                                    throw _iteratorError13;
                                }
                            }
                        }

                        downstreamObj = _r;
                    }
                    for (var k in downstreamObj) {
                        var parent_cell = downstreamObj[k];
                        if (!child.__mrr.linksNeeded['..']) {
                            child.__mrr.linksNeeded['..'] = {};
                        }
                        if (!child.__mrr.linksNeeded['..'][parent_cell]) {
                            child.__mrr.linksNeeded['..'][parent_cell] = [];
                        }
                        if (child.__mrr.linksNeeded['..'][parent_cell].indexOf(k) === -1) {
                            child.__mrr.linksNeeded['..'][parent_cell].push(k);
                            if (child.__mrr.strict) {
                                var ctype = child.__mrr.realComputed[k];
                                if (ctype !== _cell7.fromParent && ctype !== _cell7.fromOthers) {
                                    console.error('MRERR_116: cannot link to undescribed cell in strict mode! Trying to link to ' + k + ' from parent', child.__mrr.realComputed);
                                }
                            }
                        }
                    }

                    child.$name = as;
                    _this3.__mrr.children[as] = child;
                    child.__mrrParent = self;
                    child.__mrrLinkedAs = as;
                    for (var a in child.__mrr.linksNeeded['..']) {
                        var child_cells = child.__mrr.linksNeeded['..'][a];
                        var val = self.mrrState[a];
                        var _iteratorNormalCompletion14 = true;
                        var _didIteratorError14 = false;
                        var _iteratorError14 = undefined;

                        try {
                            for (var _iterator14 = child_cells[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                                var _cell3 = _step14.value;

                                child.mrrState[_cell3] = val;
                                child.initialState[_cell3] = val;
                                if (child.__mrr.immediatelyUpdatedLinks && child.__mrr.immediatelyUpdatedLinks[a]) {
                                    updateOtherGrid(child, '..', a, _this3.mrrState[a]);
                                    console.log('UOG', _cell3);
                                }
                            }
                        } catch (err) {
                            _didIteratorError14 = true;
                            _iteratorError14 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                    _iterator14.return();
                                }
                            } finally {
                                if (_didIteratorError14) {
                                    throw _iteratorError14;
                                }
                            }
                        }
                    }
                    _this3.checkLinkedCellsTypes(child, _this3, '..');
                    _this3.checkLinkedCellsTypes(_this3, child, as);
                    _this3.checkLinkedCellsTypes(_this3, child, '*');
                    if (_this3.__mrr.realComputed.$log && (_this3.__mrr.realComputed.$log === true || _this3.__mrr.realComputed.$log.showMount)) {
                        if (_this3.__mrr.realComputed.$log === 'no-colour') {
                            console.log('CONNECTED: ' + (_this3.$name || '') + '/' + as, child.__mrr.realComputed);
                        } else {
                            console.log('%c CONNECTED: ' + (_this3.$name || '') + '/' + as, log_styles_mount, child.__mrr.realComputed);
                        }
                    }
                }
            };
        }
    }, {
        key: 'toState',
        value: function toState(key, val, notHandleFunctions) {
            var _this4 = this;

            if (!key) {
                throw new Error('MRERR_112: please specify cell name to write in');
            }
            if (this.__mrr.readFromDOM && !this.__mrr.readFromDOM[key]) {
                throw new Error('MRERR_101: trying to create undescribed stream: ' + key, this.__mrr.readFromDOM);
            }
            if (this.__mrr.strict && !this.__mrr.readFromDOM) {
                var type = this.__mrr.realComputed[key];
                if (type !== _cell7.fromDOM) {
                    console.error('MRERR_118: cannot write to cell from DOM if it\'s not described as writeable from DOM in strict mode! Cell: ' + key);
                }
            }
            if (val === undefined && this.__mrr.thunks[key]) {
                //console.log('=== skip');
                return this.__mrr.thunks[key];
            } else {
                //console.log('=== generate');
                var func = function func(a) {
                    var value = void 0;
                    if (val !== undefined) {
                        if (val instanceof Function && !notHandleFunctions) {
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
        value: function __getCellArgs(cell, parent_cell, parent_stack, level) {
            var _this5 = this;

            var arg_cells = this.__mrr.realComputed[cell].slice(this.__mrr.realComputed[cell][0] instanceof Function ? 1 : 2).filter(function (a) {
                return a !== skip;
            });
            var found = {};
            var res = arg_cells.map(function (arg_cell) {
                if (arg_cell === '^') {
                    //console.log('looking for prev val of', cell, this.mrrState, this.state);
                    return _this5.mrrState[cell];
                } else {
                    if (arg_cell[0] === '-') {
                        arg_cell = arg_cell.slice(1);
                    }
                    if (arg_cell === '$name') {
                        return _this5.$name;
                    }
                    if (arg_cell === '$props') {
                        return _this5.reactWrapper ? _this5.reactWrapper.props : undefined;
                    }
                    if (arg_cell === '$async') {
                        found.$async = true;
                        return runGridMethodIfExists.bind(null, 'updateAsync', _this5.__mrr.id, cell, parent_cell, parent_stack);
                    }
                    if (arg_cell === '$nested') {
                        return runGridMethodIfExists.bind(null, 'updateNested', _this5.__mrr.id, cell, parent_cell, parent_stack, level);
                    }
                    if (arg_cell === '$changedCellName') {
                        return parent_cell;
                    }
                    if (arg_cell === '$changedCellName') {
                        return parent_cell;
                    }
                    if (arg_cell === '$state') {
                        return Object.assign({}, _this5.mrrState);
                    }
                    if (arg_cell === '^/$state') {
                        if (_this5.GG) {
                            return Object.assign({}, _this5.GG.mrrState);
                        } else {
                            return;
                        }
                    }
                    return _this5.mrrState[arg_cell] === undefined && _this5.state && _this5.__mrr.constructing ? _this5.initialState[arg_cell] : _this5.mrrState[arg_cell];
                }
            });
            return [res, found];
        }
    }, {
        key: '__mrrSetError',
        value: function __mrrSetError(cell, e) {
            if (this.mrrDepMap['$err.' + cell]) {
                this.setState(_defineProperty({}, '$err.' + cell, e));
            } else {
                if (this.mrrDepMap.$err) {
                    this.setState({ $err: e });
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: 'getGraph',
        value: function getGraph() {
            var c = 0;
            var cells = {};
            var edges = [];
            var setCell = function setCell(cell, gridId) {
                if (!cells[gridId]) {
                    cells[gridId] = {};
                }
                if (!cells[gridId][cell]) {
                    cells[gridId][cell] = ++c;
                    return c;
                } else {
                    return cells[gridId][cell];
                }
            };
            var nodes = [];
            var getId = function getId(gridId, cell) {
                return cells[gridId][cell];
            };
            var addLink = function addLink(fromCell, fromGrid, toCell, toGrid) {
                var from = setCell(fromCell, fromGrid);
                var to = setCell(toCell, toGrid);
                edges.push({
                    from: from,
                    to: to,
                    arrows: 'to'
                });
            };
            recur(this, ['__mrr', 'children'], function (child) {
                for (var cn in child.mrrDepMap) {
                    var _iteratorNormalCompletion15 = true;
                    var _didIteratorError15 = false;
                    var _iteratorError15 = undefined;

                    try {
                        for (var _iterator15 = child.mrrDepMap[cn][Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                            var _depC = _step15.value;

                            addLink(cn, child.__mrr.id, _depC, child.__mrr.id);
                        }
                    } catch (err) {
                        _didIteratorError15 = true;
                        _iteratorError15 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                _iterator15.return();
                            }
                        } finally {
                            if (_didIteratorError15) {
                                throw _iteratorError15;
                            }
                        }
                    }
                }
                for (var type in child.__mrr.linksNeeded) {
                    for (var masterCell in child.__mrr.linksNeeded[type]) {
                        var _iteratorNormalCompletion16 = true;
                        var _didIteratorError16 = false;
                        var _iteratorError16 = undefined;

                        try {
                            for (var _iterator16 = child.__mrr.linksNeeded[type][masterCell][Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                var childCell = _step16.value;

                                if (type === '*') {
                                    for (var ch in child.__mrr.children) {
                                        var childId = child.__mrr.children[ch].__mrr.id;
                                        addLink(masterCell, childId, depC, child.__mrr.id);
                                    }
                                }
                            }
                        } catch (err) {
                            _didIteratorError16 = true;
                            _iteratorError16 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                    _iterator16.return();
                                }
                            } finally {
                                if (_didIteratorError16) {
                                    throw _iteratorError16;
                                }
                            }
                        }
                    }
                }
            });
            for (var gridId in cells) {
                for (var cellname in cells[gridId]) {
                    nodes.push({
                        id: cells[gridId][cellname],
                        label: gridId + '/' + cellname
                    });
                }
            }
            return [nodes, edges];
        }
    }, {
        key: 'updateAsync',
        value: function updateAsync(cell, parent_cell, parent_stack, val) {
            if (val === skip) {
                return;
            }
            if (this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                currentChange = [];
                currentChangeCells = {};
            }
            if (this.__mrr.realComputed.$debug) {
                currentChangeCells = {};
            }
            this.__mrrSetState(cell, val, parent_cell, parent_stack, 0);
            var update = {};
            update[cell] = val;
            this.checkMrrCellUpdate(cell, update, parent_stack, val, 0);
            this.setOuterState(update, null, true, this.mrrState);
            if (this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                this.logChange();
            }
        }
    }, {
        key: 'updateNested',
        value: function (_updateNested) {
            function updateNested(_x, _x2, _x3, _x4, _x5, _x6) {
                return _updateNested.apply(this, arguments);
            }

            updateNested.toString = function () {
                return _updateNested.toString();
            };

            return updateNested;
        }(function (cell, parent_cell, parent_stack, level, subcell, val) {
            if (subcell instanceof Object) {
                for (var k in subcell) {
                    updateNested(k, subcell[k]);
                }
                return;
            }
            if (this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                currentChange = [];
            }
            if (this.__mrr.realComputed.$debug) {
                currentChangeCells = {};
            }
            var subcellname = cell + '.' + subcell;
            var stateSetter = this.setOuterState;
            this.__mrrSetState(subcellname, val, parent_cell, parent_stack, level);
            var update = {};
            update[subcellname] = val;
            this.checkMrrCellUpdate(subcellname, update, parent_stack, val, level);
            stateSetter.call(this, update, null, true, this.mrrState);
            var nested_update = _defineProperty({}, cell, this.mrrState[cell] instanceof Object ? this.mrrState[cell] : {});
            nested_update[cell][subcell] = val;
            stateSetter.call(this, nested_update, null, true, this.mrrState);
            if (this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                this.logChange();
            }
        })
    }, {
        key: '__mrrUpdateCell',
        value: function __mrrUpdateCell(cell, parent_cell, update, parent_stack, level) {
            var val,
                func,
                args,
                updateNested,
                updateFunc,
                types = [];

            var fexpr = this.__mrr.realComputed[cell];
            if (typeof fexpr[0] === 'string') {
                types = fexpr[0].split('.');
            }

            if (types.indexOf('nested') !== -1) {
                updateNested = runGridMethodIfExists.bind(null, 'updateNested', this.__mrr.id, cell, parent_cell, parent_stack, level);
            }
            var found = {};

            if (fexpr[0] instanceof Function) {
                func = this.__mrr.realComputed[cell][0];

                var _getCellArgs = this.__getCellArgs(cell, parent_cell, parent_stack, level);

                var _getCellArgs2 = _slicedToArray(_getCellArgs, 2);

                args = _getCellArgs2[0];
                found = _getCellArgs2[1];

                try {
                    val = func.apply(null, args);
                } catch (e) {
                    this.__mrrSetError(cell, e);
                    return;
                }
            } else {
                if (types.indexOf('funnel') !== -1) {
                    args = [parent_cell, this.mrrState[parent_cell], this.mrrState[cell]];
                } else {
                    var _getCellArgs3 = this.__getCellArgs(cell, parent_cell, parent_stack, level);

                    var _getCellArgs4 = _slicedToArray(_getCellArgs3, 2);

                    args = _getCellArgs4[0];
                    found = _getCellArgs4[1];
                }
                if (types.indexOf('nested') !== -1) {
                    args.unshift(updateNested);
                }
                if (types.indexOf('async') !== -1) {
                    updateFunc = updateFunc = runGridMethodIfExists.bind(null, 'updateAsync', this.__mrr.id, cell, parent_cell, parent_stack);
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
                    throw new Error('MRERR_103: closure type should provide function');
                }
                try {
                    val = func.apply(null, args);
                } catch (e) {
                    this.__mrrSetError(cell, e);
                    return;
                }
            }
            if (this.__mrr.dataTypes[cell] && val !== skip) {
                if (!this.dataTypes[this.__mrr.dataTypes[cell]]) {
                    throw new Error('MRERR_104: Undeclared type: ' + this.__mrr.dataTypes[cell] + " for cell " + cell);
                }
                if (!this.dataTypes[this.__mrr.dataTypes[cell]].check(val, this.dataTypes)) {
                    throw new Error('MRERR_105: Wrong data type for cell ' + cell + ': ' + val + ', expecting ' + this.__mrr.dataTypes[cell]);
                }
            }
            if (types && types.indexOf('nested') !== -1) {
                if (val instanceof Object) {
                    for (var k in val) {
                        updateNested(k, val[k]);
                    }
                }
                return;
            }
            if (types && types.indexOf('async') !== -1 || found.$async) {
                // do nothing!
                return;
            }
            var current_val = this.mrrState[cell];
            if (this.__mrr.valueCells[cell] && shallow_equal(current_val, val)) {
                //console.log('Duplicate', cell, val, this.__mrr.valueCells);
                return;
            }
            if (isPromise(val)) {
                if (!updateFunc) {
                    updateFunc = runGridMethodIfExists.bind(null, 'updateAsync', this.__mrr.id, cell, parent_cell, parent_stack);
                }
                val.then(updateFunc);
            } else {
                if (val === skip) {
                    return;
                }
                update[cell] = val;
                this.__mrrSetState(cell, val, parent_cell, parent_stack, level);
                this.checkMrrCellUpdate(cell, update, parent_stack, val, level);
            }
        }
    }, {
        key: 'checkMrrCellUpdate',
        value: function checkMrrCellUpdate(parent_cell, update) {
            var parent_stack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var val = arguments[3];
            var level = arguments[4];

            if (this.mrrDepMap[parent_cell]) {
                var _iteratorNormalCompletion17 = true;
                var _didIteratorError17 = false;
                var _iteratorError17 = undefined;

                try {
                    for (var _iterator17 = this.mrrDepMap[parent_cell][Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                        var _cell4 = _step17.value;

                        var next_parent_stack = this.__mrr.realComputed.$log ? [].concat(_toConsumableArray(parent_stack), [[parent_cell, val]]) : parent_stack;
                        this.__mrrUpdateCell(_cell4, parent_cell, update, next_parent_stack, level + 1);
                    }
                } catch (err) {
                    _didIteratorError17 = true;
                    _iteratorError17 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion17 && _iterator17.return) {
                            _iterator17.return();
                        }
                    } finally {
                        if (_didIteratorError17) {
                            throw _iteratorError17;
                        }
                    }
                }
            }
        }
    }, {
        key: '__mrrSetState',
        value: function __mrrSetState(key, val, parent_cell, parent_stack, level) {
            //@ todo: omit @@anon cells
            if (this.__mrr.realComputed.$debug) {
                if (currentChangeCells[key]) {
                    throw new Error('MRERR_105: Infinite loop for cell: ' + key + '; update path: ' + parent_stack.map(function (a) {
                        return a[0];
                    }).join(' > '));
                } else {
                    currentChangeCells[key] = true;
                }
            }

            if (this.__mrr.realComputed.$log && key[0] !== '@') {
                if (this.__mrr.realComputed.$log === true || this.__mrr.realComputed.$log instanceof Array && this.__mrr.realComputed.$log.indexOf(key) !== -1 || this.__mrr.realComputed.$log.cells && (this.__mrr.realComputed.$log.cells === true || this.__mrr.realComputed.$log.cells.indexOf(key) !== -1)) {
                    if (this.__mrr.realComputed.$log === 'no-colour') {
                        console.log(key, val);
                    } else {
                        var logArgs = ['%c ' + this.__mrrPath + '::' + key,
                        //+ '(' + parent_cell +') ',
                        log_styles_cell, val];
                        if (this.__mrr.realComputed.$log.showStack) {
                            logArgs.push(JSON.stringify(parent_stack));
                        }
                        if (this.__mrr.realComputed.$log.showTree) {
                            logArgs.push(level);
                            currentChange.push(logArgs);
                        } else {
                            console.log.apply(console, logArgs);
                        }
                    }
                }
            }
            this.mrrState[key] = val;

            if (this.isGG) {
                if (this.__mrr.subscribers) {
                    var _iteratorNormalCompletion18 = true;
                    var _didIteratorError18 = false;
                    var _iteratorError18 = undefined;

                    try {
                        for (var _iterator18 = this.__mrr.subscribers[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                            var sub = _step18.value;

                            if (sub && sub.__mrr.linksNeeded['^'][key]) {
                                updateOtherGrid(sub, '^', key, this.mrrState[key], level + 1);
                            }
                        }
                    } catch (err) {
                        _didIteratorError18 = true;
                        _iteratorError18 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                _iterator18.return();
                            }
                        } finally {
                            if (_didIteratorError18) {
                                throw _iteratorError18;
                            }
                        }
                    }
                }
            } else {
                for (var _as in this.__mrr.children) {
                    if (this.__mrr.children[_as].__mrr.linksNeeded['..'] && this.__mrr.children[_as].__mrr.linksNeeded['..'][key] && val === this.mrrState[key]) {
                        updateOtherGrid(this.__mrr.children[_as], '..', key, this.mrrState[key], level + 1);
                    }
                }
                var as = this.__mrrLinkedAs;
                if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded[as] && this.__mrrParent.__mrr.linksNeeded[as][key] && val === this.mrrState[key]) {
                    updateOtherGrid(this.__mrrParent, as, key, this.mrrState[key], level + 1);
                }
                if (this.__mrrParent && this.upstream && this.upstream[key] && val === this.mrrState[key]) {
                    var _iteratorNormalCompletion19 = true;
                    var _didIteratorError19 = false;
                    var _iteratorError19 = undefined;

                    try {
                        for (var _iterator19 = this.upstream[key][Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                            var parentCell = _step19.value;

                            this.__mrrParent.setState(_defineProperty({}, parentCell, val), level + 1);
                        }
                    } catch (err) {
                        _didIteratorError19 = true;
                        _iteratorError19 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion19 && _iterator19.return) {
                                _iterator19.return();
                            }
                        } finally {
                            if (_didIteratorError19) {
                                throw _iteratorError19;
                            }
                        }
                    }
                }
                if (this.__mrrParent && this.__mrrParent.__mrr.linksNeeded['*'] && this.__mrrParent.__mrr.linksNeeded['*'][key] && val === this.mrrState[key]) {
                    updateOtherGrid(this.__mrrParent, '*', key, this.mrrState[key], level + 1);
                }
                if (this.__mrr.expose && this.__mrr.expose[key] && this.GG && this.GG.__mrr.linksNeeded['*'] && this.GG.__mrr.linksNeeded['*'][this.__mrr.expose[key]] && val === this.mrrState[key]) {
                    updateOtherGrid(this.GG, '*', this.__mrr.expose[key], this.mrrState[key], level + 1);
                }
            }
        }
    }, {
        key: 'getUpdateQueue',
        value: function getUpdateQueue(cell) {}
    }, {
        key: 'setState',
        value: function setState(ns) {
            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (!(ns instanceof Object)) {
                ns = ns.call(null, this.state, this.props);
            }
            var update = Object.assign({}, ns);
            if (!level && this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                currentChange = [];
            }
            if (!level && this.__mrr.realComputed.$debug) {
                currentChangeCells = {};
            }
            for (var _cell5 in update) {
                this.__mrrSetState(_cell5, update[_cell5], null, [], level);
            }
            for (var parent_cell in update) {
                this.checkMrrCellUpdate(parent_cell, update, [], null, level);
            }
            if (!level && this.__mrr.realComputed.$log && this.__mrr.realComputed.$log.showTree) {
                this.logChange();
            }
            if (!this.__mrr.constructing) {
                var real_update = {};
                if (this.__mrr.writeToDOM) {
                    var once = false;
                    for (var key in update) {
                        if (this.__mrr.writeToDOM[key]) {
                            real_update[key] = update[key];
                            once = true;
                        }
                    }
                    if (!once) return;
                } else {
                    real_update = update;
                }
                return this.setOuterState(real_update, true, null, this.mrrState);
                //return (mrrParentClass.prototype.setState || (() => {})).call(this, real_update, cb, true);
            } else {
                for (var _cell6 in update) {
                    this.initialState[_cell6] = update[_cell6];
                }
            }
        }
    }, {
        key: '__mrrMacros',
        get: function get() {
            return Object.assign({}, this.macros, global_macros);
        }
    }, {
        key: '__mrrPath',
        get: function get() {
            return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : this.isGG ? 'GG' : 'root';
        }
    }, {
        key: 'innerState',
        get: function get() {
            return Object.assign({}, this.mrrState);
        }
    }]);

    return Mrr;
}();

var Grid = function Grid(struct) {
    this.struct = struct instanceof Array ? struct : [struct];
};
Grid.prototype.extend = function (child) {
    return new Grid([].concat(_toConsumableArray(this.struct), [child]));
};

Grid.prototype.get = function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var res = void 0;
    for (var i in this.struct) {
        var struct = this.struct[i] instanceof Function ? this.struct[i](props) : this.struct[i];
        if (i == 0) {
            res = struct;
        } else {
            res = _gridMacros2.default.merge(struct, res);
        }
    }
    return res;
};

exports.Grid = Grid;
exports.default = Mrr;