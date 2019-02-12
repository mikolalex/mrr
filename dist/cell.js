'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var cell = function cell(a, type) {
    if (a[0] === '-' || a[0] === '$') {
        throw new Error('Cellname cannot start with ' + a[0] + ": " + a);
    }
    if (a.indexOf('/') !== -1) {
        throw new Error('Cellname cannot contain "/": ' + a);
    }
    if (a[a.length - 1] === '$') {
        throw new Error('Cellname cannot end with "$": ' + a);
    }
    return a + (type ? ': ' + type : '');
};
var passive = function passive(c) {
    return '-' + cell(c);
};
var children = function children(c) {
    return '*/' + cell(c);
};
var child = function child(_child, c) {
    return _child + '/' + cell(c);
};
var parent = function parent(c) {
    return '../' + cell(c);
};
var unique = function unique(f) {
    var cells = {};
    return function (cell) {
        if (cells[cell]) {
            throw new Error('Cellname already taken!');
        }
        cells[cell] = true;
        return f ? f(cell) : cell;
    };
};

var nested = function nested(cell, subcells) {

    var res = {
        toString: function toString() {
            return cell;
        }
    };
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = subcells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var subc = _step.value;

            res[subc] = cell + '.' + subc;
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

    return res;
};

var getUniqueChecker = unique.bind(null, function (a) {
    return a;
});

var $start$ = '$start',
    $end$ = '$end',
    $state$ = '$state',
    $globalState$ = '^/$state',
    $props$ = '$props',
    $name$ = '$name',
    $async$ = '$async',
    $nested$ = '$nested',
    $changedCellName$ = '$changedCellName';


var prev = '^';

var fromDOM = new function fromDOM() {}();
var fromParent = new function fromParent() {}();
var fromChildren = new function fromChildren() {}();
var fromOthers = new function fromOthers() {}();

exports.fromDOM = fromDOM;
exports.fromParent = fromParent;
exports.fromChildren = fromChildren;
exports.fromOthers = fromOthers;
exports.cell = cell;
exports.nested = nested;
exports.prev = prev;
exports.children = children;
exports.parent = parent;
exports.unique = unique;
exports.getUniqueChecker = getUniqueChecker;
exports.passive = passive;
exports.$start$ = $start$;
exports.$end$ = $end$;
exports.$state$ = $state$;
exports.$globalState$ = $globalState$;
exports.$props$ = $props$;
exports.$name$ = $name$;
exports.$async$ = $async$;
exports.$nested$ = $nested$;
exports.$changedCellName$ = $changedCellName$;