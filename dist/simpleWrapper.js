'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.simpleWrapper = undefined;

var _mrr = require('./mrr');

var _mrr2 = _interopRequireDefault(_mrr);

var _operators = require('./operators');

var _operators2 = _interopRequireDefault(_operators);

var _dataTypes = require('./dataTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var simpleWrapper = function simpleWrapper(struct) {
    var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var availableMacros = Object.assign({}, _operators2.default, meta.macros);
    var availableDataTypes = Object.assign({}, _dataTypes.defDataTypes, meta.dataTypes);
    var handlers = {};
    var obj = new _mrr2.default(struct, meta.props || {}, {
        setOuterState: function setOuterState(update) {
            for (var cell in update) {
                if (handlers[cell]) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = handlers[cell][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var f = _step.value;

                            f(update[cell]);
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
        },
        macros: availableMacros,
        dataTypes: availableDataTypes,
        strict: meta.strict
    });
    obj.onMount();
    return {
        set: function set(cell, val) {
            obj.toState(cell, val)();
        },
        get: function get(cell) {
            return obj.mrrState[cell];
        },
        onChange: function onChange(cell, func) {
            if (!handlers[cell]) {
                handlers[cell] = [];
            }
            handlers[cell].push(func);
        },
        connect: function connect(child_struct, as, up, down) {
            var props = { mrrConnect: obj.mrrConnect(as, up, down) };
            return simpleWrapper(child_struct, { props: props });
        }
    };
};

exports.simpleWrapper = simpleWrapper;