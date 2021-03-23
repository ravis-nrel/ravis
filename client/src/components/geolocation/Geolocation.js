import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import './Geolocation.scss';
import MapRegionalView from '../map-view/map-regional-view/Map-regional-view';
import MapPlaceView from '../map-view/map-place-view/Map-place-view';

class Geolocation extends Component {

  render() {
    let places = this.props.selectedRegions,
      placeList = places.map((p, i) => {
        return <MapPlaceView
          key={p}
          regionId={p}
          mapsNum={places.length}
        />;
      });

    return (
      <div className="section geolocation">
        <div className="head">
          <svg width="545" height="22">
            <path d="
                M 0 22
                H 285
                L 310 0
                H 520
                L 545 22
                "
              fill="none" stroke="#50B5EC" strokeWidth="1"></path>
          </svg>
          <h3 className="aviano">Geolocation</h3>
        </div>

        <div className="scroller">
          {placeList}

          <MapRegionalView></MapRegionalView>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Geolocation);
