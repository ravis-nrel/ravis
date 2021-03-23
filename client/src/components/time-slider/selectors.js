import { selectTimestamp, selectSiteForecast, selectRegionForecast, selectRegion } from '../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    selectedTimestamp: state.analysis.selectedTimestamp,
    forecastLoaded: state.data.forecastLoaded,
    forecastTimestamp: state.data.forecastTimestamp,
    activeDataset: state.data.activeDataset
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    onSelectTimestamp: (timestamp) => {
      dispatch(selectTimestamp(timestamp));
    },
    onSelectSiteForecast: (siteId) => {
      dispatch(selectSiteForecast(siteId));
    },
    onSelectRegion: (regionId) => {
      dispatch(selectRegionForecast(regionId));
      dispatch(selectRegion(regionId));
    }
  }
}
