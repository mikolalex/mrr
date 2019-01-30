(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
window.mrr = require("./index");
},{"./index":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _2 = require('./');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isJustObject = function isJustObject(a) {
    return a instanceof Object && !(a instanceof Array) && !(a instanceof Function);
};
var always = function always(a) {
    return function (_) {
        return a;
    };
};
var isPromise = function isPromise(a) {
    return a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
};
var matches = function matches(obj, subset) {
    for (var k in subset) {
        if (!(0, _2.shallow_equal)(obj[k], subset[k])) {
            return false;
        }
    }
    return true;
};

var collMacros = function collMacros(_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        map = _ref2[0];

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
    return [function (_ref3, prev) {
        var _ref4 = _slicedToArray(_ref3, 2),
            type = _ref4[0],
            changes = _ref4[1];

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
};

var defMacros = {
    map: function map(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 1),
            _map = _ref6[0];

        var res = ['funnel', function (cell, val) {
            return _map[cell] instanceof Function ? _map[cell](val) : _map[cell];
        }];
        for (var cell in _map) {
            res.push(cell);
        }
        return res;
    },
    coll: collMacros,
    list: collMacros,
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
                cb('status', 'pendingzzzz');
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
            return a ? b : _2.skip;
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
            return a === val ? true : _2.skip;
        }, field];
    },
    skipSame: function skipSame(_ref33) {
        var _ref34 = _slicedToArray(_ref33, 1),
            field = _ref34[0];

        return [function (z, x) {
            return (0, _2.shallow_equal)(z, x) ? _2.skip : z;
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
            return !res ? true : _2.skip;
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
            return !!res ? true : _2.skip;
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
                    return _2.skip;
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
                    return _2.skip;
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

exports.default = defMacros;
},{"./":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createMrrApp = exports.withMrr = exports.isOfType = exports.shallow_equal = exports.registerMacros = exports.skip = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _defMacros = require('./defMacros');

var _defMacros2 = _interopRequireDefault(_defMacros);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// if polyfill used
var isPromise = function isPromise(a) {
    return a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
};

var cell_types = ['funnel', 'closure', 'nested', 'async'];
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

var swapObj = function swapObj(a) {
    var b = {};
    for (var k in a) {
        b[a[k]] = k;
    }
    return b;
};

var joinAsObject = function joinAsObject(target_struct, parent, child, key) {
    if (parent && child && parent[key] && child[key]) {
        target_struct[key] = Object.assign({}, parent[key], child[key]);
    }
};
var joinAsArray = function joinAsArray(target_struct, parent, child, key) {
    if (parent && child && parent[key] && child[key]) {
        target_struct[key] = [].concat(_toConsumableArray(parent[key]), _toConsumableArray(child[key]));
    }
};

var mrrJoin = function mrrJoin() {
    var child_struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent_struct = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var struct = Object.assign({}, parent_struct, child_struct);
    joinAsObject(struct, parent_struct, child_struct, '$init');
    joinAsArray(struct, parent_struct, child_struct, '$readFromDOM');
    joinAsArray(struct, parent_struct, child_struct, '$expose');
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

var isOfType = exports.isOfType = function isOfType(val, type, dataTypes) {
    return dataTypes[type] ? dataTypes[type](val) : false;
};

var defDataTypes = {
    'array': {
        check: function check(a) {
            return a instanceof Array;
        }
    },
    'object': {
        check: function check(a) {
            return a instanceof Object;
        }
    },
    'func': {
        check: function check(a) {
            return a instanceof Function;
        }
    },
    'int': {
        check: function check(a) {
            return typeof a === 'number';
        }
    },
    'string': {
        check: function check(a) {
            return typeof a === 'string';
        }
    },
    'pair': {
        check: function check(a) {
            return a instanceof Array && a.length === 2;
        },
        extends: ['array']
    },
    'coll_update': {
        check: function check(a, types) {
            return a instanceof Array && a.length === 2 && isOfType(a[0], 'object', types) && isOfType(a[1], 'object_or_int', types);
        }
    },
    'array_or_object': {
        check: function check(a) {
            return a instanceof Object;
        },
        extends: ['array', 'object']
    },
    'object_or_int': {
        check: function check(a) {
            return a instanceof Object || typeof a === 'number';
        },
        extends: ['int', 'object']
    }
};

var isMatchingType = function isMatchingType(master_type, slave_type, types, actions) {
    if (master_type === slave_type) {
        actions.matches ? actions.matches() : null;
        return;
    }
    if (!types[slave_type]) {
        debugger;
    }
    var _matches = false;
    if (types[master_type].extends) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = types[master_type].extends[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var parent_type = _step2.value;

                isMatchingType(parent_type, slave_type, types, {
                    matches: function matches() {
                        actions.matches();
                        _matches = true;
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
    if (_matches) return;
    var _maybe = false;
    if (types[slave_type].extends) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = types[slave_type].extends[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _parent_type = _step3.value;

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
    if (_maybe) return;
    actions.not ? actions.not() : null;
};

var type_delimiter = ': ';

var ids = 0;

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
};

var getWithMrr = function getWithMrr(GG, macros, dataTypes) {
    return function (mrrStructure) {
        var _render = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var parentClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var isGlobal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

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
                    var jsx = _render.call(this, this.state, this.props, this.toState.bind(this), function (as) {
                        return { mrrConnect: _this2.mrrConnect(as) };
                    }, function () {
                        self.__mrr.getRootHandlersCalled = true;
                        var props = {
                            id: '__mrr_root_node_n' + self.__mrr.id
                        };

                        var _loop = function _loop(event_type) {
                            props['on' + event_type] = function (e) {
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = self.__mrr.root_el_handlers[event_type][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var _step4$value = _slicedToArray(_step4.value, 3),
                                            selector = _step4$value[0],
                                            handler = _step4$value[1],
                                            cell = _step4$value[2];

                                        if (e.target.matches('#__mrr_root_node_n' + self.__mrr.id + ' ' + selector)) {
                                            var value = handler(e);
                                            self.setState(_defineProperty({}, cell, value), null, null, true);
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
                            };
                        };

                        for (var event_type in self.__mrr.root_el_handlers) {
                            _loop(event_type);
                        }
                        return props;
                    });
                    if (this.__mrr.usesEventDelegation && !this.__mrr.getRootHandlersCalled) {
                        console.warn('Looks like you forget to call getRootHandlers when using event delegation');
                    }
                    return jsx;
                }
            }]);

            return MyMrrComponent;
        }(parent);
        var cls = function (_mrrParentClass) {
            _inherits(Mrr, _mrrParentClass);

            function Mrr(props, context, already_inited, isGG) {
                _classCallCheck(this, Mrr);

                var _this3 = _possibleConstructorReturn(this, (Mrr.__proto__ || Object.getPrototypeOf(Mrr)).call(this, props, context, true));

                if (already_inited) {
                    //return;
                }
                if (isGG) {
                    _this3.isGG = true;
                }
                _this3.props = props || {};
                _this3.__mrr = {
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
                    if (key.indexOf(type_delimiter) !== -1) {
                        var type = void 0;

                        var _key$split = key.split(type_delimiter);

                        var _key$split2 = _slicedToArray(_key$split, 2);

                        key = _key$split2[0];
                        type = _key$split2[1];

                        _this3.setCellDataType(key, type);
                    }
                    return [val, key];
                }));
                _this3.parseMrr();
                if (GG) {
                    if (_this3.__mrr.linksNeeded['^']) {
                        GG.__mrr.subscribers.push(_this3);
                        _this3.checkLinkedCellsTypes(_this3, GG, '^');
                        for (var a in _this3.__mrr.linksNeeded['^']) {
                            var child_cells = _this3.__mrr.linksNeeded['^'][a];
                            var val = GG.mrrState[a];
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = child_cells[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var cell = _step5.value;

                                    _this3.mrrState[cell] = val;
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
                    _this3.checkLinkedCellsTypes(GG, _this3, '*');
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
                        $start: true
                    });
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
                key: 'setCellDataType',
                value: function setCellDataType(cell, type) {
                    if (!dataTypes[type]) {
                        throw new Error('Undeclared type: ' + type);
                    }
                    cell = cell[0] === '-' ? cell.slice(1) : cell;
                    if (!this.__mrr.dataTypes[cell]) {
                        this.__mrr.dataTypes[cell] = type;
                    } else {
                        if (this.__mrr.dataTypes[cell] !== type) {
                            throw new Error("Different type annotation for the same cell found: " + this.__mrr.dataTypes[cell] + ', ' + type + ' for cell "' + cell + '"');
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
                key: 'parseMrr',
                value: function parseMrr() {
                    var depMap = {};
                    this.mentionedCells = {};
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
                    if (this.__mrr.readFromDOM) {
                        for (var cn in this.mentionedCells) {
                            if (!this.__mrr.realComputed[cn] && !this.__mrr.readFromDOM[cn] && cn.indexOf('.') === -1 && cn !== '$start' && cn !== '$end') {
                                throw new Error('Linking to undescribed cell: ' + cn);
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
                    this.setState(_defineProperty({}, key, val), null, null, true);
                }
            }, {
                key: 'checkLinkedCellsTypes',
                value: function checkLinkedCellsTypes(a, b, linked_as) {
                    var _loop2 = function _loop2(v) {
                        var needed_cells = a.__mrr.linksNeeded[linked_as][v];
                        var _iteratorNormalCompletion7 = true;
                        var _didIteratorError7 = false;
                        var _iteratorError7 = undefined;

                        try {
                            var _loop3 = function _loop3() {
                                var cell = _step7.value;

                                if (a.__mrr.dataTypes[cell] && b.__mrr.dataTypes[v] && isMatchingType(b.__mrr.dataTypes[v], a.__mrr.dataTypes[cell], dataTypes, {
                                    not: function not() {
                                        throw new Error('Types mismatch! ' + a.__mrr.dataTypes[cell] + ' vs. ' + b.__mrr.dataTypes[v] + ' in ' + cell);
                                    },
                                    maybe: function maybe() {
                                        console.warn('Not fully compliant types: expecting ' + a.__mrr.dataTypes[cell] + ', got ' + b.__mrr.dataTypes[v]);
                                    }
                                })) {}
                            };

                            for (var _iterator7 = needed_cells[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                _loop3();
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
                    };

                    for (var v in a.__mrr.linksNeeded[linked_as]) {
                        _loop2(v);
                    }
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
                                var _iteratorNormalCompletion8 = true;
                                var _didIteratorError8 = false;
                                var _iteratorError8 = undefined;

                                try {
                                    for (var _iterator8 = child_cells[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                        var _cell = _step8.value;

                                        child.mrrState[_cell] = val;
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
                            }
                            _this4.checkLinkedCellsTypes(child, _this4, '..');
                            _this4.checkLinkedCellsTypes(_this4, child, as);
                            _this4.checkLinkedCellsTypes(_this4, child, '*');
                            if (_this4.__mrr.realComputed.$log && (_this4.__mrr.realComputed.$log === true || _this4.__mrr.realComputed.$log.showMount)) {
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

                    if (this.__mrr.readFromDOM && !this.__mrr.readFromDOM[key]) {
                        throw new Error('MRERR_101: trying to create undescribed stream: ' + key, this.__mrr.readFromDOM);
                    }
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
                            if (arg_cell === '$props') {
                                return _this6.props;
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
                    if (this.__mrr.dataTypes[cell] && val !== skip) {
                        if (!dataTypes[this.__mrr.dataTypes[cell]]) {
                            throw new Error('Undeclared type: ' + this.__mrr.dataTypes[cell] + " for cell " + cell);
                        }
                        if (!dataTypes[this.__mrr.dataTypes[cell]].check(val, dataTypes)) {
                            throw new Error('Wrong data type for cell ' + cell + ': ' + val + ', expecting ' + this.__mrr.dataTypes[cell]);
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
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = this.mrrDepMap[parent_cell][Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var _cell2 = _step9.value;

                                var next_parent_stack = this.__mrr.realComputed.$log ? [].concat(_toConsumableArray(parent_stack), [[parent_cell, val]]) : parent_stack;
                                this.__mrrUpdateCell(_cell2, parent_cell, update, next_parent_stack);
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
                    }
                }
            }, {
                key: '__mrrSetState',
                value: function __mrrSetState(key, val, parent_cell, parent_stack) {
                    //@ todo: omit @@anon cells
                    if (this.__mrr.realComputed.$log && key[0] !== '@') {
                        if (this.__mrr.realComputed.$log === true || this.__mrr.realComputed.$log instanceof Array && this.__mrr.realComputed.$log.indexOf(key) !== -1 || this.__mrr.realComputed.$log.cells && this.__mrr.realComputed.$log.cells.indexOf(key) !== -1) {
                            if (this.__mrr.realComputed.$log === 'no-colour') {
                                console.log(key, val);
                            } else {
                                var logArgs = ['%c ' + this.__mrrPath + '::' + key,
                                //+ '(' + parent_cell +') ',
                                log_styles_cell, val];
                                if (this.__mrr.realComputed.$log.showStack) {
                                    logArgs.push(JSON.stringify(parent_stack));
                                }
                                console.log.apply(console, logArgs);
                            }
                        }
                    }
                    this.mrrState[key] = val;

                    if (isGlobal) {
                        if (this.__mrr.subscribers) {
                            var _iteratorNormalCompletion10 = true;
                            var _didIteratorError10 = false;
                            var _iteratorError10 = undefined;

                            try {
                                for (var _iterator10 = this.__mrr.subscribers[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                    var sub = _step10.value;

                                    if (sub && sub.__mrr.linksNeeded['^'][key]) {
                                        updateOtherGrid(sub, '^', key, this.mrrState[key]);
                                    }
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
                        for (var _cell3 in update) {
                            this.__mrrSetState(_cell3, update[_cell3], null, []);
                        }
                        for (var parent_cell in update) {
                            this.checkMrrCellUpdate(parent_cell, update);
                        }
                    }
                    if (!this.__mrr.constructing) {
                        return (mrrParentClass.prototype.setState || function () {}).call(this, update, cb, true);
                    } else {
                        for (var _cell4 in update) {
                            this.initialState[_cell4] = update[_cell4];
                        }
                    }
                }
            }, {
                key: '__mrrMacros',
                get: function get() {
                    return Object.assign({}, macros, global_macros);
                }
            }, {
                key: '__mrrPath',
                get: function get() {
                    return this.__mrrParent ? this.__mrrParent.__mrrPath + '/' + this.$name : this.isGG ? 'GG' : 'root';
                }
            }]);

            return Mrr;
        }(mrrParentClass);
        return cls;
    };
};

var withMrr = exports.withMrr = getWithMrr(null, _defMacros2.default, defDataTypes);

var def = withMrr({}, null, _react2.default.Component);
def.skip = skip;

var initGlobalGrid = function initGlobalGrid(struct, availableMacros, availableDataTypes) {
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

    var GwithMrr = getWithMrr(null, availableMacros, availableDataTypes);
    var GlobalGridClass = GwithMrr(null, null, GlobalGrid, true);
    var GG = new GlobalGridClass(null, null, null, true);
    GG.__mrr.subscribers = [];
    return GG;
};

var createMrrApp = exports.createMrrApp = function createMrrApp(conf) {
    var availableMacros = Object.assign({}, _defMacros2.default, conf.macros || {});
    var availableDataTypes = Object.assign({}, defDataTypes, conf.dataTypes || {});
    var GG = conf.globalGrid ? initGlobalGrid(conf.globalGrid, availableMacros, availableDataTypes) : null;
    var withMrr = getWithMrr(GG, availableMacros, availableDataTypes);
    return {
        withMrr: withMrr,
        skip: skip,
        GG: GG
    };
};

exports.default = def;
},{"./defMacros":3,"react":14}],5:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],6:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
}).call(this,require('_process'))
},{"_process":1}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":1}],8:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":5,"_process":1}],9:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],10:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":11,"_process":1,"fbjs/lib/invariant":7,"fbjs/lib/warning":8}],11:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],12:[function(require,module,exports){
(function (process){
/** @license React v16.3.0
 * react.development.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';



if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var _assign = require('object-assign');
var emptyObject = require('fbjs/lib/emptyObject');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');
var emptyFunction = require('fbjs/lib/emptyFunction');
var checkPropTypes = require('prop-types/checkPropTypes');

// TODO: this is special because it gets imported during build.

var ReactVersion = '16.3.0';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol['for'];

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 0xeac7;
var REACT_CALL_TYPE = hasSymbol ? Symbol['for']('react.call') : 0xeac8;
var REACT_RETURN_TYPE = hasSymbol ? Symbol['for']('react.return') : 0xeac9;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol['for']('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol['for']('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol['for']('react.strict_mode') : 0xeacc;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol['for']('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol['for']('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol['for']('react.async_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol['for']('react.forward_ref') : 0xead0;

var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable === 'undefined') {
    return null;
  }
  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}

/**
 * WARNING: DO NOT manually require this module.
 * This is a replacement for `invariant(...)` used by the error code system
 * and will _only_ be required by the corresponding babel pass.
 * It always throws.
 */

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var lowPriorityWarning = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.warn(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarning = function (condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }
    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

var lowPriorityWarning$1 = lowPriorityWarning;

var didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor;
    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
    var warningKey = componentName + '.' + callerName;
    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }
    warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, componentName);
    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
  }
}

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {
  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
    warnNoop(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
    warnNoop(publicInstance, 'setState');
  }
};

/**
 * Base class helpers for the updating state of a component.
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
Component.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
{
  var deprecatedAPIs = {
    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
  };
  var defineDeprecationWarning = function (methodName, info) {
    Object.defineProperty(Component.prototype, methodName, {
      get: function () {
        lowPriorityWarning$1(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
        return undefined;
      }
    });
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
_assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

// an immutable object with a single mutable value
function createRef() {
  var refObject = {
    current: null
  };
  {
    Object.seal(refObject);
  }
  return refObject;
}

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
var ReactCurrentOwner = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

var specialPropKeyWarningShown = void 0;
var specialPropRefWarningShown = void 0;

function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  var warnAboutAccessingKey = function () {
    if (!specialPropKeyWarningShown) {
      specialPropKeyWarningShown = true;
      warning(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, 'key', {
    get: warnAboutAccessingKey,
    configurable: true
  });
}

function defineRefPropWarningGetter(props, displayName) {
  var warnAboutAccessingRef = function () {
    if (!specialPropRefWarningShown) {
      specialPropRefWarningShown = true;
      warning(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true
  });
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, no instanceof check
 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
function createElement(type, config, children) {
  var propName = void 0;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  {
    if (key || ref) {
      if (typeof props.$$typeof === 'undefined' || props.$$typeof !== REACT_ELEMENT_TYPE) {
        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
  }
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}

/**
 * Return a function that produces ReactElements of a given type.
 * See https://reactjs.org/docs/react-api.html#createfactory
 */


function cloneAndReplaceKey(oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

  return newElement;
}

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */
function cloneElement(element, config, children) {
  var propName = void 0;

  // Original props are copied
  var props = _assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties override existing props
    var defaultProps = void 0;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
}

/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

var ReactDebugCurrentFrame = {};

{
  // Component that is being worked on
  ReactDebugCurrentFrame.getCurrentStack = null;

  ReactDebugCurrentFrame.getStackAddendum = function () {
    var impl = ReactDebugCurrentFrame.getCurrentStack;
    if (impl) {
      return impl();
    }
    return null;
  };
}

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */
function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = ('' + key).replace(escapeRegex, function (match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var didWarnAboutMaps = false;

var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
}

var POOL_SIZE = 10;
var traverseContextPool = [];
function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
  if (traverseContextPool.length) {
    var traverseContext = traverseContextPool.pop();
    traverseContext.result = mapResult;
    traverseContext.keyPrefix = keyPrefix;
    traverseContext.func = mapFunction;
    traverseContext.context = mapContext;
    traverseContext.count = 0;
    return traverseContext;
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0
    };
  }
}

function releaseTraverseContext(traverseContext) {
  traverseContext.result = null;
  traverseContext.keyPrefix = null;
  traverseContext.func = null;
  traverseContext.context = null;
  traverseContext.count = 0;
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext);
  }
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  var invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }
    }
  }

  if (invokeCallback) {
    callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child = void 0;
  var nextName = void 0;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      {
        // Warn about using Maps as children
        if (iteratorFn === children.entries) {
          warning(didWarnAboutMaps, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.%s', ReactDebugCurrentFrame.getStackAddendum());
          didWarnAboutMaps = true;
        }
      }

      var iterator = iteratorFn.call(children);
      var step = void 0;
      var ii = 0;
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getComponentKey(child, ii++);
        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
      }
    } else if (type === 'object') {
      var addendum = '';
      {
        addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + ReactDebugCurrentFrame.getStackAddendum();
      }
      var childrenString = '' + children;
      invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum);
    }
  }

  return subtreeCount;
}

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (typeof component === 'object' && component !== null && component.key != null) {
    // Explicit key
    return escape(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

function forEachSingleChild(bookKeeping, child, name) {
  var func = bookKeeping.func,
      context = bookKeeping.context;

  func.call(context, child, bookKeeping.count++);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.foreach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }
  var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  releaseTraverseContext(traverseContext);
}

function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var result = bookKeeping.result,
      keyPrefix = bookKeeping.keyPrefix,
      func = bookKeeping.func,
      context = bookKeeping.context;


  var mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(mappedChild,
      // Keep both the (mapped) and old keys if they differ, just as
      // traverseAllChildren used to do for objects as children
      keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
    }
    result.push(mappedChild);
  }
}

function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  var traverseContext = getPooledTraverseContext(array, escapedPrefix, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  releaseTraverseContext(traverseContext);
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.map
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.count
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, emptyFunction.thatReturnsNull, null);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.toarray
 */
function toArray(children) {
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
  return result;
}

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.only
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild(children) {
  !isValidElement(children) ? invariant(false, 'React.Children.only expected to receive a single React element child.') : void 0;
  return children;
}

function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  } else {
    {
      warning(calculateChangedBits === null || typeof calculateChangedBits === 'function', 'createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits);
    }
  }

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _defaultValue: defaultValue,
    _currentValue: defaultValue,
    _changedBits: 0,
    // These are circular
    Provider: null,
    Consumer: null
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    context: context
  };
  context.Consumer = context;

  {
    context._currentRenderer = null;
  }

  return context;
}

function forwardRef(render) {
  {
    warning(typeof render === 'function', 'forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
  }

  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
}

var describeComponentFrame = function (name, source, ownerName) {
  return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
};

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' ||
  // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_ASYNC_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
}

function getComponentName(fiber) {
  var type = fiber.type;

  if (typeof type === 'function') {
    return type.displayName || type.name;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'ReactFragment';
    case REACT_PORTAL_TYPE:
      return 'ReactPortal';
    case REACT_CALL_TYPE:
      return 'ReactCall';
    case REACT_RETURN_TYPE:
      return 'ReactReturn';
  }
  return null;
}

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

var currentlyValidatingElement = void 0;
var propTypesMisspellWarningShown = void 0;

var getDisplayName = function () {};
var getStackAddendum = function () {};

var VALID_FRAGMENT_PROPS = void 0;

{
  currentlyValidatingElement = null;

  propTypesMisspellWarningShown = false;

  getDisplayName = function (element) {
    if (element == null) {
      return '#empty';
    } else if (typeof element === 'string' || typeof element === 'number') {
      return '#text';
    } else if (typeof element.type === 'string') {
      return element.type;
    } else if (element.type === REACT_FRAGMENT_TYPE) {
      return 'React.Fragment';
    } else {
      return element.type.displayName || element.type.name || 'Unknown';
    }
  };

  getStackAddendum = function () {
    var stack = '';
    if (currentlyValidatingElement) {
      var name = getDisplayName(currentlyValidatingElement);
      var owner = currentlyValidatingElement._owner;
      stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner));
    }
    stack += ReactDebugCurrentFrame.getStackAddendum() || '';
    return stack;
  };

  VALID_FRAGMENT_PROPS = new Map([['children', true], ['key', true]]);
}

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = getComponentName(ReactCurrentOwner.current);
    if (name) {
      return '\n\nCheck the render method of `' + name + '`.';
    }
  }
  return '';
}

function getSourceInfoErrorAddendum(elementProps) {
  if (elementProps !== null && elementProps !== undefined && elementProps.__source !== undefined) {
    var source = elementProps.__source;
    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
    var lineNumber = source.lineNumber;
    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
  }
  return '';
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  var info = getDeclarationErrorAddendum();

  if (!info) {
    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
    if (parentName) {
      info = '\n\nCheck the top-level render call using <' + parentName + '>.';
    }
  }
  return info;
}

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (!element._store || element._store.validated || element.key != null) {
    return;
  }
  element._store.validated = true;

  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
  if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
    return;
  }
  ownerHasKeyUseWarning[currentComponentErrorInfo] = true;

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwner = '';
  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
    childOwner = ' It was passed a child from ' + getComponentName(element._owner) + '.';
  }

  currentlyValidatingElement = element;
  {
    warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.%s', currentComponentErrorInfo, childOwner, getStackAddendum());
  }
  currentlyValidatingElement = null;
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (isValidElement(node)) {
    // This element was passed in a valid location.
    if (node._store) {
      node._store.validated = true;
    }
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    if (typeof iteratorFn === 'function') {
      // Entry iterators used to provide implicit keys,
      // but now we print a separate warning for them later.
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step = void 0;
        while (!(step = iterator.next()).done) {
          if (isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  var componentClass = element.type;
  if (typeof componentClass !== 'function') {
    return;
  }
  var name = componentClass.displayName || componentClass.name;
  var propTypes = componentClass.propTypes;
  if (propTypes) {
    currentlyValidatingElement = element;
    checkPropTypes(propTypes, element.props, 'prop', name, getStackAddendum);
    currentlyValidatingElement = null;
  } else if (componentClass.PropTypes !== undefined && !propTypesMisspellWarningShown) {
    propTypesMisspellWarningShown = true;
    warning(false, 'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
  }
  if (typeof componentClass.getDefaultProps === 'function') {
    warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
  }
}

/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */
function validateFragmentProps(fragment) {
  currentlyValidatingElement = fragment;

  var keys = Object.keys(fragment.props);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!VALID_FRAGMENT_PROPS.has(key)) {
      warning(false, 'Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.%s', key, getStackAddendum());
      break;
    }
  }

  if (fragment.ref !== null) {
    warning(false, 'Invalid attribute `ref` supplied to `React.Fragment`.%s', getStackAddendum());
  }

  currentlyValidatingElement = null;
}

function createElementWithValidation(type, props, children) {
  var validType = isValidElementType(type);

  // We warn in this case but don't throw. We expect the element creation to
  // succeed and there will likely be errors in render.
  if (!validType) {
    var info = '';
    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
    }

    var sourceInfo = getSourceInfoErrorAddendum(props);
    if (sourceInfo) {
      info += sourceInfo;
    } else {
      info += getDeclarationErrorAddendum();
    }

    info += getStackAddendum() || '';

    var typeString = void 0;
    if (type === null) {
      typeString = 'null';
    } else if (Array.isArray(type)) {
      typeString = 'array';
    } else {
      typeString = typeof type;
    }

    warning(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
  }

  var element = createElement.apply(this, arguments);

  // The result can be nullish if a mock or a custom function is used.
  // TODO: Drop this when these are no longer allowed as the type argument.
  if (element == null) {
    return element;
  }

  // Skip key warning if the type isn't valid since our key validation logic
  // doesn't expect a non-string/function type and can throw confusing errors.
  // We don't want exception behavior to differ between dev and prod.
  // (Rendering will throw with a helpful message and as soon as the type is
  // fixed, the key warnings will appear.)
  if (validType) {
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], type);
    }
  }

  if (type === REACT_FRAGMENT_TYPE) {
    validateFragmentProps(element);
  } else {
    validatePropTypes(element);
  }

  return element;
}

function createFactoryWithValidation(type) {
  var validatedFactory = createElementWithValidation.bind(null, type);
  validatedFactory.type = type;
  // Legacy hook: remove it
  {
    Object.defineProperty(validatedFactory, 'type', {
      enumerable: false,
      get: function () {
        lowPriorityWarning$1(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');
        Object.defineProperty(this, 'type', {
          value: type
        });
        return type;
      }
    });
  }

  return validatedFactory;
}

function cloneElementWithValidation(element, props, children) {
  var newElement = cloneElement.apply(this, arguments);
  for (var i = 2; i < arguments.length; i++) {
    validateChildKeys(arguments[i], newElement.type);
  }
  validatePropTypes(newElement);
  return newElement;
}

var React = {
  Children: {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray: toArray,
    only: onlyChild
  },

  createRef: createRef,
  Component: Component,
  PureComponent: PureComponent,

  createContext: createContext,
  forwardRef: forwardRef,

  Fragment: REACT_FRAGMENT_TYPE,
  StrictMode: REACT_STRICT_MODE_TYPE,
  unstable_AsyncMode: REACT_ASYNC_MODE_TYPE,

  createElement: createElementWithValidation,
  cloneElement: cloneElementWithValidation,
  createFactory: createFactoryWithValidation,
  isValidElement: isValidElement,

  version: ReactVersion,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: ReactCurrentOwner,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: _assign
  }
};

{
  _assign(React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, {
    // These should not be included in production.
    ReactDebugCurrentFrame: ReactDebugCurrentFrame,
    // Shim for React DOM 16.0.0 which still destructured (but not used) this.
    // TODO: remove in React 17.0.
    ReactComponentTreeHook: {}
  });
}



var React$2 = Object.freeze({
	default: React
});

var React$3 = ( React$2 && React ) || React$2;

// TODO: decide on the top-level export form.
// This is hacky but makes it work with both Rollup and Jest.
var react = React$3['default'] ? React$3['default'] : React$3;

module.exports = react;
  })();
}

}).call(this,require('_process'))
},{"_process":1,"fbjs/lib/emptyFunction":5,"fbjs/lib/emptyObject":6,"fbjs/lib/invariant":7,"fbjs/lib/warning":8,"object-assign":9,"prop-types/checkPropTypes":10}],13:[function(require,module,exports){
/** @license React v16.3.0
 * react.production.min.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';var m=require("object-assign"),n=require("fbjs/lib/emptyObject"),p=require("fbjs/lib/emptyFunction"),q="function"===typeof Symbol&&Symbol["for"],r=q?Symbol["for"]("react.element"):60103,t=q?Symbol["for"]("react.portal"):60106,u=q?Symbol["for"]("react.fragment"):60107,v=q?Symbol["for"]("react.strict_mode"):60108,w=q?Symbol["for"]("react.provider"):60109,x=q?Symbol["for"]("react.context"):60110,y=q?Symbol["for"]("react.async_mode"):60111,z=q?Symbol["for"]("react.forward_ref"):60112,A="function"===
typeof Symbol&&Symbol.iterator;function B(a){for(var b=arguments.length-1,e="Minified React error #"+a+"; visit http://facebook.github.io/react/docs/error-decoder.html?invariant\x3d"+a,c=0;c<b;c++)e+="\x26args[]\x3d"+encodeURIComponent(arguments[c+1]);b=Error(e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings.");b.name="Invariant Violation";b.framesToPop=1;throw b;}
var C={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}};function D(a,b,e){this.props=a;this.context=b;this.refs=n;this.updater=e||C}D.prototype.isReactComponent={};D.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?B("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState")};D.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};function E(){}
E.prototype=D.prototype;function F(a,b,e){this.props=a;this.context=b;this.refs=n;this.updater=e||C}var G=F.prototype=new E;G.constructor=F;m(G,D.prototype);G.isPureReactComponent=!0;var H={current:null},I=Object.prototype.hasOwnProperty,J={key:!0,ref:!0,__self:!0,__source:!0};
function K(a,b,e){var c=void 0,d={},g=null,h=null;if(null!=b)for(c in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(g=""+b.key),b)I.call(b,c)&&!J.hasOwnProperty(c)&&(d[c]=b[c]);var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){for(var k=Array(f),l=0;l<f;l++)k[l]=arguments[l+2];d.children=k}if(a&&a.defaultProps)for(c in f=a.defaultProps,f)void 0===d[c]&&(d[c]=f[c]);return{$$typeof:r,type:a,key:g,ref:h,props:d,_owner:H.current}}
function L(a){return"object"===typeof a&&null!==a&&a.$$typeof===r}function escape(a){var b={"\x3d":"\x3d0",":":"\x3d2"};return"$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}var M=/\/+/g,N=[];function O(a,b,e,c){if(N.length){var d=N.pop();d.result=a;d.keyPrefix=b;d.func=e;d.context=c;d.count=0;return d}return{result:a,keyPrefix:b,func:e,context:c,count:0}}function P(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>N.length&&N.push(a)}
function Q(a,b,e,c){var d=typeof a;if("undefined"===d||"boolean"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case "string":case "number":g=!0;break;case "object":switch(a.$$typeof){case r:case t:g=!0}}if(g)return e(c,a,""===b?"."+R(a,0):b),1;g=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){d=a[h];var f=b+R(d,h);g+=Q(d,f,e,c)}else if(null===a||"undefined"===typeof a?f=null:(f=A&&a[A]||a["@@iterator"],f="function"===typeof f?f:null),"function"===typeof f)for(a=f.call(a),
h=0;!(d=a.next()).done;)d=d.value,f=b+R(d,h++),g+=Q(d,f,e,c);else"object"===d&&(e=""+a,B("31","[object Object]"===e?"object with keys {"+Object.keys(a).join(", ")+"}":e,""));return g}function R(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function S(a,b){a.func.call(a.context,b,a.count++)}
function T(a,b,e){var c=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?U(a,c,e,p.thatReturnsArgument):null!=a&&(L(a)&&(b=d+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(M,"$\x26/")+"/")+e,a={$$typeof:r,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}),c.push(a))}function U(a,b,e,c,d){var g="";null!=e&&(g=(""+e).replace(M,"$\x26/")+"/");b=O(b,g,c,d);null==a||Q(a,"",T,b);P(b)}
var V={Children:{map:function(a,b,e){if(null==a)return a;var c=[];U(a,c,null,b,e);return c},forEach:function(a,b,e){if(null==a)return a;b=O(null,null,b,e);null==a||Q(a,"",S,b);P(b)},count:function(a){return null==a?0:Q(a,"",p.thatReturnsNull,null)},toArray:function(a){var b=[];U(a,b,null,p.thatReturnsArgument);return b},only:function(a){L(a)?void 0:B("143");return a}},createRef:function(){return{current:null}},Component:D,PureComponent:F,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:x,
_calculateChangedBits:b,_defaultValue:a,_currentValue:a,_changedBits:0,Provider:null,Consumer:null};a.Provider={$$typeof:w,context:a};return a.Consumer=a},forwardRef:function(a){return{$$typeof:z,render:a}},Fragment:u,StrictMode:v,unstable_AsyncMode:y,createElement:K,cloneElement:function(a,b,e){var c=void 0,d=m({},a.props),g=a.key,h=a.ref,f=a._owner;if(null!=b){void 0!==b.ref&&(h=b.ref,f=H.current);void 0!==b.key&&(g=""+b.key);var k=void 0;a.type&&a.type.defaultProps&&(k=a.type.defaultProps);for(c in b)I.call(b,
c)&&!J.hasOwnProperty(c)&&(d[c]=void 0===b[c]&&void 0!==k?k[c]:b[c])}c=arguments.length-2;if(1===c)d.children=e;else if(1<c){k=Array(c);for(var l=0;l<c;l++)k[l]=arguments[l+2];d.children=k}return{$$typeof:r,type:a.type,key:g,ref:h,props:d,_owner:f}},createFactory:function(a){var b=K.bind(null,a);b.type=a;return b},isValidElement:L,version:"16.3.0",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:H,assign:m}},W=Object.freeze({default:V}),X=W&&V||W;
module.exports=X["default"]?X["default"]:X;

},{"fbjs/lib/emptyFunction":5,"fbjs/lib/emptyObject":6,"object-assign":9}],14:[function(require,module,exports){
(function (process){
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}

}).call(this,require('_process'))
},{"./cjs/react.development.js":12,"./cjs/react.production.min.js":13,"_process":1}]},{},[2]);
