'use strict';

var async = require('async');
var parser = require('./utils/parser');
var request = require('request');

var awsManager = require('./utils/awsManager');
var cloudkitManager = require('./utils/cloudkitManager');
var listsManager = require('./utils/listsManager');

async.each(listsManager.getList(), function(list) {
	request(list.url, function (error, response, listFromTheInternet) {
		if (!error && response.statusCode === 200) {
			awsManager.downloadOldList(list.name, function(errDownload, data) {
				if (errDownload) {
					console.log('Error downloading rules/' + list.name + '.txt on S3: not found');
					uploadChanges(list.name, listFromTheInternet, listsManager.diffLists('', listFromTheInternet));
				} else {
					uploadChanges(list.name, listFromTheInternet, listsManager.diffLists(data.Body.toString(), listFromTheInternet));
				}
			});
		} else {
			console.log('Error downloading the list ' + list.name);
		}
	});
}, function(err){
    if (err) {
		console.log('One of the list failed to process');
    } else {
		console.log('All lists have been processed successfully');
    }
});

function uploadChanges(name, newList, differences) {
	if (differences.added.length === 0 && differences.removed.length === 0) {
		var now = new Date();
		console.log(name + ' didn\'t changed (' + now + ')');
	} else {
		awsManager.uploadNewList(name, newList, function(errUpload) {
			if (errUpload) {
				console.log('Error uploading rules/' + name + '.txt');
			} else {
				console.log('Successfully uploaded rules/' + name + '.txt');
				var rulesAdded = parser.parseRules(differences.added);
				var rulesRemoved = parser.parseRules(differences.removed);
				awsManager.uploadUpdates(name, rulesAdded, rulesRemoved, function(errUploadUpdates) {
					if (errUploadUpdates) {
						throw errUploadUpdates;
					}
					console.log('Successfully uploaded the updates in S3 for ' + name);
					// cloudkitManager.updateRules(rulesAdded, rulesRemoved);
				});
			}
		});
	}
}