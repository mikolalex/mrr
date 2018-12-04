const joinAsObject = (target_struct, parent, child, key) => {
    if(parent && child && parent[key] && child[key]) {
        target_struct[key] = Object.assign({}, parent[key], child[key]);
    }
}
const joinAsArray = (target_struct, parent, child, key) => {
    if(parent && child && parent[key] && child[key]) {
        target_struct[key] = [...parent[key], ...child[key]];
    }
}

const objMap = (obj, func) => {
    const res = {};
    for(let i in obj){
        const [val, key] = func(obj[i], i);
        res[key] = val;
    }
    return res;
}

const overwritePlaceholder = new function Placeholder(){};

const gridMacros = {
  merge: (child_struct = {}, parent_struct = {}) => {
    const struct = Object.assign({}, parent_struct, child_struct);
    joinAsObject(struct, parent_struct, child_struct, '$init');
    joinAsArray(struct, parent_struct, child_struct, '$readFromDOM');
    joinAsArray(struct, parent_struct, child_struct, '$writeToDOM');
    joinAsArray(struct, parent_struct, child_struct, '$expose');
    for(let k in struct){
        if(k[0] === '+'){
            const real_k = k.substr(1);
            if(!struct[real_k]){
                if(struct['=' + real_k]){
                    struct['=' + real_k] = ['join', struct[k], struct['=' + real_k]];
                } else {
                    struct[real_k] = struct[k];
                }
            } else {
                struct[real_k] = ['join', struct[k], struct[real_k]];
            }
            delete struct[k];
        }
        if(k[0] === '*'){
            const real_k = k.substr(1);
            if(!struct[real_k]){
              //struct[real_k] = struct[k];
            } else {
              const newMrrRow = struct[k].map((val) => {
                if(val === overwritePlaceholder){
                  return struct[real_k];
                }
                return val;
              })
              struct[real_k] = newMrrRow;
              //console.log('NEW STRUCT', newMrrRow);
            }
            delete struct[k];
        }
    }
    return struct;
  },
  persist: (grid, config) => {},
  skipEqual: (grid, config) => {
    const res = {};
    for(let cell in config){
      res['*' + cell] = ['skipSame', overwritePlaceholder]
    }
    return gridMacros.merge(res, grid);
  },
  
}

const merge = gridMacros.merge;
const persist = gridMacros.persist;
const skipEqual = gridMacros.skipEqual;

export {
  merge,
  persist,
  skipEqual,
  overwritePlaceholder,
}

export default gridMacros;