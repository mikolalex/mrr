'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _myMrr = require('./myMrr');

var _Element = require('./Element');

var _Element2 = _interopRequireDefault(_Element);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var not = function not(a) {
  return !a;
};
var incr = function incr(a) {
  return a + 1;
};
var always = function always(a) {
  return function (_) {
    return a;
  };
};
var id = function id(a) {
  return a;
};

var skipSame = function skipSame(func) {
  return function (prev) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var new_val = func.apply(null, args);
    if (new_val === prev) {
      return _myMrr.skip;
    } else {
      //console.log('SETTING NEW VAL!', new_val);
      return new_val;
    }
  };
};

exports.default = (0, _myMrr.withMrr)(function (props) {
  var struct = {
    $init: {},
    '+val': ['merge', {
      setVal: props.filter ? function (val) {
        return props.filter(val) ? val : _myMrr.skip;
      } : id,
      'clear': always('')
    }],
    $writeToDOM: ['val', 'beingChecked', 'errorShown', 'currentError', 'options', 'hidden', 'disabled']
  };
  return struct;
}, function (state, props, $) {
  if (state.hidden) return null;
  var options = void 0;
  var elProps = {
    onFocus: $('focused', true),
    onBlur: $('focused', false),
    onChange: $('setVal'),
    value: state.val || '',
    disabled: !!state.disabled,
    name: state.$name
  };
  if (props.type === 'select') {
    if (props.options) {
      options = props.options;
    } else {
      if (state.options) {
        options = state.options;
      }
    }
    if (!options) options = [];
  } else {
    elProps.type = props.type;
  }
  return _react2.default.createElement(
    'div',
    { className: 'my-input' },
    !props.hideLabel && _react2.default.createElement(
      'label',
      null,
      props.label || ''
    ),
    !props.hideInput && _react2.default.createElement(
      'div',
      { className: 'input', style: { display: 'inline-block' } },
      props.type === 'select' && _react2.default.createElement(
        'select',
        elProps,
        _react2.default.createElement('option', { key: '' }),
        options instanceof Array && options.map(function (a) {
          return _react2.default.createElement(
            'option',
            { key: a },
            a
          );
        })
      ),
      props.type !== 'select' && _react2.default.createElement('input', elProps)
    ),
    state.errorShown && _react2.default.createElement(
      'div',
      { className: 'error' },
      state.currentError
    )
  );
}, _Element2.default);