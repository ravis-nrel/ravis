const express = require('express'),
      router = express.Router();

const forecast = require('../../controllers/api/forecast.js');
const sites =  require('../../controllers/api/sites.js');

router.route('/v1/forecast')
  .get(forecast.getForecast);

router.route('/v1/sites')
  .get(sites.getSites);

module.exports = router;
