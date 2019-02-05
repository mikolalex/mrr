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
    var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var dataTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var availableMacros = Object.assign({}, _operators2.default, macros);
    var availableDataTypes = Object.assign({}, _dataTypes.defDataTypes, dataTypes);
    var handlers = {};
    var obj = new _mrr2.default(struct, {}, function (update) {
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
    }, availableMacros, availableDataTypes);
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
        }
    };
};

exports.simpleWrapper = simpleWrapper;