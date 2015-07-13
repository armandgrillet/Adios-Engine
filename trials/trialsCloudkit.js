'use strict';

var fetch = require('node-fetch');
var cloudkit = require('./utils/cloudkit');
var express = require('express');
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

var record = {
	recordName: 'yo',
	zoneID: '_defaultZone',
	recordType: 'Lists',

	fields: {
		name: {
			value: 'yo'
		}
	}
};

function demoPerformQuery() {
	publicDB.saveRecord(record).then(function(response){
		console.log(response);
	}).catch(function(error){
		if (error._serverErrorCode === 'AUTHENTICATION_REQUIRED') {
			console.log(error);
		}
	});
}

var app = express();

app.get('/', function() {
	demoPerformQuery();
});

var server = app.listen(8080, function () {
  console.log('Server listen');
});