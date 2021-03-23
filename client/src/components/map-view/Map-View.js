import { Component } from 'react';
import mapboxgl from '../../../node_modules/mapbox-gl/dist/mapbox-gl.js';
import { numberWithCommas } from '../../data/Utils';
import './map-popup.scss';

export default class MapView extends Component {
  _clearPopup() {
    if (this.state.popup) {
      this.state.popup.remove();
    }
  }

  _createPopoup(lngLat, feature) {

    let name = feature.properties.name,
        capacity = numberWithCommas(feature.properties.capacity_mw),
        ramp = feature.state.hasAlert ?
        feature.state.rampDirection + ' by ' + Math.round(feature.state.alertScale * feature.properties.rampThreshold * 100)/100 + ' MW'
        : 'nominal'

    let popup = new mapboxgl.Popup({
      closeOnClick: true,
      closeButton: false,
      className: 'ravis-popup'
    })
      .setLngLat(lngLat)
      .setHTML(`
        <header>${name}</header>
        <section>
          ${capacity} MW total capacity <br />
          Ramping ${ramp}
        </section>
      `)
      .addTo(this.map);

    return popup;
  }

  _createNodePopoup(lngLat, feature) {

    let name = `Node ${feature.id}`,
        price = feature.properties.price,
        unserved = feature.properties.unservedEnergy,
        downFlex = feature.properties.downwardFlexibility,
        upFlex = feature.properties.upwardFlexibility;

    let popup = new mapboxgl.Popup({
      closeOnClick: true,
      closeButton: false,
      className: 'ravis-popup'
    })
      .setLngLat(lngLat)
      .setHTML(`
        <header>${name}</header>
        <section>
          $${price} current price<br />
          ${unserved} mw unserved energy<br />
          ${downFlex} mw downward flex.<br />
          ${upFlex} mw upward flex.
        </section>
      `)
      .addTo(this.map);

    return popup;
  }
}
