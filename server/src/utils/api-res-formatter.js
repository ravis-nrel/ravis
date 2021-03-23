

function getDataLen(data) {
  return (Array.isArray(data)) ? data.length : 1;
}

function getApiVersion(req) {
  let retVal,
      rPath = req.route.path,
      seg = rPath.match(/\/v\d+\//);

  if (!seg) {
    retVal = "1.0.0"
  } else {
    retVal = `${seg[0].replace(/\D/g, '')}.0.0`;
  }
  return retVal;
}

module.exports = (req, res, err, data) => {
  let status,
      payload = {};

  if (err) {
    status = 400;
    payload = {
      metadata: {
        version: getApiVersion(req)
      },
      status,
      error: err
    };
  } else {
    status = 200;
    payload = {
      metadata: {
        version: getApiVersion(req),
        resultset: {
          count: getDataLen(data)
        }
      },
      status,
      result: data
    };  
  }

  res.status(status).send(payload);
}