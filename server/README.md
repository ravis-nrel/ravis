# RAVIS Server
The server codebase includes the RAVIS serverside API code and other necessary project assets. This is an Express HTTP serivce providing a collection of a few necessary endpoints. These endpoints provide access to forecast data from any integrated providers, as well as application configuration variables. This service has been deliberately designed to be as simple as possible. Currently, the endpoint serves as a simple proxy for fetching the static solar forecast data used as an example. In a fully provisioned deployment it is reasonable to assume that there would be a significant amount of extra code written to consume, process, and serve various forecast datasets.

## Getting Started
First install necessary dependencies in your system, then run the following terminal commands.

* NodeJS >= v12
* yarn

``` bash
# change into the client directory
cd server
# install dependencies with yarn
yarn install
# serve with hot reloading at https://localhost:3000
yarn start-dev
# Or for more efficient runtime without hot reloading,
yarn start
```

### Server Configuration
There are a small selection of configuration items for the server side. These are located in ./server/config/*.yml files where each file provides configuration for a given runtime environment. Current configuration variables include:
  - PORT = the HTTP port on which to make the service available
  - DATA_DIR = the directory in which the region, site, and forecast data files are stored


## Organization
The server code is quite simple to follow and understand.
- `index.js` - Includes the wiring up of the HTTP service itself and is the main entry point for the server application
- `/src/app.js` - Is the Express application configuration and setup
- `/src/routes/index.js` - Defines all the routes this API is listening on
- `/src/controllers/*.js` - The controllers handle the requests received
- `/src/models/*.js` - For more sophisticated endpoints, model code would handle data parsing and formatting, database access, etc. Current data is too simplistic to require model code, but during integration of proprietary forecast data at NREL we used several models to facilitate the endpoints ability to server more complex data
- `/src/utils/*.js` - Utility code and support classes
- `/src/views/*.hbs` - View templates. While this application doesn't serve web pages per se, it does include views for error pages and a basic homepage useful for a health check or ping monitor

## Endpoints
There are two primary endpoints served by this application. All endpoints return responses in the same standardized format.

```json
{
  "metadata": {
    "version": "1.0.0",
    "resultset": {
      "count": 5
    }
  },
  "status": 200,
  "error": "",
  "result": []
}
```

- `metadata` = Ancillary data relating to the response including
  - `verion` = The version of the API invoked
  - `resultset.count` = The number of rows returned in the data
- `status` = The HTTP status code as text
- `error` = In case of error, a message describing the error
- `result` = In case of success, the data requested

### `/api/v1/sites`
The sites endpoint provides metadata and details describing all available regions and sites of interest, which most likely equates to balancing zones and solar power plants.

http://localhost:3000/api/v1/sites?dataset=eclipse

#### Inputs
- `dataset` - Identifies the name of the dataset to return sites for. This supports an installation that serves data from more than one dataset, each with a potentially unique set of sites

#### Output Format
Includes all of the standard fields as documented at [Endpoints](#endpoints), where the `result` property is an array of objects defining regions and nested sites including the following properties.
- `id` = Unique ID for the region
- `capacity_mw` = The total power generation for this region in MW
- `load_capacity_mw` = The total load capacity for this region in MW
- `name` = A user friendly display name for this region
- `centroid` = The longitude and latitude at the center of this region expressed as a float array `[lon, lat]`
- `defaultExtent` = The default extent of this region for use in the map view component expressed as an array of lower left, upper right corners `[[lon, lat], [lon, lat]]`
- `maxExtent` = The maximum displayable extent for this region for use in the map view component expressed as an array of lower left, upper right corners `[[lon, lat], [lon, lat]]`
- `showForecast` = A boolean indicating if the forecast detail for this region should be shown by default
- `showMapDetail` = A boolean indicating if the map detail for this region should be shown by default
- `sites` = An array of objects describing each individual site included within this region
  - `sites[].capacity_mw` = The total power generation for this site in MW
  - `sites[].load_capacity_mw` = The total load capacity for this site in MW
  - `sites[].disabled` = A boolean indicating if this site should be disabled and its forecast data discarded. If true the site will still be rendered on the map, though in a greyed-out state with no detail data shown
  - `sites[].elevation` = Site elevation in meters above sea level
  - `sites[].id` = The unique id for this site
  - `sites[].latitude` = The latitude of this site's location
  - `sites[].longitude`= The longitude of this site's location
  - `sites[].name` = A user friendly display name for this site
  - `sites[].showForecast` = A boolean indicating if the forecast detail for this site should be shown by default
  - `sites[].regionId` = A reference to the region id


### `/api/v1/forecast`
The forecast endpoint provides the most recent available forecast data for the requested site. While the forecast data sample provided in this repository is quite simple, it is anticipated that production forecast data would include an augmented collection of data fields in the response. This, however, is subject to the data made available by the forecast provider.

http://localhost:3000/api/v1/forecast?dataset=eclipse&siteId=1

#### Inputs
- `dataset` = Identifies the name of the dataset to return forecast data for. This supports an installation that serves data from more than one dataset, each with a potentially unique set of sites
- `siteId` = The unique ID of the site for which forecast data is being requested

#### Output Format
Includes all of the standard fields as documented at [Endpoints](#endpoints), where the `result` property is an object containing basic forecast metadata as well as an array of objects defining forecast data for the site.
- `forecastTimestamp` = The timestamp at which this forecast was generated as a timestamp in UTC
- `nextForecastTimestamp` = The timestamp at which the next iteration of the forecast is expected to become available as a timestamp in UTC
- `data` = An array of objects including the actual forecast values
  - `data[].layerName` = The name of the forecast layer, or forecast probability. Options include:
    - `sp_mean` = Mean solar power forecast value, also known as 50% probability or deterministic forecast value
    - `sp_95_lower_ci` = Lower 95th percentile confidence interval probabilistic solar power forecast
    - `sp_95_upper_ci` = Upper 95th percentile confidence interval probabilistic solar power forecast
  - `data[].timestamp` = The timestamp at which this value is forecasted to occur as a timestamp in UTC
  - `data[].value` = The forecasted value in MW


## Performance Considerations
When deploying RAVIS to production it is important to consider the performance of the application with respect to both the number of users you wish to support and the size of the data you wish to visualize. The API service requires a deployment stack with enough resources to accommodate the peak anticipated number of concurrent requests to load the static web assets as well as API calls to fetch site and forecast data.

In addition it may be convenient to run a background process on this instance to fetch, format, and store up to date forecast data. Serving the static web assets is trivial unless supporting many thousands of users. The performance considerations for the API endpoints and any forecast daemons are contingent upon the number of sites supported, and the forecast data itself. How often the forecasts will be updated, how large the forecast data is, and how much processing is required to manipulate the data into a format that RAVIS can consume are all aspects of this performance consideration.

## Docker
This application can very effectively be made into a Docker image. For a more comprehensive understanding please read the [Docker section](https://github.com/ravis-nrel/ravis#docker) of the main README.

`docker build -t ravis-server .`