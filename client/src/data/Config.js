module.exports = {
  // this is default if API_URL env is unset
  apiUrl: process.env.API_URL || "http://localhost:3000/api",
  // This default key has a very low rate limit and is suitable for demo only.
  // If you wish to continue using maptiler base layers, recommmended to
  // request a free key at https://cloud.maptiler.com/
  mapTilerKey: process.env.MAP_TILER_KEY || "71yfkgyDeeChDtjNZ4fY",
  regionsProxyUrl: "/v1/sites",
  forecastProxyUrl: "/v1/forecast",
  forecastHorizon: 5,
  dataset: 'eclipse',
  siteset: 'eclipse',
  includeProbability: true,
  refreshRate: 1000 * 60 * 10, // every 10 minutes
  defaultExtent: [[-132.3810369234378, 22.53683320913936], [-61.13727262931161, 52.14367481398702]],
  maxExtent: [[-163.22394,1.08382],[-30.83328,56.94204]],
  rampThreshold: 13
}
