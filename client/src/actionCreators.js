// actionCreators.js

// redux action creators
// http://redux.js.org/docs/basics/Actions.html

import * as t from './actionTypes';
import ForecastService from './data/ForecastService';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// POJO action creators
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const fetchForecastFail = (error) => ({
  type: t.FETCH_FORECAST_FAIL,
  error: error
});

export const fetchForecastRequest = () => ({
  type: t.FETCH_FORECAST_REQUEST
});

export const fetchForecastSuccess = () => ({
  type: t.FETCH_FORECAST_SUCCESS
});

export const fetchSites = () => ({
  type: t.FETCH_SITES
});

export const setActiveDataset = (dataset) => ({
  type: t.SET_ACTIVE_DATASET,
  dataset
})

export const setGlobalRampThreshold = (rampThreshold) => ({
  type: t.SET_GLOBAL_RAMP_THRESHOLD,
  rampThreshold
});

export const selectFeature = (featureId) => ({
  type: t.SELECT_FEATURE,
  featureId: featureId
});

export const selectTimestamp = (timestamp) => ({
  type: t.SELECT_TIME,
  timestamp: timestamp
});

export const selectRegion = (regionId) => ({
  type: t.SELECT_REGION,
  regionId: regionId
});

export const selectRegionForecast = (regionId) => ({
  type: t.SELECT_REGION_FORECAST,
  regionId: regionId
});

export const selectSiteForecast = (siteId) => ({
  type: t.SELECT_SITE_FORECAST,
  siteId: siteId
});

export const deselectRegion = (regionId) => ({
  type: t.DESELECT_REGION,
  regionId: regionId
});

export const deselectRegionForecast = (regionId) => ({
  type: t.DESELECT_REGION_FORECAST,
  deselectedRegionId: regionId
});

export const deselectSiteForecast = (siteId) => ({
  type: t.DESELECT_SITE_FORECAST,
  deselectedSiteId: siteId
});

export const deselectAll = () => ({
  type: t.DESELECT_ALL
});

export const updateAddNewRegionTimestamp = () => ({
  type: t.ADD_NEW_REGION_TIME
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// thunk action creators for async actions a la
// http://redux.js.org/docs/advanced/AsyncActions.html#async-action-creators
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const fetchForecast = (sites, dataset) => {
  return function(dispatch) {
    // notify the app that data is loading
    dispatch(fetchForecastRequest());

    return Promise.resolve()
      .then(() => {
        return ForecastService.fetchBatchForecast(sites, dataset);
      })
      .then((/*forecast*/) => {
        dispatch(fetchForecastSuccess());
      })
      .catch((error) => {
        dispatch(fetchForecastFail(error))
      });
  }
}
