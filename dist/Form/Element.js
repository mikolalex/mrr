'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValidationFunc = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _myMrr = require('./myMrr');

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
var propOrSkip = function propOrSkip(obj, key) {
  if (obj) {
    console.log("RET", obj, key);
    return obj[key];
  } else {
    console.log('SKIP', key);
    return _myMrr.skip;
  }
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

var toArray = function toArray() {
  return Array.prototype.slice.call(arguments, 0);
};

var nextTick = function nextTick(func) {
  setTimeout(func, 1);
};

var isPromise = function isPromise(a) {
  return a && a.constructor && a.constructor.name === 'Promise';
};

var getValidationFunc = function getValidationFunc(props) {
  return function (cb, val, vals, valids, num) {
    if (!props.errors) {
      return;
    }
    var promises = [];
    for (var msg in props.errors) {
      var res = props.errors[msg](val, vals, valids, num);
      if (isPromise(res)) {
        promises.push([res, msg]);
      } else {
        if (res) {
          cb('error', msg);
          return;
        }
      }
    }
    if (promises.length) {
      cb('clearErrors', true);
      cb('checking', true);
      Promise.all(promises.map(function (p) {
        return p[0];
      })).then(function (results) {
        for (var k in results) {
          if (results[k]) {
            cb('checking', false);
            cb('error', promises[k][1]);
            return;
          }
        }
        cb('checking', false);
        cb('success', true);
        return;
      });
    } else {
      cb('success', true);
    }
  };
};

exports.getValidationFunc = getValidationFunc;
exports.default = (0, _myMrr.withMrr)(function (props) {
  var valPrefix = props.validateOnlyAfterSubmit ? '-' : '';
  var struct = {
    $init: {
      status: props.errors ? 'unknown' : 'valid'
    },
    'initVal': [function (parent, name) {
      if (parent && parent[name] !== undefined) {
        return props.disassemble ? props.disassemble(parent[name]) : parent[name];
      } else {
        if (props.defaultValue) {
          return props.defaultValue;
        } else {
          return _myMrr.skip;
        }
      }
    }, '-../val', '$name', '$start'],
    'setVal': [function (name, parent) {
      if (parent && parent[name] !== undefined) {
        return props.disassemble ? props.disassemble(parent[name]) : parent[name];
      } else {
        return _myMrr.skip;
      }
    }, '$name', '../setVal'],
    'val': ['merge', 'initVal', 'setVal'],
    'clear': '../clear',
    'focusedWithName': [function (val, name) {
      return [val, name];
    }, 'focused', '$name'],
    'valWithName': [function (val, name) {
      return [props.assemble ? props.assemble(val) : val, name];
    }, 'val', '$name'],
    'beingCheckedWithName': [function (beingChecked, name) {
      return [beingChecked, name];
    }, 'beingChecked', '$name'],
    'beingChecked': [function (status) {
      return status === 'checking';
    }, 'status'],
    'somethingIsChecked': ['||', '../somethingIsChecked', 'beingChecked'],
    //'validWithName': [(status, name) => [status === 'valid', name]
    'validWithName': [function (status, name) {
      if (status === 'checking') {
        return ['checking', name];
      }
      if (status === 'valid') {
        return [true, name];
      }
      if (status === 'invalid') {
        return [false, name];
      }
      return _myMrr.skip;
    }, 'status', '$name'],
    'orderWithName': [function (props, name) {
      return [props.order, name];
    }, '-$props', '$name', '$start'],
    otherVals: '../val',
    needsRevalidation: ['merge', {
      val: true,
      'validation.error': false,
      'validation.success': false
    }],
    validation: ['nested', getValidationFunc(props), valPrefix + 'val', '-otherVals', valPrefix + 'valids', ['transist', '-needsRevalidation', 'submit'], valPrefix + '$start'
    //, props.validateOnlyAfterSubmit ? skip : ['skipIf', not, '-submit', ['join', '../vals', 'val']]
    ],
    "submit": ['skipIf', function (a) {
      return a;
    }, '-hidden', '../submit'],
    "status": ['merge', {
      'validation.checking': function validationChecking(a) {
        return a ? 'checking' : _myMrr.skip;
      },
      'validation.error': 'invalid',
      'validation.success': 'valid'
    }],
    "currentError": ['merge', {
      'validation.error': id,
      'validation.success': '',
      'validation.clearErrors': ''
      //'val': '',
    }],
    "canShowErrors": ['toggle', 'submit', ['join', 'val', ['turnsFromTo', true, false, 'hidden']]],
    hideErrors: [Boolean, 'val'],
    "errorsDisplayed": ['toggle', ['async', setImmediate, 'validation.error'], ['transist', '-submit', 'hideErrors']],
    "errorShown": ['&&', 'canShowErrors', 'errorsDisplayed'],
    "disabled": props.disabled || props.disableWhenValidated ? [Boolean, ['||',
    // disable when beingChecked after submit
    '../disabled', props.disabled ? [props.disabled, '../val', '../valids'] : _myMrr.skip, props.disableWhenValidated ? 'somethingIsChecked' : _myMrr.skip]] : _myMrr.skip,
    "hidden": [function (currentStep, vals, valids, val, valid) {
      if (currentStep) {
        return currentStep != props.order;
      }
      return props.hidden ? props.hidden(vals, valids, val, valid) : false;
    }, '../currentStep', '../val', '../valids', 'val', 'valid', '$start']
  };
  if (props.defaultValue !== undefined) {
    struct.$init.val = props.defaultValue;
    struct.$init.initVal = props.defaultValue;
  }
  return _myMrr.gridMacros.skipEqual(struct, {
    focusedWithName: true,
    valWithName: true,
    beingCheckedWithName: true,
    beingChecked: true,
    somethingIsChecked: true,
    status: true,
    currentError: true,
    canShowErrors: true,
    errorsDisplayed: true,
    errorShown: true,
    disabled: true,
    hidden: true
  });
}, function (state, props, $) {
  return _react2.default.createElement(
    'div',
    null,
    'Please override me!'
  );
});