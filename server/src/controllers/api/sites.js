const CONFIG = require('config'),
      path = require('path');

const resFormatter = require('../../utils/api-res-formatter.js');

_getFromEclipse = function() {
  return require(path.join(process.cwd(), CONFIG.DATA_DIR, 'caiso-utility-sites.json'));
}

module.exports.getSites = async (req, res) => {
  let data, err;

  // TODO Add real site handling code here
  switch (req.query.dataset) {
    case 'eclipse':
      data = _getFromEclipse();
      break;
    case 'no_eclipse':
      data = _getFromEclipse();
      break;
    default:
      err = req.query.dataset
        ? `${req.query.dataset} is not supported`
        : `'dataset' is a required parameter`;
  }

  return resFormatter(req, res, err, data);
}
