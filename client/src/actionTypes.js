// actionTypes.js

// redux actions each use a static type key.
// http://redux.js.org/docs/basics/Actions.html

// data request related actions
export const SET_ACTIVE_DATASET = 'SET_ACTIVE_DATASET';
export const FETCH_FORECAST_FAIL = 'FETCH_FORECAST_FAIL';
export const FETCH_FORECAST_REQUEST = 'FETCH_FORECAST_REQUEST';
export const FETCH_FORECAST_SUCCESS = 'FETCH_FORECAST_SUCCESS';
export const FETCH_SITES = 'FETCH_SITES';

// analysis actions
export const SET_GLOBAL_RAMP_THRESHOLD = 'SET_GLOBAL_RAMP_THRESHOLD';
export const SELECT_FEATURE = 'SELECT_FEATURE';
export const SELECT_TIME = 'SELECT_TIME';
export const SELECT_REGION = 'SELECT_REGION';
export const SELECT_SITE_FORECAST = 'SELECT_SITE_FORECAST';
export const DESELECT_REGION = 'DESELECT_REGION';
export const DESELECT_SITE_FORECAST = 'DESELECT_SITE_FORECAST';
export const SELECT_REGION_FORECAST = 'SELECT_REGION_FORECAST';
export const DESELECT_REGION_FORECAST = 'DESELECT_REGION_FORECAST';
export const DESELECT_ALL = 'DESELECT_ALL';
export const ADD_NEW_REGION_TIME = 'ADD_NEW_REGION_TIME';
