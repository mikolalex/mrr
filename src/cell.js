const cell = (a, type) => {
    if(a[0] === '-' || a[0] === '$'){
        throw new Error('Cellname cannot start with ' + a[0] + ": " + a);
    }
    if(a.indexOf('/') !== -1){
        throw new Error('Cellname cannot contain "/": ' + a);
    }
    if(a[a.length - 1] === '$'){
        throw new Error('Cellname cannot end with "$": ' + a);
    }
    return a + (type ? ': ' + type : '');
};
const passive = c => '-' + cell(c);
const children = c => '*/' + cell(c);
const child = (child, c) => child + '/' + cell(c);
const parent = c => '../' + cell(c);
const unique = (f) => {
    const cells = {};
    return (cell) => {
        if(cells[cell]){
            throw new Error('Cellname already taken!');
        }
        cells[cell] = true;
        return f ? f(cell) : cell;
    }
}

const nested = (cell, subcells) => {
	
	const res = {
		toString: () => cell,
	}
	for(let subc of subcells){
		res[subc] = cell + '.' + subc;
	}
	return res;	
}

const getUniqueChecker = unique.bind(null, a => a);

const [
    $start$,
    $end$,
    $state$,
    $globalState$,
    $props$,
    $name$,
    $async$,
    $nested$,
    $changedCellName$
] = [
    '$start',
    '$end',
    '$state',
    '^/$state', 
    '$props', 
    '$name', 
    '$async', 
    '$nested', 
    '$changedCellName'
]

const prev = '^';

export {
   cell,
   nested,
   prev,
   children,
   parent,
   unique,
   getUniqueChecker,
   passive,
    $start$,
    $end$,
    $state$,
    $globalState$,
    $props$,
    $name$,
    $async$,
    $nested$,
    $changedCellName$
}