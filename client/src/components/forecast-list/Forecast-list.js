import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import './Forecast-list.scss';
import ForecastItem from '../forecast-item/Forecast-item';

class ForecastList extends Component {

  getForecastItems(forecasts) {
    let forecastItems;

    forecastItems = forecasts.map( (p,i) => {
      return (<ForecastItem key={`rg${p}`} forecastId={p} type='region' dataset='generation'></ForecastItem>)
    });

    return forecastItems;
  }

  render() {

    let regionForecasts = this.props.selectedRegionForecasts,
        regionForecastList = this.getForecastItems(regionForecasts),
        siteForecasts = this.props.selectedSiteForecasts,
        siteForecastList = siteForecasts.map( (p,i) => {
          return <ForecastItem key={`s${p}`} forecastId={p} type='site'></ForecastItem>;
        });

    return (
      <div className="section forecast">
        <div className="head">
          <svg width="643" height="22">
            <path d="
                M 0 22
                H 430
                L 455 0
                H 618
                L 643 22
                "
                fill="none" stroke="#50B5EC" strokeWidth="1"></path>
          </svg>
          <h3 className="aviano">Forecast</h3>
        </div>

        <div className="scroller">
          {regionForecastList}
          {siteForecastList}
        </div>

      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(ForecastList);
