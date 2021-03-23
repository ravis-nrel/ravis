// dataReducers.js

import * as t from './actionTypes';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Defaults
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const defaultValue = {
  // activeDataset: 'ibm',
  activeDataset: 'eclipse',
  sitesLoaded: false,
  forecastLoaded: false,
  forecastLoading: false,
  forecastLoadingError: null,
  forecastTimestamp: null
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// The reducers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default (state=defaultValue, action) => {
  switch(action.type) {
    case t.SET_ACTIVE_DATASET:
      return {
        ...state,
        activeDataset: action.dataset
      };
    case t.FETCH_FORECAST_FAIL:
      return {
        ...state,
        forecastLoading: false,
        forecastLoadingError: action.error
      };
    case t.FETCH_FORECAST_REQUEST:
      return {
        ...state,
        forecastLoaded: false,
        forecastLoading: true
      };
    case t.FETCH_FORECAST_SUCCESS:
      return {
        ...state,
        forecastLoading: false,
        forecastLoaded: true,
        forecastTimestamp: new Date().getTime()
      };
    case t.FETCH_SITES:
      return {
        ...state,
        sitesLoaded: true
      };
    default:
      return state;
  }
}
