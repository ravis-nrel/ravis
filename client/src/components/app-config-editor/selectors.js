import {
  setActiveDataset,
  setGlobalRampThreshold,
  fetchForecastRequest,
  updateAddNewRegionTimestamp
} from '../../actionCreators';

export const mapStateToProps = (state, ownProps) => {
  return {
    sitesLoaded: state.data.sitesLoaded,
    globalRampThreshold: state.analysis.globalRampThreshold,
    activeDataset: state.data.activeDataset
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalRampThreshold: (rampThreshold) => {
      dispatch(setGlobalRampThreshold(rampThreshold));
    },
    updateAddNewRegionTimestamp: () => dispatch(updateAddNewRegionTimestamp()),
    fetchForecastRequest: () => dispatch(fetchForecastRequest()),
    setActiveDataset: (activeDataset) => dispatch(setActiveDataset(activeDataset))
  }
}
