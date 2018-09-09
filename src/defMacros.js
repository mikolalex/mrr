import { skip, shallow_equal } from './';

const isJustObject = a => (a instanceof Object) && !(a instanceof Array) && !(a instanceof Function);
const always = a => _ => a;
const isPromise = a => a instanceof Object && a.toString && a.toString().indexOf('Promise') !== -1;
const matches = (obj, subset) => {
    for(let k in subset){
        if(!shallow_equal(obj[k], subset[k])){
            return false;
        }
    }
    return true;
}

const collMacros = ([map]) => {
    const res = ['funnel', (cell, val) => val];
    for(let type in map){
        if(type !== 'custom'){
            res.push([(...args) => [type, ...args], map[type]]);
        }
    }
    return [([type, changes], prev) => {
        let next = [...prev];
        switch(type){
            case 'update':
                const [newProps, predicate] = changes;
                if(!(predicate instanceof Object)){
                    // it's index
                    prev.map((item, i) => [i, item])
                    .filter(pair => Number(pair[0]) === Number(predicate))
                    .forEach(i => {
                        next[i[0]] = Object.assign({}, next[i[0]], newProps);
                    });
                } else {
                    prev.map((item, i) => [i, item])
                    .filter(pair => matches(pair[1], predicate))
                    .forEach(i => {
                        next[i[0]] = Object.assign({}, next[i[0]], newProps);
                    });
                }
            break;
            case 'delete':
                next = next.filter((item, i) => {
                    if(changes instanceof Object){
                        return !matches(item, changes)
                    } else {
                        return Number(i) !== changes;
                    }
                });
            break;
            case 'create':
                if(changes instanceof Array){
                    changes.forEach(item => next.push(item))
                } else {
                    next.push(changes);
                }
            break;
        }
        return next;
    }, res, '^'];
}

const defMacros = {
    map: ([map]) => {
        var res = ['funnel', (cell, val) => {
            return map[cell] instanceof Function ? map[cell](val) : map[cell];
        }];
        for(let cell in map){
            res.push(cell);
        }
        return res;
    },
    coll: collMacros,
    list: collMacros,
    merge: ([map, ...others]) => {
        if(isJustObject(map)){
            var res = ['funnel', (cell, val) => [cell, val], ...Object.keys(map)];
            return [([cell, val], ...otherArgs) => {
                return map[cell] instanceof Function ? map[cell](val, ...otherArgs) : map[cell];
            }, res, ...others];
        } else {
            let f = a => a;
            let args = [map, ...others]
            if(map instanceof Function){
                f = map;
                args = others;
            }
            return ['funnel', (cell, val) => f(val), ...args];
        }
    },
    toggle: ([setTrue, setFalse]) => {
            return ['funnel', (a,b) => b, [always(true), setTrue], [always(false), setFalse]]
    },
    debounce: ([time, arg]) => {
        return ['async.closure', () => {
            let val, isTimeOut = false;
            return (cb, value) => {
                if(!isTimeOut){
                    isTimeOut = setTimeout(() => {
                        isTimeOut = false;
                        cb(val);
                    }, time);
                } else {
                    //console.log('throttled', value);
                }
                val = value;
            }
        }, arg]
    },
    promise: ([func, ...argCells]) => {
        if(!func instanceof Function){
            argCells = [func, ...argCells];
            func = a => a;
        }
        return ['nested.closure', () => {
            let latest_num;
            let c = 0;
            let load_count = 0;
            return (cb, ...args) => {
                ++load_count;
                cb('status', 'pending');
                const res = func.apply(null, args);
                if(!isPromise(res)){
                    // some error
                    return;
                } else {
                    latest_num = ++c;
                    res.then((function(i, data){
                        if(!(--load_count)){
                            cb('status', 'resolved');
                        }
                        if(i !== latest_num){
                            return;
                        } else {
                            cb('data', data);
                            cb('error', null);
                        }
                    }).bind(null, c)).catch((function(i, e){
                        if(!(--load_count)){
                            cb('status', 'error');
                        }
                        if(i !== latest_num){
                            return;
                        } else {
                            cb('data', null);
                            cb('error', e);
                        }
                    }).bind(null, c))
                }
            };
        }, ...argCells]
    },
    split: ([map, ...argCells]) => {
        return ['nested', (cb, ...args) => {
            for(let k in map){
                const res = map[k].apply(null, args);
                if((res !== undefined) && (res !== null) && (res !== false)){
                    cb(k, res);
                }
            }
        }, ...argCells];
    },
  transist: (cells) => {
    return [(a, b) => {
        return a ? b : skip;
    }, ...cells];
  },
  closureMerge: ([initVal, map]) => {
    const cells = Object.keys(map);
    return ['closure.funnel', () => {
        return (cell, val) => {
          if(map[cell] instanceof Function){
            return initVal = map[cell].call(null, initVal, val);
          } else {
            return initVal= map[cell];
          }
        }
    }, ...cells];
  },
  closureMap: ([initVal, map]) => {
    const cells = Object.keys(map);
    return ['closure.funnel', () => {
        return (cell, val) => {
          if(map[cell] instanceof Function){
            return initVal = map[cell].call(null, initVal, val);
          } else {
            return initVal= map[cell];
          }
        }
    }, ...cells];
  },
    mapPrev: ([map]) => {
        var res = ['closure.funnel', (prev) => {
            return (cell, val) => {
                prev = map[cell] instanceof Function ? map[cell](prev, val) : map[cell];
                return prev;
            }
        }];
        for(let cell in map){
            res.push(cell);
        }
        return res;
    },
    join: ([...fields]) => ['funnel', (cell, val) => val, ...fields],
    '&&': ([...cells]) => {
        return [function(){
            let res = true;
            for(let i in arguments){
                res = res && arguments[i];
                if(!res){
                    return res;
                }
            }
            return res;
        }, ...cells];
    },
    '||': ([...cells]) => {
        return [function(){
            let res = false;
            for(let i in arguments){
                res = res || arguments[i];
                if(res){
                    return res;
                }
            }
            return res;
        }, ...cells];
    },
    trigger: ([field, val]) => [a => a === val ? true : skip, field],
    skipSame: ([field]) => [(z, x) => shallow_equal(z, x) ? skip : z, field, '^'],
    skipIf: ([func, ...fields]) => {
      if(!fields.length) {
        fields = [func];
        func = a => a;
      }
      return [function(){
        const res = func.apply(null, arguments);
        return !res ? true : skip;
      }, ...fields]
    },
    when: ([func, ...fields]) => {
      if(!fields.length) {
        fields = [func];
        func = a => a;
      }
      return [function(){
        const res = func.apply(null, arguments);
        return !!res ? true : skip;
      }, ...fields]
    },
    turnsFromTo: ([from, to, cell]) => ['closure', () => {
        let prev_val;
        return (val) => {
            if((val === to) && (prev_val === from)){
                prev_val = val;
                return true;
            } else {
                prev_val = val;
                return skip;
            }
        }
    }, cell],
    skipN: ([field, n]) => ['closure', () => {
        let count = 0;
        n = n || 1;
        return (val) => {
            if(++count > n){
                return val;
            } else {
                return skip;
            }
        }
    }, field],
    accum: ([cell, time]) => {
        var res = time
        ? ['async.closure', () => {
            const vals = {};
            let c = 0;
            return (cb, val) => {
                vals[++c] = val;
                setTimeout(function(i){
                    delete vals[i];
                    cb(Object.values(vals));
                }.bind(null, c), time);
                cb(Object.values(vals));
            }
        }, cell]
        : ['closure', () => {
            const vals = [];
            return (val) => {
                vals.push(val);
                return vals;
            }
        }, cell];
        return res;
    }
}

export default defMacros;