// map/selectors

import { deselectRegion, selectSiteForecast } from '../../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    activeDataset: state.data.activeDataset,
    selectedFeatureId: state.analysis.selectedFeature,
    selectedTimestamp: state.analysis.selectedTimestamp,
    forecastLoaded: state.data.forecastLoaded,
    forecastLoading: state.data.forecastLoading,
    forecastLoadingError: state.data.forecastLoadingError,
    forecastTimestamp: state.data.forecastTimestamp
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    selectSiteForecast: siteId => dispatch(selectSiteForecast(siteId)),
    deselectRegion: regionId => dispatch(deselectRegion(regionId))
  }
}
