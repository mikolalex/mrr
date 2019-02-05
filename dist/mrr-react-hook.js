'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mrr = require('./mrr');

var _mrr2 = _interopRequireDefault(_mrr);

var _operators = require('./operators');

var _operators2 = _interopRequireDefault(_operators);

var _dataTypes = require('./dataTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var useMrr = function useMrr(props, mrrStructure, macros, dataTypes) {
	var _useState = (0, _react.useState)({}),
	    _useState2 = _slicedToArray(_useState, 2),
	    mrrState = _useState2[0],
	    setMrrState = _useState2[1];

	var mrrInstance = (0, _react.useRef)();
	(0, _react.useEffect)(function () {
		var availableMacros = Object.assign({}, _operators2.default, macros);
		var availableDataTypes = Object.assign({}, _dataTypes.defDataTypes, dataTypes);
		mrrInstance.current = new _mrr2.default(mrrStructure, props, function (update, cb, flag, newState) {
			setMrrState(newState);
		}, availableMacros, availableDataTypes);
		mrrInstance.current.reactWrapper = { props: props };
		mrrInstance.current.onMount();
		return function () {
			mrrInstance.current.onUnmount();
		};
	}, []);
	(0, _react.useEffect)(function () {
		if (mrrInstance.current) {
			mrrInstance.current.reactWrapper = { props: props };
		}
	});
	return [mrrState, function (cell, val) {
		if (mrrInstance.current) {
			return mrrInstance.current.toState(cell, val);
		} else {
			return function () {};
		}
	}, function (as, up, down) {
		if (mrrInstance.current) {
			return { mrrConnect: mrrInstance.current.mrrConnect(as, up, down) };
		} else {
			return {};
		}
	}];
};

exports.default = useMrr;