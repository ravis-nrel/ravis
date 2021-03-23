// forecast-list 

export const mapStateToProps = (state, ownProps) => {
  return {
    activeDataset: state.data.activeDataset,
    selectedRegionForecasts: state.analysis.selectedRegionForecasts,
    selectedSiteForecasts: state.analysis.selectedSiteForecasts,
    sitesLoaded: state.data.sitesLoaded,
    sitesLoading: state.data.sitesLoading,
    sitesLoadingError: state.data.sitesLoadingError,
    forecastLoaded: state.data.forecastLoaded,
    forecastLoading: state.data.forecastLoading,
    forecastLoadingError: state.data.forecastLoadingError,
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {}
}
