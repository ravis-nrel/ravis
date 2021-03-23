import React from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import './Map-place-view.scss';
import '../../../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '../../../../node_modules/mapbox-gl/dist/mapbox-gl.js';
import RegionService from '../../../data/RegionService';
import CONFIG from '../../../data/Config';
import SolarSiteDotStyle from '../solar-site-dot-style';
import SolarSiteHaloStyle from '../solar-site-halo-style';
import SolarSiteUpStyle from '../solar-site-up-style';
import SolarSiteDownStyle from '../solar-site-down-style';
import triangleImage from '../../../images/triangle.png';
import MapView from '../Map-View';


class MapPlaceView extends MapView {

  constructor(props) {
    super(props);
    this.mapId = `map-place-view-${props.regionId}`;
    this.afterMapRender = this.afterMapRender.bind(this);
    this.closeMe = this.closeMe.bind(this);
  }

  addCoordDebug(map) {
    map.on('moveend', () => {
      console.log("Map movend");
      console.log(JSON.stringify(map.getBounds().toArray()));
    });

    map.on('mousemove', function (e) {
      // e.lngLat is the longitude, latitude geographical position of the event
      console.log(e.lngLat);
    });
  }

  afterMapRender() {
    this.map.setMaxBounds(RegionService.getRegionById(this.props.regionId).maxExtent);
    this.map.fitBounds(RegionService.getRegionById(this.props.regionId).defaultExtent);
    this.setState({
      mapRendered: true
    });
  }

  applySelectedFeature(feature, forcePopup) {
    // TODO something when a feature is selected
  }

  componentDidMount() {
    this.setState({
      mapRendered: false
    });
    this.renderMap();
  }

  componentDidUpdate(prevProps) {
    if (this.props.forecastLoading) {
      return;
    }

    if (this.state.mapRendered) {
      if (prevProps.selectedTimestamp !== this.props.selectedTimestamp) {
        this.refreshMap();
      }
      if (prevProps.forecastTimestamp !== this.props.forecastTimestamp) {
        this.refreshMap();
      }
    }

    // Only force this rerender if the map container should take up the whole space or less than it
    // If you add a third or fourth map for example, we should not rerender the other two maps
    // But if you go from 1 to 2 maps, the first one needs to resize itself (rerender)
    if ((prevProps.mapsNum === 1 && this.props.mapsNum > 1)
      || (prevProps.mapsNum > 1 && this.props.mapsNum === 1)) {
      this.renderMap();
    }
  }

  componentWillUnmount() {
    this.map.remove();
  }

  closeMe() {
    this.props.deselectRegion(this.props.regionId);
  }

  getLayerFields() {
    return {
      layerId: `sites-dot-${this.props.regionId}`,
      haloLayerId: `sites-halo-${this.props.regionId}`,
      upLayerId: `sites-up-${this.props.regionId}`,
      downLayerId: `sites-down-${this.props.regionId}`,
      sourceName: `sites-data-${this.props.regionId}`,
      siteData: RegionService.getSitesDataForRegionByTimeStamp(this.props.regionId, this.props.selectedTimestamp),
      nodeLayerId: `nodes-dot-${this.props.regionId}`,
      nodeSourceName: `nodes-data-${this.props.regionId}`,
      loadLayerId: `load-between-${this.mapId}`,
      loadSourceName: `load-lines-${this.mapId}`
    }
  }

  refreshMap() {
    let { sourceName, siteData } = this.getLayerFields();

    siteData.forEach(f => {
      //console.log(JSON.stringify(f, null, 2));
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

  renderMap() {
    let map = new mapboxgl.Map({
      container: this.mapId,
      style: `https://api.maptiler.com/maps/positron/style.json?key=${CONFIG.mapTilerKey}`,
      hash: false
    });
    this.map = map;

    // Add zoom and rotation controls to the map.
    // map.addControl(new mapboxgl.NavigationControl());

    // For identifying extents and centroids
    // this.addCoordDebug(map);

    map.on('load', function () {
      map.loadImage(triangleImage, function (error, image) {

        if (error) {
          console.log(error);
          return;
        }

        map.addImage('triangle', image);

        let {
          layerId,
          haloLayerId,
          upLayerId,
          downLayerId,
          sourceName,
          siteData,
          nodeLayerId } = this.getLayerFields();

        let geojsonData = RegionService.getSitesGeoJsonForRegion(this.props.regionId);

        if (siteData.length === 0) {
          //alert("Site data could not be loaded.");
          return;
        }

        // Add sites
        map.addSource(sourceName, {
          type: "geojson",
          data: geojsonData
        });

        // Initialize mapbox feature state
        siteData.forEach(f => {
          map.setFeatureState({
            id: f.fid,
            source: sourceName
          }, {
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
          this.whenFeatureMouseOver(e)
        });

        map.on('mouseout', layerId, (e) => {
          this.whenFeatureMouseOut()
        });

        map.on('mouseover', nodeLayerId, (e) => {
          this.whenNodeMouseOver(e)
        });

        map.on('mouseout', nodeLayerId, (e) => {
          this.whenFeatureMouseOut()
        });

        // create and invoke a method for determining when the map is
        // loaded (all layers rendered) and then do post init stuff
        const checkMap = (map) => {
          if (!map.loaded()) {
            setTimeout(() => { checkMap(map) }, 50)
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
    this.props.selectSiteForecast(feature.properties.fid);
  }

  whenNodeMouseOver(e) {
    try {
      this.map.getCanvas().style.cursor = 'pointer';
      this._clearPopup();
      let popup = this._createNodePopoup(e.lngLat, e.features[0]);
      this.setState({ 'popup': popup });
    } catch (error) {
      console.log("Error while mousing over", error);
      //noop
    }
  }

  whenFeatureMouseOut(e) {
    try {
      this._clearPopup();
      this.map.getCanvas().style.cursor = '';
    } catch (error) {
      //noop
    }
  }

  whenFeatureMouseOver(e) {
    try {
      this.map.getCanvas().style.cursor = 'pointer';
      this._clearPopup();
      let site = RegionService.getSiteById(e.features[0].properties.fid);
      let popup = this._createPopoup([site.longitude, site.latitude], e.features[0]);
      this.setState({ 'popup': popup });
    } catch (error) {
      console.log("Error while mousing over", error);
      //noop
    }
  }

  render() {
    let region = RegionService.getRegionById(this.props.regionId);
    let isHalfCard = this.props.mapsNum === 1 ? '' : 'half-card';

    if (!region) {
      region = {
        name: 'unknown'
      }
    }
    return (
      <div className={`card map-place-view ${isHalfCard}`}>
        <div className="head american-captain">
          <div className='cutout' onClick={this.closeMe}>
            <svg width="30" height="29">
              <path d="
                  M 0 0
                  L 18 15
                  H 30
                  V 0
                  z
                  "
                fill="#071217" stroke="none" strokeWidth="1"></path>
              <path d="
                  M 19 18
                  L 28 26
                  M 28 18
                  L 19 26
                  "
                fill="none" stroke="#000000" strokeWidth="1.2"></path>
            </svg>
          </div>
          <div className="title">{region.name}</div>
        </div>
        <div className="content">
          <div id={this.mapId} className="map-place-view-pane"></div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapPlaceView);
