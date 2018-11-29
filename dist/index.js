'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOfType = exports.withMrr = exports.skip = exports.createMrrApp = exports.Mrr = undefined;

var _mrrReact = require('./mrr-react');

Object.defineProperty(exports, 'createMrrApp', {
  enumerable: true,
  get: function get() {
    return _mrrReact.createMrrApp;
  }
});
Object.defineProperty(exports, 'skip', {
  enumerable: true,
  get: function get() {
    return _mrrReact.skip;
  }
});
Object.defineProperty(exports, 'withMrr', {
  enumerable: true,
  get: function get() {
    return _mrrReact.withMrr;
  }
});
Object.defineProperty(exports, 'isOfType', {
  enumerable: true,
  get: function get() {
    return _mrrReact.isOfType;
  }
});

var _mrrReact2 = _interopRequireDefault(_mrrReact);

var _mrr = require('./mrr');

var _mrr2 = _interopRequireDefault(_mrr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _mrrReact2.default;
exports.Mrr = _mrr2.default;