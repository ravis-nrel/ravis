import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './selectors';
import * as d3 from '../../../node_modules/d3/dist/d3.js';
import './Time-slider.scss';
import ForecastService from '../../data/ForecastService';
import RegionService from '../../data/RegionService';

const CHART_CONSTS = {
  width: 1070,
  height: 225,
  margin: {
    top: 0,
    right: 10,
    bottom: 15,
    left: 98
  }
}

class TimeSlider extends Component {

  constructor(props) {
    super(props);
    this.onLocationClick = this.onLocationClick.bind(this);
  }

  componentDidMount() {
    const {
      forecastLoaded,
      onSelectTimestamp
    } = this.props;

    if (forecastLoaded) {
      let timestamp = this.getTimestamp();
      this.renderSlider(timestamp);
      onSelectTimestamp(timestamp);
    }
  }

  componentDidUpdate(prevProps) {
    try {
      let selectedTimestamp = this.props.selectedTimestamp;

      if (!prevProps.forecastLoaded && this.props.forecastLoaded) {
        // Set default timestamp
        let defaultSelectedTS = this.getMostRecentForecastTimestamp();
        this.props.onSelectTimestamp(defaultSelectedTS);

        this.renderSlider(defaultSelectedTS);
      }

      if (!selectedTimestamp) {
        selectedTimestamp = this.getMostRecentForecastTimestamp();
        this.props.onSelectTimestamp(selectedTimestamp);
        this.renderSlider(selectedTimestamp)
      }

      if ((prevProps.selectedTimestamp !== this.props.selectedTimestamp) && this.props.forecastLoaded) {
        this.slideToTimestamp(this.props.selectedTimestamp);
      }
    } catch (err) {
      // this is a very coarse handling of
      // 'stuff that shouldn't happen, but at
      // least this way won't break the app'
    }
  }

  getFormattedData() {
    let regions = RegionService.getRegions();
    let timeControllerData = ForecastService.getForecastForRegion(regions[0].id).data.medianData;

    let regionsData = [];
    regions.forEach(region => {
      regionsData.push({
        type: 'region',
        name: region.name.substring(0, 15),
        id: region.id
      });
      region.sites.forEach(site => {
        regionsData.push({
          type: 'site',
          id: site.id,
          name: site.name.substring(0, 15),
          forecast: ForecastService.getForecastForSite(site.id)
        });
      })
    });

    // get the top 7 most active sites
    // But don't show in list if there is no activity
    let topSites = this.getTopSites(regionsData);
    let topSiteRegion = {
      type: 'region',
      name: 'Most Active',
      id: null
    }

    if (topSites.length) {
      regionsData = [
        topSiteRegion,
        ...topSites,
        ...regionsData
      ];
    } else {
      // If there are no alerts on any of the sites
      // Rather than leave the space blank, show an empty line
      regionsData.unshift({
        type: 'site',
        name: 'No Active Sites',
        id: null
      });

      regionsData.unshift({
        type: 'region',
        name: 'Most Active',
        id: null
      });
    }

    return {
      timeControllerData,
      regionsData
    };
  }

  getTopSites(data) {
    data = data
      .filter(d => d.type === 'site' && d.forecast.alerts.length)
      .sort((a, b) => b.forecast.alerts.length - a.forecast.alerts.length)
      .slice(0, 7);

    return data;
  }

  getTimestamp() {
    let timestamp = this.props.selectedTimestamp;
    if (!timestamp) {
      timestamp = this.getMostRecentForecastTimestamp();
    }
    return timestamp;
  }

  getMostRecentForecastTimestamp() {
    let regions = RegionService.getRegions();
    let timeControllerData = ForecastService.getForecastForRegion(regions[0].id).data.medianData;
    let currentTS = new Date().valueOf();
    let retVal = timeControllerData.find(d => d.timestampUnProc >= currentTS);

    // If a datum corresponding to the current time cannot be found
    // (likely due to us using fake data)
    // Use the second one in the list to make it look more legit and because we MUST return something here
    if (!retVal) {
      retVal = timeControllerData[1];
    }

    return retVal.timestampUnProc;
  }

  getXScale() {
    const { width, margin } = CHART_CONSTS;
    const { timeControllerData } = this.getFormattedData();
    return d3.scaleTime()
      .domain(d3.extent(timeControllerData, d => d.timestamp))
      .range([0, width - margin.left - margin.right]);
  }

  onLocationClick(location) {
    if (!location.id) return;

    if (location.type === 'region') {
      this.props.onSelectRegion(location.id);
    } else {
      this.props.onSelectSiteForecast(location.id);
    }
  }

  renderSlider(selectedTimestamp) {
    const { width, height, margin } = CHART_CONSTS;

    let { timeControllerData, regionsData } = this.getFormattedData();

    let xScale = this.getXScale()

    this.renderRegionalData(regionsData, xScale, height, width, margin);
    this.renderTimeIndicator(timeControllerData, xScale, height, width, margin, selectedTimestamp);
  }

  renderTimeIndicator(timeControllerData, xScale, height, width, margin, selectedTimestamp) {
    const { onSelectTimestamp } = this.props;
    let xVal;

    let svg = d3.select('#time-slider-chart').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .attr('class', 'time-selection-chart')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xAxis1 = d3.axisTop(xScale)
      .tickArguments([d3.timeMinute.every(15)])
      .tickFormat(d => null);

    let xAxis2 = d3.axisTop(xScale)
      .tickArguments([d3.timeMinute.every(60)])
      .tickSizeInner(12)
      .tickFormat(function (d, i) {
        return i + 'hr'
      });

    let fifteenMinVals = timeControllerData.map(d => {
      return {
        scaled: xScale(d.timestamp),
        ob: d
      };
    });

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
      .call(xAxis1)

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
      .call(xAxis2)
      .selectAll("text")
      .attr('class', 'aviano')
      .style("text-anchor", function (d, i, nodes) {
        let retVal = 'middle';
        if (i === 0) { retVal = 'start'; }
        if (i === nodes.length - 1) { retVal = 'end'; }
        return retVal;
      })
      .attr("dy", "33px");

    let timeIndicatorWrap = svg.append('g')
      .attr('class', 'time-indicator-wrap')
      .attr("transform", "translate(" + margin.left + ",0)")

    let timeIndicator = timeIndicatorWrap.append('g')
      .attr('class', 'time-indicator')
      .attr("transform", "translate(0,0)")

    timeIndicator
      .append('circle')
      .attr('class', 'outer-circle')
      .attr('cx', '0')
      .attr('cy', height - 14)
      .attr('r', 8);

    timeIndicator
      .append('circle')
      .attr('class', 'inner-circle')
      .attr('cx', '0')
      .attr('cy', height - 14)
      .attr('r', 6)
      .attr('style', 'pointer-events: visible;');

    timeIndicator
      .append('line')
      .attr('class', 'line')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', height - 14)

    timeIndicator
      .attr("transform", `translate(${xScale(selectedTimestamp)},0)`);

    timeIndicator
      .call(d3.drag()
        .on("start", function (d) {
          document.body.className += ' dragging';
        })
        .on("drag", function (d) {
          if (d3.event.x >= 0 && d3.event.x <= fifteenMinVals[fifteenMinVals.length - 1].scaled) {
            d3.select(this)
              .attr("transform", "translate(" + d3.event.x + ",0)")
          }
        })
        .on("end", function (d) {
          let delay = 200;

          xVal = fifteenMinVals.reduce((acc, v) => {
            let cur = Math.abs(d3.event.x - v.scaled);
            if (cur < acc[0]) {
              return [cur, v.scaled, v.ob]
            } else {
              return acc
            }
          }, [999, 0, null]);

          d3.select(this)
            .transition()
            .duration(delay)
            .attr("transform", "translate(" + xVal[1] + ",0)");

          document.body.className = document.body.className.replace('dragging', '');

          window.setTimeout(() => {
            onSelectTimestamp(xVal[2].timestampUnProc);
          }, delay);
        })
      );
  }

  renderRegionalData(regionsData, xScale, height, width, margin) {
    let leftOffset = 9

    let ul = d3.select('#event-lines')
      .append('ul');

    let li = ul.selectAll('li')
      .data(regionsData)
      .enter()
      .append('li')
      .attr('class', (d) => {
        return `region-type-${d.type} ${!d.id && 'no-click'}`
      })
      .on('click', this.onLocationClick);

    li.append('div')
      .attr('class', 'region-title aviano')
      .html(d => d.name);

    let liSvg = li.append('div')
      .attr('class', 'region-timeline')
      .append('svg')
      .attr('width', width - (margin.left + margin.right) + 18)
      .attr('height', 20);

    liSvg
      .append('line')
      .attr('class', 'line')
      .attr('x1', leftOffset)
      .attr('y1', '10')
      .attr('x2', width - (margin.left + margin.right) + 8)
      .attr('y2', '10')

    let innerG = liSvg
      .selectAll('g')
      .data((d) => {
        if (!d.forecast) {
          return []
        } else {
          return d.forecast.alerts
        }
      })
      .enter()
      .append('g')
      .attr("transform", (d) => {
        let x = xScale(d.start) + leftOffset;
        // return "translate("+leftOffset+",2)"
        return "translate(" + x + ",2)"
      });

    innerG.append('circle')
      .attr('class', 'outer-circle')
      .attr('cx', 0)
      .attr('cy', 8)
      .attr('r', 5)
    innerG.append('circle')
      .attr('class', 'inner-circle')
      .attr('cx', 0)
      .attr('cy', 8)
      .attr('r', 3);
  }

  slideToTimestamp(timestamp) {
    let xScale = this.getXScale();
    d3.select(".time-selector")
      .attr("transform", `translate(${xScale(timestamp)},0)`);
  }

  render() {
    return (
      <div className="card time-slider">
        <div className="content">
          <div id="time-slider-chart">
            <div id="event-lines"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeSlider);
