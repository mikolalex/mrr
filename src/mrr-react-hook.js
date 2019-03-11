import React, { Component, useState, useEffect } from 'react';
import Mrr from './mrr';

import cellMacros from './operators';
import { defDataTypes } from './dataTypes';

const useMrr = (props, mrrStructure, macros, dataTypes) => {
	const [mrrState, setMrrState] = useState({});
	const [mrrInstance, setMrrInstance] = useState();
	useEffect(() => {
		const availableMacros = Object.assign({}, cellMacros, macros);
		const availableDataTypes = Object.assign({}, defDataTypes, dataTypes);
        const mrrInstance = new Mrr(mrrStructure, props, { 
            setOuterState: (update, cb, flag, newState) => {
                setMrrState(Object.assign({}, newState));
            },
            macros: availableMacros, 
            dataTypes: availableDataTypes
        });
        setMrrInstance(mrrInstance);
		mrrInstance.reactWrapper = { props };
		mrrInstance.onMount();
		return () => {
			mrrInstance.onUnmount();
		}
	}, []);
	return [
		mrrState,
		(cell, val) => {
			if(mrrInstance) {
				return mrrInstance.toState(cell, val);
			} else {
				return () => {};
			}
		},
		(as, up, down) => {
			if(mrrInstance) {
				return { mrrConnect: mrrInstance.mrrConnect(as, up, down) };
			} else {
				return {};
			}
		}
	]
}

export default useMrr;
