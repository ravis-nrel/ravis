// geolocation 

export const mapStateToProps = (state, ownProps) => {
  return {
    selectedRegions: state.analysis.selectedRegions
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {}
}
