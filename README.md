# RAVIS

The **Resource Forecast and Ramp Visualization for Situational Awareness (RAVIS)** is an open-source tool for visualizing variable renewable resource forecasts and ramp alerts for significant up/down ramps in renewable resource and the consequent net-load. The modular dashboard of RAVIS contains configurable panes for viewing- probabilistic time series forecasts, ramp event alerts on the look-ahead timeline, spatially resolved resource sites and forecasts, and system simulation and market clearing data such as transmission lines utilization, nodal prices and available generation flexibility.

![RAVIS screenshot](https://github.com/ravis-nrel/ravis/blob/main/assets/ravis.png)

## Table of contents
- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Production Considerations](#production-considerations)
- [Web Client](#web-client)
  - [Development Environment](#client-development-environment)
  - [Configuration](#client-configuration)
  - [Deployment](#client-deployment)
- [Serverside API](#serverside-api)
  - [Development Environment](#server-development-environment)
  - [Configuration](#server-configuration)
  - [Deployment](#server-deployment)
  - [Solar Plants](#solar-plants)
    - [Plant Formats](#plant-formats)
  - [Forecast](#forecast)
    - [Forecast Formats](#forecast-formats)
- [License](#license)

## Introduction
RAVIS uses a technology suite that is assembled to provide optimum visualization facility while maintaining a wide pool of potential deployment and client environments. The tool is designed to take advantage of web application technologies, open source visualization libraries and tooling. Utilizing this technology will enable deployment in any environment, using any operating system, and is scalable to much higher spatial and temporal scales of visualization. As a prototype of the tool and demonstrating a use case of variable renewable integration, RAVIS currently integrates site-specific solar power forecasts in the California Independent System Operator (CAISO) and Mid-continent ISO (MISO) footprint from the IBM WattSun forecasting platform, and also superimposes market simulation data for CAISO footprint from as in-house NREL market clearing tool. The tool has the ability to alert the viewer for excessive up or down ramps for both individual solar sites as well as regionally aggregated net-load ramps, and alerts can also be qualified with respect to available flexible generation.

RAVIS is not a turn-key system. It is the product of a research endeavor and is not intended as a commercially viable product. In order to successfully deploy and operate RAVIS it is required to have a minimum basic understanding of web application software development and operations support knowledge. Some experience with NodeJS development and a working understanding of web-based mapping, including serving vector tile data, are also highly recommended. This guide does not attempt to describe steps a novice would take to learn how to host a web application of this complexity, but rather provides details relating to the unique aspects of this system

RAVIS is a software system comprised of four distinct parts. All four need to be provisioned and configured to work together to operate RAVIS. These software systems include:
1.	The web client – the app users will see as documented above
2.	Server side API - Manage communication between the web client and data streams
3.	Data Streams – Raw data from a variety of sources. Data streams are unique and in many cases proprietary for each installation. Data streams could include power forecasts, market forecasts, weather forecasts, site metrics, and so on. RAVIS’ fundamental functionality is built on solar power forecast data and at a minimum this is what is required.
4.	Map layer service – A service that provides base layers and any additional static map layers desired. Examples include transmission line data, roads, political boundaries, bodies of water, etc.

The RAVIS code itself encompasses items 1 and 2: The web client code and the server side API that supports it. RAVIS does not include mapping services, nor any data streams. Data streams are not provided by RAVIS, but are required in order to run it. RAVIS is a visualization tool that consumes data streams that you provide. Documentation for configuring and formatting a data stream is provided below. Similarly, map layer services are not provided by RAVIS, but are required in order to run it. By default a limited number of simple map layers are enabled that are hosted by NREL to serve as an example. There are a plethora of map layer services available both commercially and open source. It is also possible to host a local map layer provider if desired. Some examples of compatible services include https://carto.com/,  https://www.mapbox.com/maps/, and https://www.openstreetmap.org/#map=5/38.007/-95.844.

## Quick Start
RAVIS includes a quick start script and set of Docker containers you can use to get running right away. The quick start process includes installing local NPM dependencies, then leverages `docker-compose` to start instances of both the client and the API. Before executing the script you must have the following dependencies installed on your computer:
1. NodeJS v12
2. Yarn
3. Docker
4. Docker-compose

When those requirements are met, simply run the bash script:
```
./quick-start.sh
```

Voila! RAVIS is running and accessible at http://localhost

## Production Considerations
When deploying RAVIS to production it is important to consider the performance of the application with respect to both the number of users you wish to support and the size of the data you wish to visualize. The client code runs on a browser and hence the visualization engine is subject to the limitations of the user’s computer. This would typically only become an issue when configuring RAVIS to display many hundreds of sites concurrently, and even then only if a user’s computer has a modest GPU.

The API service requires a deployment stack with enough resources to accommodate the peak anticipated number of concurrent requests to load the static web assets as well as API calls to fetch site and forecast data. In addition it may be convenient to run a background process on this instance to fetch, format, and store up to date forecast data. Serving the static web assets is trivial unless supporting many thousands of users. The performance considerations for the API endpoints and any forecast daemons are contingent upon the number of sites supported, and the forecast data itself. How often the forecasts will be updated, how large the forecast data is, and how much processing is required to manipulate the data into a format that RAVIS can consume are all aspects of this performance consideration.

Finally, it is important to understand that RAVIS does not include any built in security mechanisms. As written all web pages and API endpoints are fully unprotected. Depending on the nature of your installation, and any privacy concerns with the data being served, it may be necessary to adopt a secure deployment platform. To this end RAVIS utilizes very common and widely adopted web tools and protocols for which there exist many security modules and strategies. Identifying the right one(s) for your installation is best handled by the operations and cyber security specialists in your organization.

## Web Client
The web client is an application constructed according the latest industry standards for performance, scalability, and most importantly cutting edge visualization techniques. The user interface is implemented as a collection of components with varying degrees of interconnectivity. The UI components include things like a central map with a variety of data being updated in real time, ramp event probability forecasts, detailed analysis charts, configuration pages, and meteorological data over time.

The UI widgets each consume one or more data streams provided by the API endpoints. Some refresh regularly to always display the latest data, while others respond to user inputs. Furthermore some components exist in isolation, while others depend on the state of the application and/or content contained in other components.

### Client Development Environment
Once you have cloned the repository, there are a few dependencies that need to be installed.

* NodeJS >= v12
* yarn
* NPM dependencies

``` bash
# change into the client directory
cd client
# install dependencies with yarn
yarn install
# serve with hot reload at localhost:8088
yarn start
# build for production with minification
yarn build
```

### Client Configuration
First ensure that the default configuration is suitable for your instance, and/or edit as needed. Configuration is located in [this JS file](./client/src/data/Config.js). Of note, you will likely need to edit at least the `apiUrl` and the `mapTilerKey` properties. These two configuration variables are also assignable via environment variable.
  - `Config.js/apiUrl` or `env.API_URL` - the URL of the RAVIS [Serverside API](#serverside-api)
  - `Config.js/mapTilerKey` or `env.MAP_TILER_KEY` - the API key used for requests to https://cloud.maptiler.com.

In addition to the above please review the [react-app documentation](https://create-react-app.dev/docs/getting-started) for a plethora of additional tips and tricks for working within this web framework including
  - the use of the public directory
  - custom environment variables
  - the `.env` file
  - testing
  - build optimizations
  - much more

### Client Deployment
Compiling and minifying the source is as simple as

```
yarn build
```

This produces a `build` directory containing the full RAVIS client application ready to be deployed. During development we deployed behind an NGINX reverse proxy server to handle routing, https, and things like CORS for the API routes. To serve as both a deployment example and a convenient local startup option a `Dockerfile` is present that includes sufficient NGINX configuration for a basic deployment. This can be invoked from within the `client` directory as follows:

```
docker build -t ravis-client .
```

## Serverside API
In order to facilitate the consumption of a varied set of data streams we have provided a set of API endpoints. API endpoints provide mechanisms for delivering data to the client  from a wide variety of data streams.

### Server Development Environment
Once you have cloned the repository, there are a few dependencies that need to be installed.

* NodeJS >= v12
* yarn
* NPM dependencies

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

### Server Deployment
To serve as both a deployment example and a convenient local startup option a `Dockerfile` is present that includes sufficient configuration for a basic deployment. This can be invoked from within the `server` directory as follows:

```
docker build -t ravis-server .
```

### Solar Plants
Solar Plant data is stored in the data behind the API. Solar plants are grouped into regions. Regions have a small number of required metadata fields which include:
  - id = a unique id per region
  - name = a display name per regions
  - capacity_mw = the combined capacity of all plants within the region

Each region also contains a list of solar plants. Solar plants can contain as many arbitrary metadata fields as is desired. When adding metadata fields to the solar plant records keep in mind that these fields may be displayed in detail components within the web client, so exercise discretion with potentially sensitive data. The minimum required fields include:
  - id = a unique id per plant
  - name = a display name
  - longitude = the longitudinal location of the plant
  - latitude = the latitudinal location of the plant
  - capacity_mw = the generation capacity of the plant

#### Plant Formats
While an installation with a very large number of regions and/or solar plants could benefit from storing this data in a relational database, we currently support reading these data from a JSON formatted text file. The full example file is [caiso-utility-sites.json](./server/data/caiso-utility-sites.json). When requesting information about the regions and solar plants in RAVIS, the response will be in the following format
```json
[
  {
    "id": 1,
    "capacity_mw": 183.23999999999998,
    "load_capacity_mw": 19646,
    "name": "CAISO Region 1",
    "centroid": [
      -108.639385,
      32.348237
    ],
    "defaultExtent": [
      [
        -112.443672,
        31.021669
      ],
      [
        -104.835098,
        33.674805
      ]
    ],
    "maxExtent": [
      [
        -116.443672,
        27.021669
      ],
      [
        -100.835098,
        37.674805
      ]
    ],
    "showForecast": true,
    "showMapDetail": true,
    "sites": [
      {
        "capacity_mw": 0.2,
        "load_capacity_mw": 19646,
        "disabled": false,
        "elevation": 386,
        "farmId": 15213,
        "id": 231,
        "latitude": 33.329845,
        "longitude": -111.748337,
        "name": "Agua_Fria_PV",
        "showForecast": false,
        "regionId": 1
      },
      {
        "capacity_mw": 5,
        "load_capacity_mw": 19646,
        "disabled": false,
        "elevation": 1320,
        "farmId": 13023,
        "id": 234,
        "latitude": 32.909416,
        "longitude": -105.964226,
        "name": "AlamogordoPV",
        "showForecast": false,
        "regionId": 1
      }
    ]
  }
]
```

Regardless of the storage mechanism chosen for the region and plant data, this format is what the client is able to consume and hence the output of the API must be consistent with this example format.

### Forecast
Forecast data is published by forecasters. This project does not provide any built-in forecasters, however a static example of forecast data is included for demonstration purposes. The data format retrieved from the API must adhere to the following formats in order for RAVIS to consume them.

#### Forecast Formats
Forecast as fetched from the API
```json
{
  "0": {
    "data": [
      {
        "layerName": "sp_mean",
        "dataset": "Solar Forecast",
        "timestamp": 1503320400000,
        "value": 0.622
      },
      {
        "layerName": "sp_95_lower_ci",
        "dataset": "Solar Forecast",
        "timestamp": 1503320400000,
        "value": 0.5598
      },
      {
        "layerName": "sp_95_upper_ci",
        "dataset": "Solar Forecast",
        "timestamp": 1503320400000,
        "value": 0.6842
      },
      {
        "layerName": "sp_mean",
        "dataset": "Solar Forecast",
        "timestamp": 1503320700000,
        "value": 0.772
      },
      {
        "layerName": "sp_95_lower_ci",
        "dataset": "Solar Forecast",
        "timestamp": 1503320700000,
        "value": 0.6948
      },
      {
        "layerName": "sp_95_upper_ci",
        "dataset": "Solar Forecast",
        "timestamp": 1503320700000,
        "value": 0.8492000000000001
      }
    ]
  }
}
```

## License

[View License](LICENSE)
