'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _myMrr = require('./myMrr');

var _Form = require('./Form');

var _Form2 = _interopRequireDefault(_Form);

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
    state = Object.assign({}, state);
    state[a[1]] = a[0];
    return state;
  };
};

var styles = '\n\n.my-input label {\n    width: 200px;\n    display: inline-block;\n    text-align: right;\n    padding: 0 10px;\n}\n\n.my-input {\n    padding: 10px;\n    margin: 0 10px;\n}\n\n.form {\n    border: 1px dotted grey;\n    padding: 5px;\n    margin: 5px;\n}\n\n';

var set = function set() {
  var state = new Set();
  return function (a) {
    state.add(a[0]);
    return state;
  };
};
var objFlip = function objFlip(obj) {
  var flippedObj = {};
  for (var k in obj) {
    flippedObj[obj[k]] = k;
  }
  return flippedObj;
};

var isPromise = function isPromise(a) {
  return a && a.constructor && a.constructor.name === 'Promise';
};

var getValidationFunc = function getValidationFunc(props) {
  return function (cb, val, vals, valids, orders, currentStep) {
    if (!props.errors) {
      return;
    }
    var promises = [];
    for (var msg in props.errors) {
      var res = props.errors[msg](val, vals, valids, currentStep);
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

exports.default = (0, _myMrr.withMrr)(function (props) {

  var valPrefix = props.validateOnlyAfterSubmit ? '-' : '';
  return _myMrr.gridMacros.skipEqual({
    $init: {
      currentStep: 1
    },
    currentStep: ['merge', {
      "makeNextStep.next": function makeNextStepNext(_, prev) {
        return Number(prev) + 1;
      },
      prevStep: function prevStep(_, prev) {
        return prev - 1 || 1;
      },
      toStep: id
    }, '^'],
    makeNextStep: ['split', {
      'next': function next(orders, currentStep) {
        return orders[currentStep + 1];
      },
      'final': function final(orders, currentStep) {
        return !orders[currentStep + 1];
      }
    }, '-orders', '-currentStep', 'makeNextStepAfterValidation'],
    "allSteps": [function (a) {
      return a.size;
    }, ['closure', set, '*/orderWithName']],
    validation: ['nested', getValidationFunc(props), valPrefix + 'val', ['skipSame', valPrefix + '../val'], '-valids', 'makeNextStep.final'],
    "mayProceed": ['toggle', 'nextStep', 'val'],
    validSoFar: ['join', ['closure', function () {
      var state = {};
      return function (valids, orders, currentStep, mayProceed) {
        if (!orders) return _myMrr.skip;
        var key = orders[currentStep];
        var ok = state[key] === 'checking' && valids[key] === true && mayProceed;
        state[key] = valids[key];
        return ok;
      };
    }, 'valids', '-orders', '-currentStep', '-mayProceed'], [function (valids, orders, currentStep) {
      if (!orders) return _myMrr.skip;
      var key = orders[currentStep];
      return !valids || valids[key] === true || valids[key] === undefined;
    }, '-valids', '-orders', '-currentStep', 'nextStep']],
    submit: ['merge', '../submit', 'nextStep'],
    makeNextStepAfterValidation: ['skipIf', not, 'validSoFar'],
    //reset: ['skipSame', 'currentStep'],
    "orders": [objFlip, ['closure', state, '*/orderWithName']],
    "successfulSubmit": ['transist', '-val', 'makeNextStep.final']
  }, {
    allSteps: true,
    mayProceed: true,
    orders: true
  });
}, null, _Form2.default);