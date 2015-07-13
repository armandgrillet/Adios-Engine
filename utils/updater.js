'use strict';

var async = require('async');
var request = require('request');

var awsManager = require('./awsManager');
var listsManager = require('./listsManager');
var parser = require('./parser');

var updates;

function uploadChanges(name, newList, differences) {
	if (differences.added.length === 0 && differences.removed.length === 0) {
		var now = new Date();
		updates.log += name + ' didn\'t changed (' + now + ')\n';
		updates[name] = {'added': null, 'removed': null};
	} else {
		awsManager.uploadNewList(name, newList, function(errUpload) {
			if (errUpload) {
				updates.log += 'Error uploading rules/' + name + '.txt\n';
			} else {
				updates.log += 'Successfully uploaded rules/' + name + '.txt\n';
				var rulesAdded = parser.parseRules(differences.added);
				var rulesRemoved = parser.parseRules(differences.removed);
				awsManager.uploadUpdates(name, rulesAdded, rulesRemoved, function(errUploadUpdates) {
					if (errUploadUpdates) {
						throw errUploadUpdates;
					}
					updates.log += 'Successfully uploaded the updates in S3 for ' + name + '\n';
					updates[name] = {'added': rulesAdded, 'removed': rulesAdded};
				});
			}
		});
	}
}

module.exports = {
	getUpdates: function(callback) {
		console.log('getUpdates()');
		updates = {'log': ''};
		async.each(listsManager.getList(), function(list, cb) {
			request(list.url, function (error, response, listFromTheInternet) {
				if (!error && response.statusCode === 200) {
					awsManager.downloadOldList(list.name, function(errDownload, data) {
						if (errDownload) {
							console.log('Error downloading rules/' + list.name + '.txt on S3: not found');
							uploadChanges(list.name, listFromTheInternet, listsManager.diffLists('', listFromTheInternet));
						} else {
							uploadChanges(list.name, listFromTheInternet, listsManager.diffLists(data.Body.toString(), listFromTheInternet));
						}
						cb();
					});
				} else {
					console.log('Error downloading the list ' + list.name);
					updates.log += 'Error downloading the list ' + list.name + '\n';
					cb({'log': updates.log});
				}
			});
		}, function(err) {
			if (err) {
				console.log('One of the list failed to process');
				updates.log += 'One of the list failed to process\n';
				callback({'log': updates.log});
			} else {
				console.log('All lists have been processed successfully');
				updates.log += 'All lists have been processed successfully\n';
				callback(updates);
			}
		});
	}
};