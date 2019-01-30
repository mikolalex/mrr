'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.accum = exports.remember = exports.skipN = exports.turnsFromTo = exports.when = exports.skipIf = exports.skipSame = exports.trigger = exports.or = exports.and = exports.join = exports.mapPrev = exports.closureMap = exports.closureMerge = exports.transist = exports.split = exports.promise = exports.debounce = exports.toggle = exports.merge = exports.passOnceIf = exports.list = exports.coll = exports.deltas = exports.arrToDeltas = exports.deltasToArr = exports.map = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _mrr = require('./mrr');

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
        if (!(0, _mrr.shallow_equal)(obj[k], subset[k])) {
            return false;
        }
    }
    return true;
};

var applyDelta = function applyDelta(delta, prev) {
    var _delta = _slicedToArray(delta, 2),
        type = _delta[0],
        changes = _delta[1];

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

        return applyDelta([type, changes], prev);
    }, res, '^'];
};

var deltasMacros = function deltasMacros(_ref5) {
    var _ref6 = _slicedToArray(_ref5, 1),
        map = _ref6[0];

    var res = ['funnel', function (cell, val) {
        return val;
    }];

    var _loop2 = function _loop2(type) {
        if (type !== 'custom') {
            res.push([function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return [type].concat(args);
            }, map[type]]);
        }
    };

    for (var type in map) {
        _loop2(type);
    }
    return res;
};

var cellMacros = {
    map: function map(_ref7) {
        var _ref8 = _slicedToArray(_ref7, 1),
            _map = _ref8[0];

        var res = ['funnel', function (cell, val) {
            return _map[cell] instanceof Function ? _map[cell](val) : _map[cell];
        }];
        for (var cell in _map) {
            res.push(cell);
        }
        return res;
    },
    deltasToArr: function deltasToArr(_ref9) {
        var _ref10 = _slicedToArray(_ref9, 1),
            cell = _ref10[0];

        return [applyDelta, cell, '^'];
    },
    arrToDeltas: function arrToDeltas(_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2),
            cell = _ref12[0],
            idField = _ref12[1];

        //idField = idField ||
        return ['closure.async', function () {
            var prev = [];
            return function (cb, arr) {
                if (!prev.length) {
                    arr.forEach(function (item) {
                        return cb(['create', item]);
                    });
                }
                prev = arr;
            };
        }, cell];
    },
    deltas: deltasMacros,
    coll: collMacros,
    list: collMacros,
    passOnceIf: function passOnceIf(_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2),
            func = _ref14[0],
            cell = _ref14[1];

        return ['closure', function () {
            var passed = false;
            return function () {
                if (passed) {
                    return _mrr.skip;
                }
                var res = func.apply(null, arguments);
                if (res) {
                    passed = true;
                    return res;
                } else {
                    return _mrr.skip;
                }
            };
        }, cell];
    },
    merge: function merge(_ref15) {
        var _ref16 = _toArray(_ref15),
            map = _ref16[0],
            others = _ref16.slice(1);

        if (isJustObject(map)) {
            var res = ['funnel', function (cell, val) {
                return [cell, val];
            }].concat(_toConsumableArray(Object.keys(map)));
            return [function (_ref17) {
                for (var _len3 = arguments.length, otherArgs = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    otherArgs[_key3 - 1] = arguments[_key3];
                }

                var _ref18 = _slicedToArray(_ref17, 2),
                    cell = _ref18[0],
                    val = _ref18[1];

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
    toggle: function toggle(_ref19) {
        var _ref20 = _slicedToArray(_ref19, 2),
            setTrue = _ref20[0],
            setFalse = _ref20[1];

        return ['funnel', function (a, b) {
            return b;
        }, [always(true), setTrue], [always(false), setFalse]];
    },
    debounce: function debounce(_ref21) {
        var _ref22 = _slicedToArray(_ref21, 2),
            time = _ref22[0],
            arg = _ref22[1];

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
    promise: function promise(_ref23) {
        var _ref24 = _toArray(_ref23),
            func = _ref24[0],
            argCells = _ref24.slice(1);

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
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
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
                            cb('success', data);
                            cb('error', null);
                        }
                    }.bind(null, c)).catch(function (i, e) {
                        if (! --load_count) {
                            cb('status', 'error');
                        }
                        if (i !== latest_num) {
                            return;
                        } else {
                            cb('success', null);
                            cb('data', null);
                            cb('error', e);
                        }
                    }.bind(null, c));
                }
            };
        }].concat(_toConsumableArray(argCells));
    },
    split: function split(_ref25) {
        var _ref26 = _toArray(_ref25),
            map = _ref26[0],
            argCells = _ref26.slice(1);

        return ['nested', function (cb) {
            for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                args[_key5 - 1] = arguments[_key5];
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
            return a ? b : _mrr.skip;
        }].concat(_toConsumableArray(cells));
    },
    closureMerge: function closureMerge(_ref27) {
        var _ref28 = _slicedToArray(_ref27, 2),
            initVal = _ref28[0],
            map = _ref28[1];

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
    closureMap: function closureMap(_ref29) {
        var _ref30 = _slicedToArray(_ref29, 2),
            initVal = _ref30[0],
            map = _ref30[1];

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
    mapPrev: function mapPrev(_ref31) {
        var _ref32 = _slicedToArray(_ref31, 1),
            map = _ref32[0];

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
    join: function join(_ref33) {
        var _ref34 = _toArray(_ref33),
            fields = _ref34.slice(0);

        return ['funnel', function (cell, val) {
            return val;
        }].concat(_toConsumableArray(fields));
    },
    '&&': function _(_ref35) {
        var _ref36 = _toArray(_ref35),
            cells = _ref36.slice(0);

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
    '||': function _(_ref37) {
        var _ref38 = _toArray(_ref37),
            cells = _ref38.slice(0);

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
    trigger: function trigger(_ref39) {
        var _ref40 = _slicedToArray(_ref39, 2),
            field = _ref40[0],
            val = _ref40[1];

        return [function (a) {
            return a === val ? true : _mrr.skip;
        }, field];
    },
    skipSame: function skipSame(_ref41) {
        var _ref42 = _slicedToArray(_ref41, 2),
            eq_type = _ref42[0],
            field = _ref42[1];

        if (!field) {
            return [function (z, x) {
                return (0, _mrr.shallow_equal)(z, x) ? _mrr.skip : z;
            }, eq_type, '^'];
        }
        var func = void 0;
        if (eq_type instanceof Function) {
            func = eq_type;
        } else {
            if (eq_type === 'deepEqual') {
                func = function func(a, b) {
                    return JSON.stringify(a) === JSON.stringify(b);
                };
            } else {
                throw new Exception('Unknown comparison type: ' + eq_type + ' in "skipSame" macros!');
            }
        }
        return [function (z, x) {
            return func(z, x) ? _mrr.skip : z;
        }, field, '^'];
    },
    skipIf: function skipIf(_ref43) {
        var _ref44 = _toArray(_ref43),
            func = _ref44[0],
            fields = _ref44.slice(1);

        if (!fields.length) {
            fields = [func];
            func = function func(a) {
                return a;
            };
        }
        return [function () {
            var res = func.apply(null, arguments);
            return !res ? true : _mrr.skip;
        }].concat(_toConsumableArray(fields));
    },
    when: function when(_ref45) {
        var _ref46 = _toArray(_ref45),
            func = _ref46[0],
            fields = _ref46.slice(1);

        if (!fields.length) {
            fields = [func];
            func = function func(a) {
                return a;
            };
        }
        return [function () {
            var res = func.apply(null, arguments);
            return !!res ? true : _mrr.skip;
        }].concat(_toConsumableArray(fields));
    },
    turnsFromTo: function turnsFromTo(_ref47) {
        var _ref48 = _slicedToArray(_ref47, 3),
            from = _ref48[0],
            to = _ref48[1],
            cell = _ref48[2];

        return ['closure', function () {
            var prev_val = void 0;
            return function (val) {
                if (val === to && prev_val === from) {
                    prev_val = val;
                    return true;
                } else {
                    prev_val = val;
                    return _mrr.skip;
                }
            };
        }, cell];
    },
    skipN: function skipN(_ref49) {
        var _ref50 = _slicedToArray(_ref49, 2),
            field = _ref50[0],
            n = _ref50[1];

        return ['closure', function () {
            var count = 0;
            n = n || 1;
            return function (val) {
                if (++count > n) {
                    return val;
                } else {
                    return _mrr.skip;
                }
            };
        }, field];
    },
    once: function once(_ref51) {
        var _ref52 = _slicedToArray(_ref51, 1),
            field = _ref52[0];

        return ['closure', function () {
            var already = false;
            return function (val) {
                if (!already) {
                    already = true;
                    return val;
                } else {
                    return _mrr.skip;
                }
            };
        }, field];
    },
    remember: function remember(_ref53) {
        var _ref54 = _slicedToArray(_ref53, 3),
            cell = _ref54[0],
            time = _ref54[1],
            defVal = _ref54[2];

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
    accum: function accum(_ref55) {
        var _ref56 = _slicedToArray(_ref55, 2),
            cell = _ref56[0],
            time = _ref56[1];

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
var getMacrosFunc = function getMacrosFunc(macrosName) {
    return function () {
        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return [macrosName].concat(args);
    };
};

var map = getMacrosFunc('map');
var deltasToArr = getMacrosFunc('deltasToArr');
var arrToDeltas = getMacrosFunc('arrToDeltas');
var deltas = getMacrosFunc('deltas');
var coll = getMacrosFunc('coll');
var list = getMacrosFunc('list');
var passOnceIf = getMacrosFunc('passOnceIf');
var merge = getMacrosFunc('merge');
var toggle = getMacrosFunc('toggle');
var debounce = getMacrosFunc('debounce');
var promise = getMacrosFunc('promise');
var split = getMacrosFunc('split');
var transist = getMacrosFunc('transist');
var closureMerge = getMacrosFunc('closureMerge');
var closureMap = getMacrosFunc('closureMap');
var mapPrev = getMacrosFunc('mapPrev');
var join = getMacrosFunc('join');
var and = getMacrosFunc('&&');
var or = getMacrosFunc('||');
var trigger = getMacrosFunc('trigger');
var skipSame = getMacrosFunc('skipSame');
var skipIf = getMacrosFunc('skipIf');
var when = getMacrosFunc('when');
var turnsFromTo = getMacrosFunc('turnsFromTo');
var skipN = getMacrosFunc('skipN');
var remember = getMacrosFunc('remember');
var accum = getMacrosFunc('accum');

exports.default = cellMacros;
exports.map = map;
exports.deltasToArr = deltasToArr;
exports.arrToDeltas = arrToDeltas;
exports.deltas = deltas;
exports.coll = coll;
exports.list = list;
exports.passOnceIf = passOnceIf;
exports.merge = merge;
exports.toggle = toggle;
exports.debounce = debounce;
exports.promise = promise;
exports.split = split;
exports.transist = transist;
exports.closureMerge = closureMerge;
exports.closureMap = closureMap;
exports.mapPrev = mapPrev;
exports.join = join;
exports.and = and;
exports.or = or;
exports.trigger = trigger;
exports.skipSame = skipSame;
exports.skipIf = skipIf;
exports.when = when;
exports.turnsFromTo = turnsFromTo;
exports.skipN = skipN;
exports.remember = remember;
exports.accum = accum;