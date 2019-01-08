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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var arrState = function arrState(a, prev) {
  var state = prev ? prev.slice() : [];
  state[a[1]] = a[0];
  return state;
};

exports.default = (0, _myMrr.withMrr)(function (props) {
  return _myMrr.gridMacros.skipEqual({
    length: [function (val) {
      return val.length;
    }, 'val'],
    '+hideErrors': 'length',
    "val": ['merge', {
      //initVal: a => a,
      '*/valWithName': function valWithName(val, prev) {
        var state = prev ? prev.slice() : [];
        state[val[1]] = val[0];
        return state;
      },
      incr: function incr(_, prev) {
        return [].concat(_toConsumableArray(prev), [{}]);
      },
      decr: function decr(_, prev) {
        return prev.slice(0, prev.length - 1);
      },
      setVal: function setVal(a) {
        return a;
      }
    }, '-val'],
    "valids": ['skipSame', [arrState, '*/validWithName', '^']],
    validation: ['nested', (0, _Element.getValidationFunc)(props), 'val', '../val', 'valids', 'length', 'submit', '$start']
  }, {
    val: 'deepEqual',
    valids: true
  });
}, function (state, props, $, connectAs) {
  if (state.hidden) return null;
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
      if (state.val && state.val[i] !== undefined) {
        childProps.defaultValue = state.val[i];
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
    !props.fixedLength && _react2.default.createElement(
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