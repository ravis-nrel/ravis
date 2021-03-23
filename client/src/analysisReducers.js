// analysisReducers.js

import * as t from './actionTypes';
import {addToArray, removeFromArray} from './rootReducer';
import { rampThreshold } from './data/Config';
import RegionService from './data/RegionService';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Defaults
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const defaultValue = {
  globalRampThreshold: rampThreshold,
  selectedFeature: null,
  selectedTimestamp: null,
  addNewRegionTimestamp: null,
  selectedRegions: [],
  selectedRegionForecasts: [],
  selectedSiteForecasts: []
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// The reducers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default (state=defaultValue, action) => {
  switch(action.type) {
    case t.SELECT_FEATURE:
      return {
        ...state,
        selectedFeature: action.featureId
      };
    case t.SELECT_TIME:
      return {
        ...state,
        selectedTimestamp: action.timestamp
      };
    case t.SELECT_REGION:
      return {
        ...state,
        selectedRegions: addToArray(state.selectedRegions, action.regionId)
      }
    case t.SELECT_REGION_FORECAST:
      return {
        ...state,
        selectedRegionForecasts: addToArray(state.selectedRegionForecasts, action.regionId)
      }
    case t.SELECT_SITE_FORECAST:
      return {
        ...state,
        selectedSiteForecasts: addToArray(state.selectedSiteForecasts, action.siteId)
      }
    case t.DESELECT_REGION:
      return {
        ...state,
        selectedRegions: removeFromArray(state.selectedRegions, action.regionId)
      }
    case t.DESELECT_REGION_FORECAST:
      return {
        ...state,
        selectedRegionForecasts: removeFromArray(state.selectedRegionForecasts, action.deselectedRegionId)
      }
    case t.DESELECT_SITE_FORECAST:
      return {
        ...state,
        selectedSiteForecasts: removeFromArray(state.selectedSiteForecasts, action.deselectedSiteId)
      }
    case t.DESELECT_ALL:
      return {
        ...state,
        selectedSiteForecasts: [],
        selectedRegionForecasts: [],
        selectedRegions: [],
        selectedTimestamp: null
      }
    case t.SET_GLOBAL_RAMP_THRESHOLD:
      RegionService.setGlobalRampThreshold(action.rampThreshold);
      return {
        ...state,
        globalRampThreshold: action.rampThreshold
      }
    case t.ADD_NEW_REGION_TIME:
      RegionService.updateAddNewRegionTimestamp();
      return {
        ...state,
        addNewRegionTimestamp: RegionService.getAddNewRegionTimestamp()
      }
    default:
      return state;
  }
}
