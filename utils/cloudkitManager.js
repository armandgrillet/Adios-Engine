'use strict';

var fetch = require('node-fetch');
var cloudkit = require('./cloudkit');
var session = require('cookie-session');
require('dotenv').load();

cloudkit.configure({
	services: {
		fetch: fetch
  	},
  	containers: [{
 		containerIdentifier: process.env.CK_CONTAINER_ID,
 		apiToken: process.env.CK_API_TOKEN,
 		environment: process.env.ENVIRONMENT,
 		auth: {
    		persist: true
    	}
  	}]
});

var container = cloudkit.getDefaultContainer();
var publicDB = container.privateCloudDatabase;

module.exports = {
	addList: function(name) {
		// var record = {
		// 	recordType: 'Lists',

		// 	fields: {
		// 		name: {
		// 			value: name
		// 		}
		// 	}
		// };
  // return publicDB.saveRecord(record).then(function(response) {
  //   if(response.hasErrors) {

  //     // Handle the errors in your app.
  //     throw response.errors[0];

  //   } else {
  //     var createdRecord = response.records[0];
  //     var fields = createdRecord.fields;

  //     // Render the created record.
  //     return renderRecord(
  //       createdRecord.recordName,
  //       createdRecord.recordType,
  //       createdRecord.recordChangeTag,
  //       createdRecord.created,
  //       createdRecord.modified
  //     );
  //   }
  // });
	},
	getList: function(name) {
		console.log(name);
	},
	performQuery: function() {
	 	publicDB.performQuery({recordType: 'Lists'}).then(function(response){
	    	console.log(response);
	  	}).catch(function(error){
	    	console.log(error);
		});
	}
};
