import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import './Forecast-item.scss';
import RegionService from '../../data/RegionService';
import ForecastChart from './Forecast-chart';


class ForecastItem extends Component {

  constructor(props) {
    super(props);
    let forecastId = `${props.dataset}-item-${props.forecastId}`,
        locationObj;

    if(this.props.type === 'region') {
      locationObj = RegionService.getRegionById(this.props.forecastId);
    } else {
      locationObj = RegionService.getSiteById(this.props.forecastId);
    }

    this.state = {
      locationObj,
      forecastId,
      chartScale: 'maximumCapacity'
    }

    this.closeMe = this.closeMe.bind(this);
    this.handleChartScaleView = this.handleChartScaleView.bind(this);
  }

  closeMe() {
    if (this.props.type === 'region') {
      this.props.deselectRegionForecast(this.props.forecastId);
    } else {
      this.props.deselectSiteForecast(this.props.forecastId);
    }
  }

  handleChartScaleView() {
    if (this.state.chartScale === 'maximumCapacity'){
      this.setState({
        chartScale: 'forecast'
      })
    }
    else {
      this.setState({
        chartScale: 'maximumCapacity'
      })
    }
  }

  render() {
    let item,
        displayName,
        forecastType,
        scaleButton,
        charts;

    if (this.props.forecastLoaded) {

      switch (this.state.chartScale) {
        case'maximumCapacity':
          scaleButton =
            <button className="ui icon button" onClick={this.handleChartScaleView}>
              <i className="zoom in icon"></i>
            </button>
          break;
        case'forecast':
          scaleButton =
            <button className="ui icon button" onClick={this.handleChartScaleView}>
              <i className="zoom out icon"></i>
            </button>
          break;
        default:
          console.warn('Unsupported chart scale');
      }

      if (this.props.type === 'region') {
        item = RegionService.getRegionById(this.props.forecastId);
        displayName = item.name;
        forecastType = "- Regional Solar Power Forecast";
        charts = <ForecastChart key={this.props.key} forecastId={this.props.forecastId} type={this.props.type} chartScale={this.state.chartScale} selector={this.state.forecastId}/>
      } else {
        item = RegionService.getSiteById(this.props.forecastId);
        displayName = item.name;
        forecastType = "- Site Solar Power Forecast";

        charts = (
          <ForecastChart key={this.props.key} forecastId={this.props.forecastId} type={this.props.type} chartScale={this.state.chartScale} selector={this.state.forecastId} />
        );
      }
    }

    return (

      <div id={this.state.forecastId} className="card forecast-item">
        <div className="head american-captain">
          {scaleButton}
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
          <div className="title">{displayName}{forecastType}</div>
        </div>
        {charts}
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(ForecastItem);
