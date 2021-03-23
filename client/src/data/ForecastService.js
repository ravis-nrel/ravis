import CONFIG from './Config';
import moment from 'moment';
import RegionService from './RegionService';
import AlertService from './AlertService';
import SiteService from './SiteService';

class Forecast {

  constructor() {
    this._data = [];
    this.apiUrl = CONFIG.apiUrl;
    this.batchForecastRunning = false;
    this.batchForecastPromise = null;
  }

  addAlerts(formattedForecast, rampThreshold) {
    formattedForecast.alerts = AlertService.detectRampsInForecast(formattedForecast, rampThreshold);
    formattedForecast.hasAlert = formattedForecast.alerts.length > 0 ? true : false;
  }

  getForecasts() {
    return this._data;
  }

  clearForecasts() {
    return this._data.splice(0);
  }

  getForecastById(fid) {
    return this.getForecasts().find((forecast) => { return forecast.id === fid; });
  }

  getForecastForSite(siteId) {
    let forecasts = this.getForecasts();
    try {
      return forecasts.find(f => f.siteId === siteId)
    } catch (err) {
      // noop
    }
  }

  getForecastForRegion(rid) {
    let _this = this,
      region = RegionService.getRegionById(rid),
      rampThreshold = RegionService.getRampThreshold(region),
      sites = region.sites,
      siteForecasts,
      rawData,
      forecast;

    try {
      siteForecasts = sites.map(site => {
        return _this.getForecastForSite(site.id);
      });
      rawData = this._aggregateForecasts(siteForecasts);
      forecast = this._formatForecastResponse({ id: rid, rampThreshold }, { data: rawData })
    } catch (err) {
      return;
    }

    return forecast;
  }

  updateRampThresholdForSite(siteId, rampThreshold) {
    let forecast = this.getForecastForSite(siteId);
    if (forecast) {
      this.addAlerts(forecast, rampThreshold);
    }
  }

  // Simple sum of the raw data for each in the provided list
  _aggregateForecasts(forecasts) {
    // create a deep copy of the first forecast as a template
    let forecast = JSON.parse(JSON.stringify(forecasts[0]));
    forecast.rawData.forEach((data, i) => {
      // for each raw data point do a sum of all the forecasts
      forecasts.forEach((f, x) => {
        if (x > 0) {
          data.value = (parseFloat(data.value) + parseFloat(f.rawData[i].value));
        }
      })
    });
    return forecast.rawData;
  }

  _getPostBody(lat, lon) {
    // cheap clone
    let postBody = JSON.parse(JSON.stringify(CONFIG.forecastApiQueryObj)),
      startTime = moment.utc().startOf('hour').toISOString(), // now
      endTime = moment.utc().startOf('hour').add(5, 'hours').toISOString(); // now+5 hours

    postBody.temporal.intervals[0].start = startTime;
    postBody.temporal.intervals[0].end = endTime;
    postBody.spatial.coordinates = [lat, lon];

    if (process.env.LOG_ACTIONS === 'true') {
      console.log(JSON.stringify(postBody));
    }

    return JSON.stringify(postBody);
  }

  _formatForecastResponse(site, rawForecastData) {
    const startTS = rawForecastData.data[0].timestamp,
      rampThreshold = SiteService.getRampThreshold(site),
      endTS = rawForecastData.data[rawForecastData.data.length - 1].timestamp,
      data = rawForecastData.data,
      layers = [['sp_mean', 'medianData'], ['sp_95_upper_ci', 'upperData'], ['sp_95_lower_ci', 'lowerData']];

    let tmp,
      formattedForecast = {
        id: `${startTS}-${site.id}`,
        siteId: site.id,
        rawData: rawForecastData.data,
        data: {},
        alerts: [],
        hasAlert: false,
        startTS: startTS,
        endTS: endTS
      };


    tmp = data.map(({ layerName, timestamp, value }) => {
      return {
        type: layerName,
        value: parseFloat(value),
        timestampUnProc: timestamp,
        timestamp: new Date(timestamp)
      };
    });

    layers.forEach((layer) => {
      formattedForecast.data[layer[1]] = tmp.filter(v => v.type === layer[0]).sort((a, b) => { return a - b; });
    });

    this.addAlerts(formattedForecast, rampThreshold);

    return formattedForecast;
  }

  /**
    * Loads the forecast for a given site and post processes that data to
    * detect alerts and other items of note.
    *
    * @return a fetch promise
    */
  fetchForecastViaProxy(site, dataset) {
    let forecasts = this.getForecasts(),
        url,
        opts = {
          method: "GET",
          cache: "no-cache",
          redirect: "follow",
          headers: {
            "Content-Type": "application/json"
          }
        };

    url = `${this.apiUrl}${CONFIG.forecastProxyUrl}?siteId=${site.id}&dataset=${dataset}&includeProbability=${CONFIG.includeProbability}`;

    // Returns a promise that will resolve with the data
    // from the response, or will throw an error
    return fetch(url, opts)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          site.disabled = true;
          throw new Error(`Response status ${response.status}:${response.statusText} when fetching forecast for ${site.id}`);
        }
      })
      .then(jsonData => {
        if (!jsonData.result || !jsonData.result.data || !jsonData.result.data.length > 0) {
          throw new Error("No data from API!");
        } else {
          let formattedForecast = this._formatForecastResponse(site, jsonData.result);

          forecasts.push(formattedForecast);

          site.disabled = false;
          return formattedForecast;
        }
      })
      .catch(error => {
        console.error(error);
      })
  }

  /**
    * Loads forecast for all of the sites. Take note! When a single site
    * fetch job encounters errors this method keeps chugging through the
    * list leaving that site in place with no forecast. Checking for fetch
    * errors across all sites is not done here!
    *
    * @return a JS Promise that will fulfill when all forecasts for all sites
    * are fetch-resolved
    */
  fetchBatchForecast(sites, dataset) {
    let queueCount = sites.length,
        _previousForecasts = this.clearForecasts(),
        promise,
        delay;

    if (this.batchForecastRunning) {
      promise = this.batchForecastPromise;
    } else {
      this.batchForecastRunning = true;

      promise = new Promise((resolve, reject) => {
        // Add a tiny delay between requests
        delay = 30;
        sites.forEach((site) => {
          setTimeout(() => {
            site.disabled = false;
            this.fetchForecastViaProxy(site, dataset)
              .catch(e => {
                site.disabled = true;
              })
              .then((/*forecast*/) => {
                // When all fetches are complete
                if (--queueCount === 0) {
                  // Check that at least one succeeded, otherwise throw an error
                  if (sites.find(s => !s.disabled) === undefined) {
                    reject({
                      message: 'All forecast requests failed',
                      previousData: _previousForecasts
                    });
                  } else {
                    resolve({
                      data: this.getForecasts()
                    });
                  }
                }
              })
          }, delay)
        });
      })
      .finally(() => {
        this.batchForecastRunning = false;
        this.batchForecastPromise = null;
      });

      this.batchForecastPromise = promise;
    }

    return promise;
  }
}

const instance = new Forecast();

export default instance;
