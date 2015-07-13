'use strict';

var fetch = require('node-fetch');
var cloudkit = require('./utils/cloudkit');
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

var container = cloudkit.getDefaultContainer();
var publicDB = container.publicCloudDatabase;

function demoPerformQuery() {
  publicDB.performQuery({recordType: 'Lists'}).then(function(response){
    console.log(response);
  }).catch(function(error){
    console.log(error);
  });
}

var express = require('express');
var app = express();

app.get('/', function() {
  demoPerformQuery();
});

var server = app.listen(8080, function () {
  console.log('Server listen');
})