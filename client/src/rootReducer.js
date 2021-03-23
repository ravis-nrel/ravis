import { combineReducers } from 'redux';
import data from './dataReducers';
import analysis from './analysisReducers';

/**
  * Add or remove a single primitive value from an
  * array of primitives maintaining function purity
  */
export const addToArray = (arr, item) => {
  let nu = [];
  if (arr.indexOf(item) === -1) {
    nu.push(item);
  }
  nu.push(...arr);
  
  return nu;
}

export const removeFromArray = (arr, item) => {
  let nu = [];
  nu.push(...arr);
  const i = nu.indexOf(item);
  if(i !== -1) {
    nu.splice(i, 1);
  }
  return nu;
}

export default combineReducers({
  data,
  analysis
});
