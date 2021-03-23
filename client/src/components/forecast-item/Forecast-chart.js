import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import * as d3 from '../../../node_modules/d3/dist/d3.js';
import './Forecast-item.scss';
import ForecastService from '../../data/ForecastService';
import RegionService from '../../data/RegionService';
import SiteService from '../../data/SiteService';


class ForecastChart extends Component {

  constructor(props) {
    super(props);
    let locationObj;

    if (this.props.type === 'region') {
      locationObj = RegionService.getRegionById(this.props.forecastId);
    } else {
      locationObj = RegionService.getSiteById(this.props.forecastId);
    }

    this.state = {
      locationObj
    }
  }

  formatFloat(float) {
    return Math.round(float);
  }

  componentDidMount() {
    if (this.props.forecastLoaded && !this.chart) {
      this.renderChart();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.forecastLoaded && this.props.forecastLoaded) {
      this.renderChart();
    }

    if ((prevProps.selectedTimestamp !== this.props.selectedTimestamp)
      && this.props.forecastLoaded) {
      this.updateChart();
    }

    if (this.props.chartScale !== prevProps.chartScale) {
      this.redrawChart();
    }
  }

  componentWillUnmount() {
    //this.svg.remove();
  }

  getFormattedData(timestamp) {

    let rawForecastData,
      upperData,
      medianData,
      lowerData,
      maxCapacity,
      item,
      propsByTimestamp,
      rampThreshold,
      yDomain,
      upperDataValue,
      retVal;

    timestamp = timestamp || this.props.selectedTimestamp;
    retVal = null;

    try {
      if (this.props.type === 'region') {
        rawForecastData = ForecastService.getForecastForRegion(this.props.forecastId);
        item = this.state.locationObj;
        maxCapacity = item.capacity_mw;
        propsByTimestamp = RegionService.getRegionDataByTimeStamp(this.props.forecastId, timestamp)[0];
        rampThreshold = propsByTimestamp.rampThreshold;
      } else {
        rawForecastData = ForecastService.getForecastForSite(this.props.forecastId);
        item = this.state.locationObj;
        maxCapacity = item.capacity_mw;
        propsByTimestamp = SiteService.getSiteDataByTimeStamp(item, timestamp);
        rampThreshold = propsByTimestamp.rampThreshold;
      }

      medianData = rawForecastData.data.medianData;

      upperData = rawForecastData.data.upperData.map((v, i) => {
        v.values = [medianData[i].value, v.value];
        return v;
      });

      lowerData = rawForecastData.data.lowerData.map((v, i) => {
        v.values = [v.value, medianData[i].value];
        return v;
      });

      maxCapacity = Math.round(item.capacity_mw * 1.1);

      // conditionally render chart yScale based on prop.chartScale to better reflect forecast data
      if (this.props.chartScale === 'maximumCapacity') {
        yDomain = [0, maxCapacity + (maxCapacity * .10)];
      } else {
        upperDataValue = upperData.reduce((maxCap, forecast) => {
          return forecast.value > maxCap ? forecast.value : maxCap;
        }, 0);
        yDomain = [0, upperDataValue];
      };

      retVal = {
        propsByTimestamp,
        item,
        rawForecastData,
        upperData,
        medianData,
        lowerData,
        maxCapacity,
        rampThreshold,
        yDomain
      };

    } catch (err) {
      // This is a very coarse error handling to prevent whole-app
      // failure when data is missing or improperly formatted
      console.error(err);
    }

    return retVal;
  }

  renderChart() {
    const width = 600,
      height = 190,
      margin = {
        top: 0,
        right: 5,
        bottom: 20,
        left: 5
      };

    try {
      let { rawForecastData, upperData, medianData, lowerData, maxCapacity, yDomain } = this.getFormattedData(),
        alerts = rawForecastData.alerts,
        medianMax,
        medianMaxScaled,
        medianMin,
        medianMinScaled,
        medianMaxCapacity,
        medianMaxCapacityScaled,
        medianRange;

      let svg = d3.select(`#${this.props.selector} .chart-container`).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      let xScale = d3.scaleTime()
        .domain(d3.extent(medianData, d => d.timestamp))
        .range([0, width - margin.right])

      // yDomain is conditionally rendered based on props.chartScale in getFormattedData
      let yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([170, 0]);

      let line = d3.line()
        .x(function (d) { return xScale(d.timestamp); })
        .y(function (d) { return yScale(d.value); }) //subract 1/2 the stroke width

      let area = d3.area()
        .x(d => xScale(d.timestamp))
        .y0(d => yScale(d.values[0]))
        .y1(d => yScale(d.values[1]));

      let xAxis1 = d3.axisTop(xScale)
        .tickArguments([d3.timeMinute.every(15)])
        .tickFormat(d => null);

      let xAxis2 = d3.axisTop(xScale)
        .tickArguments([d3.timeMinute.every(60)])
        .tickSizeInner(12);

      let fifteenMinVals = medianData.map((d, i) => {
        let { propsByTimestamp } = this.getFormattedData(d.timestampUnProc);
        return {
          scaled: xScale(d.timestamp),
          ob: {
            mean: this.formatFloat(d.value),
            upper: this.formatFloat(upperData[i].value),
            lower: this.formatFloat(lowerData[i].value),
            props: propsByTimestamp
          }
        };
      });

      svg.append("path")
        .datum(upperData)
        .attr("class", "range-area")
        .attr("d", area);

      svg.append("path")
        .datum(lowerData)
        .attr("class", "range-area")
        .attr("d", area);

      svg.append("path")
        .datum(medianData)
        .attr("class", "median-line")
        .attr("d", line);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis1)

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis2)
        .selectAll("text")
        .attr('class', 'aviano')
        .style("text-anchor", function (d, i, nodes) {
          let retVal = 'middle';
          if (i === 0) { retVal = 'start'; }
          if (i === nodes.length - 1) { retVal = 'end'; }
          return retVal;
        })
        .attr("dy", "30px");


      // will need to make the medianRange work more intelligent re: text placement below or above the line
      medianMax = d3.max(medianData, d => d.value);
      medianMaxScaled = yScale(medianMax);
      medianMin = d3.min(medianData, d => d.value);
      medianMinScaled = yScale(medianMin);
      medianMaxCapacity = maxCapacity;
      medianMaxCapacityScaled = yScale(medianMaxCapacity);

      medianRange = svg.append('g')
        .attr('class', 'median-range')
        .attr("transform", "translate(0,0)")

      medianRange
        .append('line')
        .attr('x1', 0)
        .attr('y1', medianMaxScaled)
        .attr('x2', width - margin.right)
        .attr('y2', medianMaxScaled)

      medianRange
        .append('text')
        .attr('class', 'aviano')
        .attr('x', width / 2)
        .attr('y', medianMaxScaled - 4)
        .text(parseInt(medianMax, 10) + ' mw (forecast maximum)')

      medianRange
        .append('line')
        .attr('x1', 0)
        .attr('y1', medianMinScaled)
        .attr('x2', width - margin.right)
        .attr('y2', medianMinScaled)

      medianRange
        .append('text')
        .attr('class', 'aviano')
        .attr('x', width / 2)
        .attr('y', medianMinScaled - 4)
        .text(parseInt(medianMin, 10) + ' mw (forecast minimum)')

      medianRange
        .append('line')
        .attr('x1', 0)
        .attr('y1', medianMaxCapacityScaled + 1)
        .attr('x2', width - margin.right)
        .attr('y2', medianMaxCapacityScaled + 1)

      medianRange
        .append('text')
        .attr('class', 'aviano')
        .attr('x', width / 2)
        .attr('y', medianMaxCapacityScaled - 4)
        .text(parseInt(medianMaxCapacity, 10) + ' mw (total capacity)')


      svg.append('line')
        .attr('class', 'line')
        .attr('x1', d => {
          let date = new Date(this.props.selectedTimestamp)
          return xScale(date)
        })
        .attr('y1', '0')
        .attr('x2', d => {
          let date = new Date(this.props.selectedTimestamp)
          return xScale(date)
        })
        .attr('y2', height - 14)

      alerts.forEach(alert => {
        svg.append('line')
          .attr('class', 'alert-line')
          .attr('x1', d => {
            return xScale(new Date(alert.start))
          })
          .attr('y1', '0')
          .attr('x2', d => {
            return xScale(new Date(alert.start))
          })
          .attr('y2', height - 14)
      });

      d3.select(`#${this.props.selector}`)
        .on('mouseover', d => {
          this.positionYLineByMouse();
        })
        .on('mousemove', d => {
          this.positionYLineByMouse();
        })
        .on('mouseout', d => {
          this.positionYLineByTimestamp()
        })

      this.svg = svg;
      this.xScale = xScale;
      this.height = height;
      this.fifteenMinVals = fifteenMinVals;
    } catch (err) {
      console.log("Caught error rendering forecast item chart", err);
    }
  }


  positionYLineByTimestamp() {

    let median,
      upperBounds,
      lowerBounds,
      { propsByTimestamp,
        rawForecastData,
        rampThreshold } = this.getFormattedData();

    this.svg.selectAll('.line')
      .attr('x1', d => {
        let date = new Date(this.props.selectedTimestamp);
        // Not sure how we should _really_ handle these updates while keeping them in the REACT render cycle
        //console.log(propsByTimestamp);
        if (propsByTimestamp.hasAlert) {
          d3.select(`#${this.props.selector} .ev`).text(`Event: ${propsByTimestamp.alert.direction} ramp by ${Math.round(propsByTimestamp.alertScale * rampThreshold * 100) / 100} MW`)
        } else {
          d3.select(`#${this.props.selector} .ev`).text(`Event: None`)
        }
        if (rawForecastData.rawData.filter(d => (d.timestamp === this.props.selectedTimestamp)).length > 0) {
          median = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_mean' && d.timestamp === this.props.selectedTimestamp))[0].value);
          upperBounds = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_95_upper_ci' && d.timestamp === this.props.selectedTimestamp))[0].value);
          lowerBounds = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_95_lower_ci' && d.timestamp === this.props.selectedTimestamp))[0].value);
          d3.select(`#${this.props.selector} .ge`).text(`Mean: ${median} mw`)
          d3.select(`#${this.props.selector} .cd`).text(`Upper 95% Prob.: ${upperBounds} mw`)
          d3.select(`#${this.props.selector} .ti`).text(`Lower 5% Prob.: ${lowerBounds} mw`)
        } else {
          d3.select(`#${this.props.selector} .ge`).text('')
          d3.select(`#${this.props.selector} .cd`).text('')
          d3.select(`#${this.props.selector} .ti`).text('')
        }
        return this.xScale(date)
      })
      .attr('y1', '0')
      .attr('x2', d => {
        let date = new Date(this.props.selectedTimestamp)
        return this.xScale(date)
      })
      .attr('y2', this.height - 14)

  }

  positionYLineByMouse() {
    let _this = this;
    let { rampThreshold } = this.getFormattedData();

    this.svg.selectAll('.line')
      .attr('x1', function (d) {

        let xVal = _this.fifteenMinVals.reduce((acc, v) => {
          let cur = Math.abs(d3.mouse(this)[0] - v.scaled);
          if (cur < acc[0]) {
            return [cur, v.scaled, v.ob]
          } else {
            return acc
          }
        }, [999, 0, null]);
        // Not sure how we should _really_ handle these updates while keeping them in the REACT render cycle
        if (xVal[2].props.hasAlert) {
          d3.select(`#${_this.props.selector} .ev`).text(`Event: ${xVal[2].props.rampDirection} ramp by ${Math.round(xVal[2].props.alertScale * rampThreshold * 100) / 100} MW`)
        } else {
          d3.select(`#${_this.props.selector} .ev`).text(`Event: None`)
        }
        d3.select(`#${_this.props.selector} .ge`).text(`Mean: ${xVal[2].mean} mw`)
        d3.select(`#${_this.props.selector} .cd`).text(`Upper 95% Prob.: ${xVal[2].upper} mw`)
        d3.select(`#${_this.props.selector} .ti`).text(`Lower 5% Prob.: ${xVal[2].lower} mw`)
        return xVal[1];
      })
      .attr('y1', '0')
      .attr('x2', function (d) {
        let xVal = _this.fifteenMinVals.reduce((acc, v) => {
          let cur = Math.abs(d3.mouse(this)[0] - v.scaled);
          if (cur < acc[0]) {
            return [cur, v.scaled, v.ob]
          } else {
            return acc
          }
        }, [999, 0, null]);
        return xVal[1];
      })
      .attr('y2', this.height - 14)
  }

  updateChart() {
    try {
      this.positionYLineByTimestamp()
    } catch (err) {
      console.log("Caught error updating forecast item", err);
    }
  }

  redrawChart() {
    this.svg.remove()
    this.renderChart();
  }

  render() {

    let event,
      median,
      upperBounds,
      lowerBounds;

    if (this.props.forecastLoaded && this.props.selectedTimestamp) {
      let { rawForecastData, propsByTimestamp, rampThreshold } = this.getFormattedData();

      event = (propsByTimestamp.hasAlert)
        ? `${propsByTimestamp.alert.direction} ramp by ${Math.round(propsByTimestamp.alertScale * rampThreshold * 100) / 100} MW`
        : 'None';
      // Need to clean up these and perhaps move to the services
      if (rawForecastData.rawData.filter(d => (d.timestamp === this.props.selectedTimestamp)).length > 0) {
        median = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_mean' && d.timestamp === this.props.selectedTimestamp))[0].value);
        upperBounds = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_95_upper_ci' && d.timestamp === this.props.selectedTimestamp))[0].value);
        lowerBounds = this.formatFloat(rawForecastData.rawData.filter(d => (d.layerName === 'sp_95_lower_ci' && d.timestamp === this.props.selectedTimestamp))[0].value);
      } else {
        median = 'n/a';
        upperBounds = 'n/a';
        lowerBounds = 'n/a';
      }
    }

    return (

      <div className="content">
        <div className="content-head">
          <span className="ev ">Event: {event}</span>
          {this.props.selectedTimestamp ?
            <>
              <span className="ge ">Mean: {median} mw</span>
              <span className="cd ">Upper 95% Prob.: {upperBounds} mw</span>
              <span className="ti ">Lower 5% Prob.: {lowerBounds} mw</span>
            </>
            : null}
        </div>
        <div className="chart-container"></div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForecastChart);