'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.skip = exports.withMrr = undefined;

var _ = require('../');

//const withMrr = function(mrrStructure, render = null, parentClass = null, config = {}){
//    config.filterDuplicateValuesInCells = true;
//    return defaultWithMrr(mrrStructure, render, parentClass, config);
//}

exports.withMrr = _.withMrr;
exports.skip = _.skip;