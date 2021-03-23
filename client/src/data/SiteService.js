
import ForecastService from './ForecastService';
import RegionService from './RegionService';

let _getHasAlertStatus = (forecast, timestamp) => {
  let retVal = {
        hasAlert: false, 
        alert: {}, 
        alertScale: 1, 
        rampDirection: ''
      },
      timestampDate = new Date(timestamp);
      
  if (forecast.alerts.length > 0) {
    forecast.alerts.forEach(alert => {
      let alertDate = new Date(alert.start);
      if (alertDate.getTime() === timestampDate.getTime()) { 
        retVal.hasAlert = true;
        retVal.alert = alert;
        retVal.alertScale = alert.scale;
        retVal.rampDirection = alert.direction;
      }
    })
  }
  return retVal;
}

let _getForecastProps = (forecast, timestamp) => {
  let forecastProps = {};
  if( forecast) {
    let alertProps = _getHasAlertStatus(forecast, timestamp);
    Object.assign(forecastProps, alertProps);    
  }
  return forecastProps;
}

const getRampThreshold = (site) => {
  let rampThreshold = site.rampThreshold;
  if(!rampThreshold) {
    let region = RegionService.getRegionForSite(site);
    rampThreshold = RegionService.getRampThreshold(region); 
  }
  return rampThreshold;
}

let _getSiteProps = (site) => {
  let rampThreshold = getRampThreshold(site);
  return {
    fid: site.id,
    capacity_mw: Math.round(site.capacity_mw),
    selected: site.selected,
    name: site.name,
    rampThreshold: rampThreshold
  };
}

/**
  * Properties used by the map for styling include
  * - id
  * - selected
  */
let getGeoJsonForSite = (site) => {
  
  let forecast = ForecastService.getForecastForSite(site.id),
      forecastProps = _getForecastProps(forecast),
      siteProps = _getSiteProps(site);

  if( !forecast) { siteProps.disabled = true; }

  return {
    "id": site.id,
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [ site.longitude, site.latitude ] },
    "properties": Object.assign({}, siteProps, forecastProps)
  }
}

let getAllSites = () => {
  return RegionService.getRegions().reduce((acc, region) => {
    region.sites.forEach(site => {
      acc.push(site);
    });
    
    return acc;
  }, []);
}

let getSiteDataByTimeStamp = (site, timestamp) => {
  let forecast = ForecastService.getForecastForSite(site.id),
      forecastProps = _getForecastProps(forecast, timestamp),
      siteProps = _getSiteProps(site);

  if( !forecast) { siteProps.disabled = true; }

  return Object.assign({}, siteProps, forecastProps);
}

let selectSite = (site) => {
  site.selected = true;
}

let deselectSite = (site) => {
  site.selected = false;
}

export default {
  getGeoJsonForSite: getGeoJsonForSite,
  getSiteDataByTimeStamp: getSiteDataByTimeStamp,
  getRampThreshold: getRampThreshold,
  selectSite: selectSite,
  deselectSite: deselectSite,
  getAllSites: getAllSites
}
