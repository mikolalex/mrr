'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _myMrr = require('./myMrr');

var _Element = require('./Element');

var _Element2 = _interopRequireDefault(_Element);

var _Input = require('./Input');

var _Input2 = _interopRequireDefault(_Input);

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

var state = function state() {
  var state = {};
  return function (a) {
    if (a instanceof Array) {
      state = Object.assign({}, state);
      state[a[1]] = a[0];
    } else {
      state = Object.assign({}, state, a || {});
    }
    return state;
  };
};

var propOrSkip = function propOrSkip(obj, key) {
  if (obj) {
    return obj[key];
  } else {
    return _myMrr.skip;
  }
};

var renderFields = function renderFields(state, props, $, connectAs) {
  var fields = [];
  for (var as in props.fields) {
    fields.push([as, props.fields[as]]);
  }

  return fields.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        as = _ref2[0],
        config = _ref2[1];

    var Comp = config.type instanceof Function ? config.type : _Input2.default;
    var elProps = Object.assign({ key: as }, config, connectAs(as));
    if (config.type instanceof Function) {
      delete elProps.type;
      elProps.isChildForm = true;
    }
    if (!config.type) {
      elProps.type = 'text';
    }
    if (props.defaultValue && props.defaultValue[as] !== undefined) {
      elProps.defaultValue = config.disassemble ? config.disassemble(props.defaultValue[as]) : props.defaultValue[as];
    }
    return _react2.default.createElement(Comp, elProps);
  });
};

var findFirst = function findFirst(obj) {
  for (var v in obj) {
    if (obj[v]) return v;
  }
  return false;
};

function isChecked(a) {
  for (var k in a) {
    if (a[k] === true || a[k] instanceof Object && isChecked(a[k])) {
      return true;
    }
  }
  return false;
}

var Form = (0, _myMrr.withMrr)(function (props) {
  var struct = {
    $meta: {},
    "=val": ['closure', state, ['join', '*/valWithName', 'initVal']],
    "=valids": ['closure', state, '*/validWithName'],
    "=focusedChildren": ['closure', state, '*/focusedWithName'],
    "=focused": [findFirst, 'focusedChildren'],
    "=checkings": ['closure', state, '*/beingCheckedWithName'],
    "=beingChecked": [function (a, status) {
      //console.log('BC', a, status);
      if (status === 'checking') {
        return true;
      }
      return isChecked(a);
    }, 'checkings', 'status'],
    "=controlsDisabled": ['||', 'disabled', props.disableControlsWhenValidated ? 'somethingIsChecked' : _myMrr.skip],
    "=inputsDisabled": ['||', 'disabled', props.disableInputsWhenValidated ? 'somethingIsChecked' : _myMrr.skip]
  };
  return struct;
}, function (state, props, $, connectAs) {
  if (state.hidden) return null;
  if (!props.fields) {
    return _react2.default.createElement(
      'div',
      null,
      'Please override me!'
    );
  }
  return _react2.default.createElement(
    'div',
    { className: 'form' },
    props.label && _react2.default.createElement(
      'div',
      { className: 'form-title' },
      props.label
    ),
    _react2.default.createElement(
      'div',
      { className: 'form-fields' },
      renderFields(state, props, $, connectAs)
    ),
    state.errorShown && _react2.default.createElement(
      'div',
      { className: 'form-errors' },
      state.currentError
    ),
    state.currentStep && _react2.default.createElement(
      'div',
      { className: 'form-controls' },
      _react2.default.createElement(
        'button',
        { className: 'prevStep', onClick: $('prevStep'), disabled: state.controlsDisabled },
        'Back'
      ),
      '\xA0\xA0\xA0',
      _react2.default.createElement(
        'button',
        { className: 'nextStep', onClick: $('nextStep'), disabled: state.controlsDisabled },
        'Next'
      )
    ),
    state.currentStep === undefined && !props.isChildForm && _react2.default.createElement(
      'div',
      { className: 'form-controls' },
      _react2.default.createElement(
        'button',
        { className: 'clear', onClick: $('clear'), disabled: state.controlsDisabled },
        'Clear'
      ),
      '\xA0\xA0\xA0',
      _react2.default.createElement(
        'button',
        { className: 'submit', onClick: $('submit'), disabled: state.controlsDisabled },
        'Submit'
      )
    )
  );
}, _Element2.default);

exports.default = Form;