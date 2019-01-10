const cell = a => {
    if(a[0] === '-' || a[0] === '$'){
        throw new Error('Cellname cannot start with ' + a[0] + ": " + a);
    }
    if(a.indexOf('/') !== -1){
        throw new Error('Cellname cannot contain "/": ' + a);
    }
    if(a[a.length - 1] === '$'){
        throw new Error('Cellname cannot end with "$": ' + a);
    }
    return a;
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

const getUniqueChecker = unique.bind(null, a => a);

export {
   cell,
   children,
   parent,
   unique,
   getUniqueChecker,
   passive
}