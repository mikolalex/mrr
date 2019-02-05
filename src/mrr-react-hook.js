import React, { Component } from 'react';
import { useState, useEffect, useRef } from 'react';
import Mrr from './mrr';

import cellMacros from './operators';
import { defDataTypes } from './dataTypes';

const useMrr = (props, mrrStructure, macros, dataTypes) => {
	const [mrrState, setMrrState] = useState({});
  const mrrInstance = useRef();
	useEffect(() => {
		const availableMacros = Object.assign({}, cellMacros, macros);
		const availableDataTypes = Object.assign({}, defDataTypes, dataTypes);
		mrrInstance.current = new Mrr(mrrStructure, props, (update, cb, flag, newState) => {
				setMrrState(newState);
		}, availableMacros, availableDataTypes);
	  mrrInstance.current.reactWrapper = { props };
		mrrInstance.current.onMount();
		return () => {
			mrrInstance.current.onUnmount();
		}
	}, []);
	useEffect(() => {
		if(mrrInstance.current){
			mrrInstance.current.reactWrapper = { props };
		}
	})
	return [
		mrrState,
		(cell, val) => {
			if(mrrInstance.current) {
				return mrrInstance.current.toState(cell, val);
			} else {
				return () => {};
			}
		},
		(as, up, down) => {
			if(mrrInstance.current) {
				return { mrrConnect: mrrInstance.current.mrrConnect(as, up, down) };
			} else {
				return {};
			}
		}
	]
}

export default useMrr;
