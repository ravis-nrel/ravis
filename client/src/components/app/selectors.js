// app

import { deselectAll, selectSiteForecast, selectRegion, selectRegionForecast, fetchSites, fetchForecast } from '../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    addNewRegionTimestamp: state.analysis.addNewRegionTimestamp,
    activeDataset: state.data.activeDataset,
    forecastLoading: state.data.forecastLoading,
    forecastLoaded: state.data.forecastLoaded,
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    deselectAll: () => {
      dispatch(deselectAll());
    },
    fetchForecasts: (sites, activeDataset) => {
      dispatch(fetchForecast(sites, activeDataset));
    },
    fetchSites: (activeDataset) => {
      dispatch(fetchSites(activeDataset));
    },
    selectRegion: (rid) => {
      dispatch(selectRegion(rid));
    },
    selectSiteForecast: (sid) => {
      dispatch(selectSiteForecast(sid));
    },
    selectRegionForecast: (rid) => {
      dispatch(selectRegionForecast(rid));
    },
  }
}
