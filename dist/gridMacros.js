'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var joinAsObject = function joinAsObject(target_struct, parent, child, key) {
  if (parent && child && parent[key] && child[key]) {
    target_struct[key] = Object.assign({}, parent[key], child[key]);
  }
};
var joinAsArray = function joinAsArray(target_struct, parent, child, key) {
  if (parent && child && parent[key] && child[key]) {
    target_struct[key] = [].concat(_toConsumableArray(parent[key]), _toConsumableArray(child[key]));
  }
};

var objMap = function objMap(obj, func) {
  var res = {};
  for (var i in obj) {
    var _func = func(obj[i], i),
        _func2 = _slicedToArray(_func, 2),
        val = _func2[0],
        key = _func2[1];

    res[key] = val;
  }
  return res;
};

var overwritePlaceholder = new function Placeholder() {}();

var gridMacros = {
  merge: function merge() {
    var child_struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent_struct = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var struct = Object.assign({}, parent_struct, child_struct);
    joinAsObject(struct, parent_struct, child_struct, '$init');
    joinAsArray(struct, parent_struct, child_struct, '$readFromDOM');
    joinAsArray(struct, parent_struct, child_struct, '$writeToDOM');
    joinAsArray(struct, parent_struct, child_struct, '$expose');
    for (var k in struct) {
      if (k[0] === '+') {
        var real_k = k.substr(1);
        if (!struct[real_k]) {
          if (struct['=' + real_k]) {
            struct['=' + real_k] = ['join', struct[k], struct['=' + real_k]];
          } else {
            struct[real_k] = struct[k];
          }
        } else {
          if (['$writeToDOM', '$readFromDOM'].indexOf(real_k) !== -1) {
            struct[real_k] = [].concat(_toConsumableArray(new Set([].concat(_toConsumableArray(struct[k]), _toConsumableArray(struct[real_k])))));
          } else {
            struct[real_k] = ['join', struct[k], struct[real_k]];
          }
        }
        delete struct[k];
      }
      if (k[0] === '*') {
        (function () {
          var real_k = k.substr(1);
          if (!struct[real_k]) {
            //struct[real_k] = struct[k];
          } else {
            var newMrrRow = struct[k].map(function (val) {
              if (val === overwritePlaceholder) {
                return struct[real_k];
              }
              return val;
            });
            struct[real_k] = newMrrRow;
            //console.log('NEW STRUCT', newMrrRow);
          }
          delete struct[k];
        })();
      }
    }
    return struct;
  },
  persist: function persist(grid, config) {},
  skipEqual: function skipEqual(grid, config) {
    var res = {};
    for (var cell in config) {
      if (config[cell] === true) {
        res['*' + cell] = ['skipSame', overwritePlaceholder];
      } else {
        res['*' + cell] = ['skipSame', config[cell], overwritePlaceholder];
      }
    }
    return gridMacros.merge(res, grid);
  }

};

var merge = gridMacros.merge;
var persist = gridMacros.persist;
var skipEqual = gridMacros.skipEqual;

exports.merge = merge;
exports.persist = persist;
exports.skipEqual = skipEqual;
exports.overwritePlaceholder = overwritePlaceholder;
exports.default = gridMacros;