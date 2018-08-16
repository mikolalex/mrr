'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _myMrr = require('./myMrr');

var _Element = require('./Element');

var _Element2 = _interopRequireDefault(_Element);

var _Form = require('./Form');

var _Form2 = _interopRequireDefault(_Form);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var arrState = function arrState(a, prev) {
  var state = prev ? prev.slice() : [];
  state[a[1]] = a[0];
  return state;
};

exports.default = (0, _myMrr.withMrr)(function (props) {
  return {
    $init: {
      length: 1
    },
    length: ['merge', {
      incr: function incr(_, prev) {
        return prev + 1;
      },
      decr: function decr(_, prev) {
        return prev - 1 || 1;
      },
      initVal: function initVal(vals) {
        return vals ? vals.length : _myMrr.skip;
      }
    }, '^'],
    '+hideErrors': 'length',
    "=val": ['closure.funnel', function (init) {
      var prev = init || [];
      return function (cell, val) {
        if (cell === 'initVal') {
          prev = val;
        } else {
          var state = prev.slice();
          state[val[1]] = val[0];
          prev = state;
        }
        return prev;
      };
    }, '*/valWithName', 'initVal'],
    "=valids": ['skipSame', [arrState, '*/validWithName', '^']],
    validation: ['nested', (0, _Element.getValidationFunc)(props), 'val', '../val', 'valids', 'length', 'submit', '$start']
  };
}, function (state, props, $, connectAs) {
  var arr = new Array(state.length).fill(true);
  var Child = props.child || _Form2.default;
  return _react2.default.createElement(
    'div',
    null,
    arr.map(function (_, i) {
      var childProps = Object.assign({ isChildForm: true }, connectAs(i), props.childProps || {});
      if (props.defaultValue && props.defaultValue[i] !== undefined) {
        childProps.defaultValue = props.defaultValue[i];
      }
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(Child, childProps)
      );
    }),
    state.errorShown && _react2.default.createElement(
      'div',
      { className: 'error' },
      state.currentError
    ),
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'button',
        { onClick: $('incr') },
        '+'
      ),
      '\xA0\xA0\xA0',
      _react2.default.createElement(
        'button',
        { onClick: $('decr') },
        '-'
      )
    )
  );
}, _Element2.default);