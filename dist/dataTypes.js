'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var isOfType = exports.isOfType = function isOfType(val, type, dataTypes) {
    return dataTypes[type] ? dataTypes[type](val) : false;
};

var defDataTypes = exports.defDataTypes = {
    'array': {
        check: function check(a) {
            return a instanceof Array;
        }
    },
    'object': {
        check: function check(a) {
            return a instanceof Object;
        }
    },
    'func': {
        check: function check(a) {
            return a instanceof Function;
        }
    },
    'int': {
        check: function check(a) {
            return typeof a === 'number';
        }
    },
    'string': {
        check: function check(a) {
            return typeof a === 'string';
        }
    },
    'pair': {
        check: function check(a) {
            return a instanceof Array && a.length === 2;
        },
        extends: ['array']
    },
    'coll_update': {
        check: function check(a, types) {
            return a instanceof Array && a.length === 2 && isOfType(a[0], 'object', types) && isOfType(a[1], 'object_or_int', types);
        }
    },
    'array_or_object': {
        check: function check(a) {
            return a instanceof Object;
        },
        extends: ['array', 'object']
    },
    'object_or_int': {
        check: function check(a) {
            return a instanceof Object || typeof a === 'number';
        },
        extends: ['int', 'object']
    }
};