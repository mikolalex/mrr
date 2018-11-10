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
    remember: function remember(_ref43) {
        var _ref44 = _slicedToArray(_ref43, 3),
            cell = _ref44[0],
            time = _ref44[1],
            defVal = _ref44[2];

        return ['async.closure', function () {
            var timer = void 0;
            return function (cb, val) {
                clearTimeout(timer);
                cb(val);
                timer = setTimeout(function () {
                    cb(defVal);
                }, time);
            };
        }, cell];
    },
    accum: function accum(_ref45) {
        var _ref46 = _slicedToArray(_ref45, 2),
            cell = _ref46[0],
            time = _ref46[1];

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