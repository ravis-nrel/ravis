import CONFIG from "./Config";
import SiteService from "./SiteService";
import ForecastService from "./ForecastService";
import center from '@turf/center';
import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { featureCollection, point } from '@turf/helpers';

class RegionService {

  constructor() {
    this._data = [];
    this.globalRampThreshold = CONFIG.rampThreshold;
    this.addNewRegionTimestamp = null;
    this.apiUrl = CONFIG.apiUrl;
  }

  getRegions() {
    return this._data;
  }

  getRegionsViaFile(dataset) {
    const jsonData = require('./caiso-utility-sites.json');
    this._data.splice(0, this._data.length, ...jsonData);
    return Promise.resolve(this.getRegions());
  }

  getRegionsViaProxy(dataset) {
    let url,
        opts = {
          method: "GET",
          cache: "no-cache",
          redirect: "follow",
          headers: {
            "Content-Type": "application/json"
          }
        };

    url = `${this.apiUrl}${CONFIG.regionsProxyUrl}?dataset=${dataset}`;

    // Returns a promise that will resolve with the data from the
    // response, or will throw an error
    return fetch(url, opts)
      .then(response => {
        //console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Response status ${response.status}:${response.statusText} when fetching regions and sites`
          );
        }
      })
      .then(jsonData => {
        if (!jsonData.result || !jsonData.result.length > 0) {
          throw new Error("No regions from API!");
        } else {
          this._data.splice(0, this._data.length, ...jsonData.result);
          return this.getRegions();
        }
      });
  }

  getRegionById(regionId) {
    try {
      return this.getRegions().find(region => {
        return region.id === regionId;
      });
    } catch (error) {
      return;
    }
  }

  getAllSites() {
    let accumulator = (sites, region) => sites.concat(region.sites);
    try {
      return this.getRegions().reduce(accumulator, []);
    } catch (error) {
      return;
    }
  }

  getSiteById(siteId) {
    try {
      return this.getAllSites().find(site => {
        return site.id === siteId;
      });
    } catch (error) {
      return;
    }
  }

  getSitesForRegion(regionId) {
    try {
      return this.getRegionById(regionId).sites;
    } catch (error) {
      return;
    }
  }

  getNodesForRegion(regionId) {
    try {
      return this.getRegionById(regionId).nodes;
    } catch (error) {
      return;
    }
  }

  _getHasAlertStatus(forecast, timestamp) {
    let retVal = {
        hasAlert: false,
        alert: {},
        alertScale: 1,
        rampDirection: ""
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
      });
    }
    return retVal;
  }

  _getForecastProps(forecast, timestamp) {
    let forecastProps = {};
    if (forecast) {
      let alertProps = this._getHasAlertStatus(forecast, timestamp);
      Object.assign(forecastProps, alertProps);
    }
    return forecastProps;
  }

  _getRegionProps(region) {
    let rampThreshold = this.getRampThreshold(region);
    return {
      fid: region.id,
      selected: region.selected,
      name: region.name,
      capacity_mw: Math.round(region.capacity_mw),
      rampThreshold: rampThreshold
    };
  }

  getGeoJsonForRegions() {
    const regions = this.getRegions();
    let json = {};

    try {
      json = {
        type: "FeatureCollection",
        features: regions.map(region => {
          let forecast = ForecastService.getForecastForRegion(region.id),
              forecastProps = this._getForecastProps(forecast),
              regionProps = this._getRegionProps(region);

          if (!forecast) {
            regionProps.disabled = true;
          }

          return {
            id: region.id,
            type: "Feature",
            geometry: { type: "Point", coordinates: region.centroid },
            properties: Object.assign({}, regionProps, forecastProps)
          };
        })
      };
    } catch (error) {
      // noop
    }

    return json;
  }

  getRampThreshold(region) {
    let rampThreshold = region.rampThreshold;
    if(!rampThreshold) {
      rampThreshold = this.globalRampThreshold;
    }
    return rampThreshold;
  }

  getRegionDataByTimeStamp(regionId = null, timestamp) {
    let regions, regionData;

    try {
      if (regionId) {
        let region = this.getRegionById(regionId);
        regions = [region];
      } else {
        regions = this.getRegions();
      }

      regionData = regions.map(region => {
        let forecast = ForecastService.getForecastForRegion(region.id),
          forecastProps = this._getForecastProps(forecast, timestamp),
          regionProps = this._getRegionProps(region);

        if (!forecast) {
          regionProps.disabled = true;
        }

        return Object.assign({}, regionProps, forecastProps);
      });
    } catch (error) {
      // noop
    }

    return regionData;
  }

  getRegionForSite(site) {
    return this.getRegions().find( region => {
      let s = region.sites.find(s => s.id === site.id);
      return s !== undefined;
    });
  }

  getNodesGeoJsonForRegion(regionId, timestamp) {
    try {
      let nodesJson = this.getNodesForRegion(regionId).map(node => {
        return {
          "id": node.id,
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [ node.longitude, node.latitude ] },
          "properties": Object.assign({}, {fid: node.id}, node[timestamp])
        }
      });

      return {
        type: "FeatureCollection",
        features: nodesJson
      }
    } catch(error) {
      return []
    }
  }

  getSitesGeoJsonForRegion(regionId) {
    try {
      let sitesJson = this.getSitesForRegion(regionId).map(site => {
          return SiteService.getGeoJsonForSite(site);
        }),
        json = {
          type: "FeatureCollection",
          features: sitesJson
        };

      return json;
    } catch (error) {
      return [];
    }
  }

  // Creates a GeoJson object including a linestring between every
  // site in the provided region
  getSiteConnectionsGeoJsonForRegion(regionId, timestamp) {
    let geoJson = {
        type: 'FeatureCollection',
        features: []
      },
      sites = this.getSitesForRegion(regionId),
      site_1, site_2;

    for(let i=0; i<2; i++) {
      site_1 = sites[i];
      for(let x=i+1; x<sites.length; x++) {
        site_2 = sites[x];
        geoJson.features.push({
          id: `${site_1.id}-${site_2.id}`,
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[site_1.longitude, site_1.latitude], [site_2.longitude, site_2.latitude]]
          },
          properties: {
            percentCapacity: Math.floor(Math.random()*100)
          }
        })
      }
    }

    return geoJson;
  }

  getSitesDataForRegionByTimeStamp(regionId, timestamp) {
    try {
      return this.getSitesForRegion(regionId).map(site =>
        SiteService.getSiteDataByTimeStamp(site, timestamp)
      );
    } catch (error) {
      return [];
    }
  }

  getAddNewRegionTimestamp() {
    return this.addNewRegionTimestamp;
  }

  selectRegion(regionId) {
    try {
      let region = this.getRegionById(regionId);
      region.selected = true;
    } catch (error) {
      return;
    }
  }

  deselectRegion(regionId) {
    try {
      let region = this.getRegionById(regionId);
      region.selected = false;
    } catch (error) {
      return;
    }
  }

  setGlobalRampThreshold(rampThreshold) {
    this.globalRampThreshold = rampThreshold;
  }

  updateAddNewRegionTimestamp() {
    this.addNewRegionTimestamp = Date.now();
  }

  addNewRegion(region) {
    let doesExist = this._data.find(reg => reg.id === region.id);

    if (doesExist) {
      return;
    } else {
      this._data.push(region);
    }
  }

  calcCapacity(sites) {
    return sites.reduce((acc, site) => {
      acc += site.capacity_mw;
      return acc;
    },0);
  }

  createFeatureCollection(sites) {
    return sites.reduce((acc, site) => {
      let sitePt = point([site.longitude, site.latitude]);

      acc.push(sitePt);
      return acc;
    }, []);
  }

  calcCentroid(sites) {
    let features = this.createFeatureCollection(sites);

    return center(featureCollection(features)).geometry.coordinates;
  }

  calcExtent(sites) {
    let features = this.createFeatureCollection(sites),
        buffered = buffer(featureCollection(features), 100, {units: 'miles'});

    return bbox(buffered);
  }

  incrementRegionId() {
    let ids = [];

    this._data.forEach(d => ids.push(d.id));
    ids.sort();
    return ids.pop() + 100;
  }

  createCustomRegion(name, sites) {
    let capacity_mw = this.calcCapacity(sites),
        centroid = this.calcCentroid(sites),
        defaultExtent = this.calcExtent(sites),
        id = this.incrementRegionId(),
        maxExtent = [[-165.29686, -4.291293],[-28.714828, 60.37603]], // hard coding based on values being consistent across all regions.
        customSite;


    customSite = {
      capacity_mw,
      centroid,
      defaultExtent,
      id,
      maxExtent,
      name,
      showForecast: false,
      showMapDetail: false,
      sites
    };

    return customSite;
  }
}

const instance = new RegionService();

export default instance;
