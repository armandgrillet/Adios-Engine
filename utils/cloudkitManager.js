'use strict';

var fetch = require('node-fetch');
var cloudkit = require('./cloudkit');
require('dotenv').load();

cloudkit.configure({
  services: {
    fetch: fetch
  },
  containers: [{
    containerIdentifier: process.env.CK_CONTAINER_ID,
    apiToken: process.env.CK_API_TOKEN,
    environment: process.env.ENVIRONMENT
  }]
});
