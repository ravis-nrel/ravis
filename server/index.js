#!/usr/bin/env node

const app = require('./src/app');
const http = require('http');
const config = require('config');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Make sure port is a number
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }


  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  console.log(`RAVIS server listing on port ${port}`);
}
