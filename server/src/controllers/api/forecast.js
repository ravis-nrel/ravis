const CONFIG = require('config');
const path = require('path');
const resFormatter = require('../../utils/api-res-formatter.js');

function _getDataFileName(dataset, includeProbability=true) {
  let dataFileName = "generation_utility_pv";
  dataFileName += dataset === 'eclipse' ? '_eclipse' : "_no_eclipse";
  dataFileName += includeProbability ? '_prob' : '_no_prob';
  dataFileName += '.json';
  return dataFileName;
}

function _getFromEclipse(req) {
  const dataFileName = _getDataFileName(req.query.dataset, req.query.includeProbability),
        data = require(path.join(process.cwd(), CONFIG.DATA_DIR, dataFileName)),
        siteId = req.query.siteId;

  return data[siteId];
}

//TODO Add real forecast fetching code here
module.exports.getForecast = async (req, res) => {
  let data, err;

  switch (req.query.dataset) {
    case 'eclipse':
      data = _getFromEclipse(req);
      break;
    case 'no_eclipse':
      data = _getFromEclipse(req);
      break;
    default:
      err = req.query.dataset
        ? `${req.query.dataset} is not supported`
        : `'dataset' is a required parameter`;
  }

  resFormatter(req, res, err, data);
}
