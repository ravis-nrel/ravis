// map/selectors

import { deselectSiteForecast, deselectRegionForecast } from '../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    selectedTimestamp: state.analysis.selectedTimestamp,
    forecastLoaded: state.data.forecastLoaded,
    forecastLoading: state.data.forecastLoading,
    forecastLoadingError: state.data.forecastLoadingError,
    forecastTimestamp: state.data.forecastTimestamp
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    deselectSiteForecast: forecastId => dispatch(deselectSiteForecast(forecastId)),
    deselectRegionForecast: forecastId => dispatch(deselectRegionForecast(forecastId))
  }
}
