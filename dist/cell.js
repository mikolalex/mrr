'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var cell = function cell(a) {
    if (a[0] === '-' || a[0] === '$') {
        throw new Error('Cellname cannot start with ' + a[0] + ": " + a);
    }
    if (a.indexOf('/') !== -1) {
        throw new Error('Cellname cannot contain "/": ' + a);
    }
    if (a[a.length - 1] === '$') {
        throw new Error('Cellname cannot end with "$": ' + a);
    }
    return a;
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

exports.cell = cell;
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