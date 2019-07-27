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
	var initialState = mrrStructure.$init instanceof Function ? mrrStructure.$init(props) : mrrStructure.$init;

	var _useState = (0, _react.useState)(initialState),
	    _useState2 = _slicedToArray(_useState, 2),
	    mrrState = _useState2[0],
	    setMrrState = _useState2[1];

	var _useState3 = (0, _react.useState)(),
	    _useState4 = _slicedToArray(_useState3, 2),
	    mrrInstance = _useState4[0],
	    setMrrInstance = _useState4[1];

	(0, _react.useEffect)(function () {
		var availableMacros = Object.assign({}, _operators2.default, macros);
		var availableDataTypes = Object.assign({}, _dataTypes.defDataTypes, dataTypes);
		var mrrInstance = new _mrr2.default(mrrStructure, props, {
			setOuterState: function setOuterState(update, cb, flag, newState) {
				setMrrState(Object.assign({}, newState));
			},
			macros: availableMacros,
			dataTypes: availableDataTypes
		});
		setMrrInstance(mrrInstance);
		mrrInstance.reactWrapper = { props: props };
		mrrInstance.onMount();
		return function () {
			mrrInstance.onUnmount();
		};
	}, []);
	return [mrrState, function (cell, val) {
		if (mrrInstance) {
			return mrrInstance.toState(cell, val);
		} else {
			return function () {};
		}
	}, function (as, up, down) {
		if (mrrInstance) {
			return { mrrConnect: mrrInstance.mrrConnect(as, up, down) };
		} else {
			return {};
		}
	}];
};

exports.default = useMrr;