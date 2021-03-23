 // map/selectors

import { selectRegion, selectRegionForecast } from '../../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    selectedFeatureId: state.analysis.selectedFeature,
    selectedTimestamp: state.analysis.selectedTimestamp,
    timezoom: state.analysis.timezoom,
    sitesLoaded: state.data.sitesLoaded,
    sitesLoading: state.data.sitesLoading,
    sitesLoadingError: state.data.sitesLoadingError,
    forecastLoaded: state.data.forecastLoaded,
    forecastLoading: state.data.forecastLoading,
    forecastLoadingError: state.data.forecastLoadingError,
    forecastTimestamp: state.data.forecastTimestamp
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    selectRegion: (regionId) => {
      dispatch(selectRegion(regionId));
      dispatch(selectRegionForecast(regionId));
    }
  }
}
