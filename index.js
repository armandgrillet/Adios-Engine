'use strict';

var express = require('express');
var path = require('path');
var async = require('async');
var parser = require('./utils/parser');
var request = require('request');

var awsManager = require('./utils/awsManager');
var cloudkitManager = require('./utils/cloudkitManager');
var listsManager = require('./utils/listsManager');
require('dotenv').load();

var app = express();
var uploadOutput = '';
app.set('port', 5000);
app.use(express.static(__dirname + '/mui'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(req, response) {
    response.sendFile(path.join(__dirname + '/mui/index.html'));
});

app.get('/upload', function(req, res) {
	cloudkitManager.performQuery();
	res.send('Ro');
	// uploadOutput = '';
	// async.each(listsManager.getList(), function(list, callback) {
	// 	request(list.url, function (error, response, listFromTheInternet) {
	// 		if (!error && response.statusCode === 200) {
	// 			awsManager.downloadOldList(list.name, function(errDownload, data) {
	// 				if (errDownload) {
	// 					uploadOutput += ('Error downloading rules/' + list.name + '.txt on S3: not found\n');
	// 					uploadChanges(list.name, listFromTheInternet, listsManager.diffLists('', listFromTheInternet), function() {callback(); });
	// 				} else {
	// 					uploadChanges(list.name, listFromTheInternet, listsManager.diffLists(data.Body.toString(), listFromTheInternet), function() {callback(); });
	// 				}
	// 			});
	// 		} else {
	// 			uploadOutput += ('Error downloading the list ' + list.name + '\n');
	// 			callback();
	// 		}
	// 	});
	// }, function(err){
	// 	if (err) {
	// 		res.send('One of the list failed to process');
	// 	} else {
	// 		res.send(uploadOutput);
	// 	}
	// });
});

function uploadChanges(name, newList, differences, callback) {
	if (differences.added.length === 0 && differences.removed.length === 0) {
		var now = new Date();
		uploadOutput += (name + ' didn\'t changed (' + now + ')\n');
		console.log(name + ' didn\'t changed (' + now + ')\n');
		callback();
	} else {
		awsManager.uploadNewList(name, newList, function(errUpload) {
			if (errUpload) {
				uploadOutput += ('Error uploading rules/' + name + '.txt\n');
			} else {
				uploadOutput += ('Successfully uploaded rules/' + name + '.txt\n');
				var rulesAdded = parser.parseRules(differences.added);
				var rulesRemoved = parser.parseRules(differences.removed);
				awsManager.uploadUpdates(name, rulesAdded, rulesRemoved, function(errUploadUpdates) {
					if (errUploadUpdates) {
						throw errUploadUpdates;
					}
					uploadOutput += ('Successfully uploaded the updates in S3 for ' + name + '\n');
					console.log('Successfully uploaded the updates in S3 for ' + name + '\n');
					cloudkitManager.performQuery();
					callback();
				});
			}
		});
	}
}

