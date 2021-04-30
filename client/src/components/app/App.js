import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { mapStateToProps, mapDispatchToProps } from './selectors';
import {
  NRELHeader,
  Menu,
  MenuLink,
  SubMenu,
  ExternalMenuLink,
} from '../header';
import NRELFooter from '../footer/footer';
import { ReactComponent as LaunchIcon } from '../../images/external_link.svg';
import Geolocation from '../geolocation/Geolocation';
import ForecastList from '../forecast-list/Forecast-list';
import EventOutlook from '../event-outlook/Event-outlook';
import AppConfigEditor from '../app-config-editor/App-config-editor';
import { refreshRate } from '../../data/Config';
import RegionService from '../../data/RegionService';
import Spinner from '../Spinner/Spinner';

import './App.scss';

class App extends Component {

  componentDidMount() {
    //let regions = RegionService.getRegions();
    this.initializeDatasets(this.props.activeDataset);
  }

  initializeDatasets(activeDataset) {
    RegionService.getRegionsViaFile(activeDataset)
      .then(regions => {
        this.props.fetchSites(activeDataset);
        this.startEternalForecastFetching();
        this.setInitialState(regions);
      })
      .catch(error => {
        alert("Could not load regions! App initialization failure.");
      })
  }

  componentWillUpdate(nextProps) {

  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeDataset !== this.props.activeDataset) {
      this.stopEternalForecastFetching();
      this.props.deselectAll();
      this.initializeDatasets(this.props.activeDataset);
    }
  }

  componentWillUnmount() {
    this.stopEternalForecastFetching();
  }

  setInitialState(regions) {
    try {
      regions.forEach((region) => {
        if (region.showMapDetail) {
          this.props.selectRegion(region.id);
        }
        if (region.showForecast) {
          this.props.selectRegionForecast(region.id);
        }
        region.sites.forEach((site) => {
          if (site.showForecast) {
            this.props.selectSiteForecast(site.id);
          }
        }, this);
      }, this);
    } catch (error) {
      //noop
    }
  }

  // Start a timer to reload forecasts every so often ongoingly
  startEternalForecastFetching() {
    const sites = RegionService.getAllSites();
    // Initialize forecasts right away
    this.props.fetchForecasts(sites, this.props.activeDataset);

    let intervalHandle = setInterval(() => {
      this.props.fetchForecasts(sites, this.props.activeDataset);
    }, (refreshRate));

    // Save a handle on the local component state
    this.setState({
      intervalHandle: intervalHandle
    });
  }

  stopEternalForecastFetching() {
    let intervalHandle = this.state.intervalHandle;
    if (intervalHandle) {
      clearInterval(intervalHandle);
    }
  }

  render() {

    let basePath = "/";
    if (window.location.pathname.indexOf('ravis') !== -1) {
      basePath = "/ravis/";
    }

    return (
      <Router>
        <div id="app" className="app">
          <NRELHeader
            appTitle="RAVIS"
          >
            <Menu>
              <MenuLink to="/">Home</MenuLink>
              <MenuLink to="/config">Settings</MenuLink>
              <SubMenu label="Documentation">
                <ExternalMenuLink
                  to="https://www.nrel.gov/docs/fy21osti/79746.pdf"
                  label={<span className="nav-link-span">Publication <LaunchIcon /></span>}
                />
                <ExternalMenuLink
                  to="https://github.com/ravis-nrel/ravis"
                  label={<span className="nav-link-span">RAVIS Open Source <LaunchIcon /></span>}
                />
              </SubMenu>
            </Menu>
          </NRELHeader>
          <div className="main-content">
            {this.props.forecastLoading || !this.props.forecastLoaded
              ? <Spinner />
              : <React.Fragment>
                <Route exact={true} path={basePath} render={() => (
                  <span><div className="left-content">
                    <Geolocation></Geolocation>
                  </div>
                    <div className="right-content">
                      <ForecastList></ForecastList>
                    </div>
                    <div className="bottom-content">
                      <EventOutlook></EventOutlook>
                    </div></span>
                )} />
                <Route exact={true} path={`${basePath}config`} component={AppConfigEditor} />
              </React.Fragment>
            }
          </div>
            <div className="acknowledgement">
              <h4>RAVIS is developed and maintained by the National Renewable Energy Laboratory with funding and support from the U.S. Department of Energy's Solar Energy Technologies Office (SETO).</h4>
            </div>
          <div className="footer-content">
            <NRELFooter />
          </div>
        </div>
      </Router>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
