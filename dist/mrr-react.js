'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createMrrApp = exports.skip = exports.withMrr = exports.isOfType = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _operators = require('./operators');

var _operators2 = _interopRequireDefault(_operators);

var _mrr = require('./mrr');

var _mrr2 = _interopRequireDefault(_mrr);

var _gridMacros = require('./gridMacros');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var getWithMrr = function getWithMrr(GG, macros, dataTypes) {
    return function (mrrStructure) {
        var _render = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var parentClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var mrrParentClass = mrrStructure;
        var parent = parentClass || _react2.default.Component;
        _render = _render || parent.prototype.render || function () {
            return null;
        };
        var cls = function (_parent) {
            _inherits(Mrr, _parent);

            function Mrr(props) {
                var already_inited = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                _classCallCheck(this, Mrr);

                var _this = _possibleConstructorReturn(this, (Mrr.__proto__ || Object.getPrototypeOf(Mrr)).call(this, props, 'AI'));

                _this.props = props;
                if (already_inited !== 'AI') {
                    var struct = _this.getMrrStruct();
                    _this.mrr = new _mrr2.default(struct, props, function (a) {
                        return _this.setState(a);
                    }, macros, dataTypes, GG);
                    _this.mrr.reactWrapper = _this;
                    _this.state = _this.mrr.initialState;
                }
                return _this;
            }

            _createClass(Mrr, [{
                key: 'componentDidMount',
                value: function componentDidMount() {
                    this.mrr.onMount();
                }
            }, {
                key: 'componentWillUnmount',
                value: function componentWillUnmount() {
                    this.mrr.onUnmount();
                }
            }, {
                key: '__mrrGetComputed',
                value: function __mrrGetComputed() {
                    var parent_struct = parent.prototype.__mrrGetComputed ? parent.prototype.__mrrGetComputed.apply(this) : {};
                    return (0, _gridMacros.merge)(mrrStructure instanceof Function ? mrrStructure(this.props || {}) : mrrStructure, parent_struct);
                }
            }, {
                key: 'getMrrStruct',
                value: function getMrrStruct() {
                    if (!this.props) {
                        return this.__mrrGetComputed();
                    }
                    return (0, _gridMacros.merge)(this.props.__mrr, this.__mrrGetComputed());
                }
            }, {
                key: 'render',
                value: function render() {
                    var _this2 = this;

                    var self = this;
                    var jsx = _render.call(this, this.state, this.props, this.mrr.toState.bind(this.mrr), function (as, up, down) {
                        return { mrrConnect: _this2.mrr.mrrConnect(as, up, down) };
                    }, function () {
                        self.mrr.__mrr.getRootHandlersCalled = true;
                        var props = {
                            id: '__mrr_root_node_n' + self.mrr.__mrr.id
                        };

                        var _loop = function _loop(event_type) {
                            props['on' + event_type] = function (e) {
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = self.mrr.__mrr.root_el_handlers[event_type][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var _step$value = _slicedToArray(_step.value, 3),
                                            selector = _step$value[0],
                                            handler = _step$value[1],
                                            cell = _step$value[2];

                                        if (e.target.matches('#__mrr_root_node_n' + self.mrr.__mrr.id + ' ' + selector)) {
                                            var value = handler(e);
                                            self.mrr.setState(_defineProperty({}, cell, value));
                                        }
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
                        };

                        for (var event_type in self.mrr.__mrr.root_el_handlers) {
                            _loop(event_type);
                        }
                        return props;
                    });
                    if (this.mrr.__mrr.usesEventDelegation && !this.mrr.__mrr.getRootHandlersCalled) {
                        console.warn('Looks like you forget to call getRootHandlers when using event delegation');
                    }
                    return jsx;
                }
            }]);

            return Mrr;
        }(parent);
        return cls;
    };
};

var withMrr = exports.withMrr = getWithMrr(null, _operators2.default, defDataTypes);

var def = withMrr({}, null, _react2.default.Component);
def.skip = _mrr.skip;

exports.skip = _mrr.skip;


var initGlobalGrid = function initGlobalGrid(struct, availableMacros, availableDataTypes) {
    var GG = new _mrr2.default(struct, {}, function () {}, availableMacros, availableDataTypes, true);
    GG.__mrr.subscribers = [];
    return GG;
};

var createMrrApp = exports.createMrrApp = function createMrrApp(conf) {
    var availableMacros = Object.assign({}, _operators2.default, conf.macros || {});
    var availableDataTypes = Object.assign({}, defDataTypes, conf.dataTypes || {});
    var GG = conf.globalGrid ? initGlobalGrid(conf.globalGrid, availableMacros, availableDataTypes) : null;
    var withMrr = getWithMrr(GG, availableMacros, availableDataTypes);
    return {
        withMrr: withMrr,
        skip: _mrr.skip,
        GG: GG
    };
};

exports.default = def;