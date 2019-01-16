export const isOfType = (val, type, dataTypes) => dataTypes[type] ? dataTypes[type](val) : false;

export const defDataTypes = {
    'array': {
        check: a => a instanceof Array,
    },
    'object': {
        check: a => a instanceof Object,
    },
    'func': {
        check: a => a instanceof Function,
    },
    'int': {
        check: a => typeof a === 'number',
    },
    'string': {
        check: a => typeof a === 'string',
    },
    'pair': {
        check: a => (a instanceof Array) && (a.length === 2),
        extends: ['array'],
    },
    'coll_update': {
        check: (a, types) => (
            a instanceof Array 
            && (a.length === 2) 
            && isOfType(a[0], 'object', types)
            && isOfType(a[1], 'object_or_int', types)
        )
    },
    'array_or_object': {
        check: a => a instanceof Object,
        extends: ['array', 'object'],
    },
    'object_or_int': {
        check: a => (a instanceof Object) || (typeof a === 'number'),
        extends: ['int', 'object'],
    },
}