import React from 'react';
import MapView from '../Map-View';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import '../../../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '../../../../node_modules/mapbox-gl/dist/mapbox-gl.js';
import './Map-regional-view.scss';
import '../map-popup.scss';
import RegionService from '../../../data/RegionService';
import CONFIG from '../../../data/Config';
import SolarSiteDotStyle from '../solar-site-dot-style';
import SolarSiteHaloStyle from '../solar-site-halo-style';
import SolarSiteUpStyle from '../solar-site-up-style';
import SolarSiteDownStyle from '../solar-site-down-style';
import triangleImage from '../../../images/triangle.png';

export class Map extends MapView {

  constructor(props) {
    super(props);
    this.applySelectedFeature = this.applySelectedFeature.bind(this);
    this.whenFeatureClicked = this.whenFeatureClicked.bind(this);
    this.whenFeatureMouseOver = this.whenFeatureMouseOver.bind(this);
    this.whenFeatureMouseOut = this.whenFeatureMouseOut.bind(this);
    this.afterMapRender = this.afterMapRender.bind(this);
    this.mapId = 'map-regional-view-pane';
  }

  componentWillUnmount() {
    if(this.map) {
      this.map.remove();
    }
  }

  addCoordDebug(map) {
    map.on('moveend', ()=>{
      console.log("Map movend");
      console.log(JSON.stringify(map.getBounds().toArray()));
    });

    map.on('mousemove', function (e) {
      document.getElementById('title').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) + ' ' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat);
    });
  }

  afterMapRender() {
    this.map.setMaxBounds(CONFIG.maxExtent);
    this.map.fitBounds(CONFIG.defaultExtent);

    this.setState({
      mapRendered: true
    });
  }

  refreshMap() {
    let {sourceName, regionalData} = this.getLayerFields();
    regionalData.forEach(f=>{
      this.map.setFeatureState({
        id: f.fid,
        source: sourceName
      }, {
        hasAlert: f.hasAlert,
        alertScale: f.alertScale,
        rampDirection: f.rampDirection
      });
    });
  }

  applySelectedFeature(feature) {
    // TODO something when a feature is selected
  }

  componentDidMount(){
    this.setState({
      mapRendered: false
    });
  }

  // This is a way of observing state changes that is useful
  // for integrating with 3rd party libraries. Since data binding
  // between React and say Mapbox-GL isn't possible, the approach is
  // to intercept React component lifecycle events and manually
  // attach any 3rd party lib binding therein. React wrappers
  // do the same thing under the covers but tend to introduce
  // uneccesary comlexity without necessarily doing what we need
  // e.g. https://www.npmjs.com/package/react-mapbox-gl
  componentDidUpdate(prevProps) {
    if(this.state.mapRendered) {
      if(prevProps.selectedTimestamp !== this.props.selectedTimestamp) {
        this.refreshMap();
      }
      if(prevProps.forecastTimestamp !== this.props.forecastTimestamp) {
        this.refreshMap();
      }
    } else {
      if(this.props.sitesLoaded) {
        if(this.props.sitesLoadingError) {
          //alert("Sites data could not be loaded");
        }
        this.renderMap();
      }
    }
  }

  getLayerFields() {
    return {
      layerId: `regions-dot-${this.mapId}`,
      haloLayerId: `regions-halo-${this.mapId}`,
      upLayerId: `sites-up-${this.mapId}`,
      downLayerId: `sites-down-${this.mapId}`,
      sourceName: `regions-data-${this.mapId}`,
      regionalData: RegionService.getRegionDataByTimeStamp(null, this.props.selectedTimestamp)
    }
  }

  getUniqueFeatures(array, comparatorProperty) {
    var existingFeatureKeys = {};
    // Because features come from tiled vector data, feature geometries may be split
    // or duplicated across tile boundaries and, as a result, features may appear
    // multiple times in query results.
    var uniqueFeatures = array.filter(function(el) {
      if (existingFeatureKeys[el.properties[comparatorProperty]]) {
        return false;
      } else {
        existingFeatureKeys[el.properties[comparatorProperty]] = true;
        return true;
      }
    });

    return uniqueFeatures;
  }

  renderMap() {
    //Create map
    let map = new mapboxgl.Map({
      container: this.mapId,
      style: `https://api.maptiler.com/maps/positron/style.json?key=${CONFIG.mapTilerKey}`,
      hash: false
    });
    this.map = map;

    //this.addCoordDebug(map);

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function(){

      map.loadImage(triangleImage, function(error, image){

        if(error) {
          console.log(error);
          return;
        }

        map.addImage('triangle', image);

        let {layerId, haloLayerId, upLayerId, downLayerId, sourceName, regionalData} = this.getLayerFields();
        let geojsonData = RegionService.getGeoJsonForRegions();

        if(regionalData.length === 0) {
          //alert("Regions data could not be loaded.");
          return;
        }

        // Add regions
        map.addSource(sourceName, {
          type: "geojson",
          data: geojsonData
        });

        // Initialize feature state
        regionalData.forEach(f=>{
          map.setFeatureState({
            id: f.fid,
            source: sourceName
          },{
            hasAlert: f.hasAlert,
            alertScale: f.alertScale,
            rampDirection: f.rampDirection
          });
        });

        map.addLayer(SolarSiteDotStyle.getLayerDef(layerId, sourceName));
        map.addLayer(SolarSiteHaloStyle.getLayerDef(haloLayerId, sourceName));
        map.addLayer(SolarSiteUpStyle.getLayerDef(upLayerId, sourceName));
        map.addLayer(SolarSiteDownStyle.getLayerDef(downLayerId, sourceName));

        map.on('click', layerId, (e) => {
          this.whenFeatureClicked(e.features[0])
        });

        map.on('mouseover', layerId, (e) => {
          this.whenFeatureMouseOver(e, e.features[0])
        });

        map.on('mouseout', layerId, (e) => {
          this.whenFeatureMouseOut()
        });

        // create and invoke a method for determining when the map is
        // loaded (all layers rendered) and then do post init stuff
        const checkMap = (map)=>{
          if(!map.loaded()) {
            setTimeout(()=>{checkMap(map)}, 50)
          } else {
            this.afterMapRender();
          }
        }
        checkMap(map);
      }.bind(this));
    }.bind(this));
  }

  whenFeatureClicked(feature) {
    this.applySelectedFeature(feature, true);
    this.props.selectRegion(feature.id);
  }

  whenFeatureMouseOut(e) {
    try {
      this._clearPopup();
      this.map.getCanvas().style.cursor = '';
    } catch(error) {
      //noop
    }
  }

  whenFeatureMouseOver(e) {
    try {
      this.map.getCanvas().style.cursor = 'pointer';
      this._clearPopup();
      let region = RegionService.getRegionById(e.features[0].id).centroid;
      let popup = this._createPopoup(region, e.features[0]);
      this.setState({'popup': popup});
    } catch(error) {
      //noop
    }
  }

  render() {
    return (
      <div className="card map-regional-view">
        <div className="head american-captain">
          <div className='cutout'>
            <svg width="30" height="24">
              <path d="
                  M 0 0
                  L 18 15
                  H 30
                  V 0
                  z
                  "
                  fill="#071217" stroke="none" strokeWidth="1"></path>
            </svg>
          </div>
          <div id='title' className="title">Regional View</div>
        </div>
        <div className="content">
          <div id="map-regional-view-pane"></div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
