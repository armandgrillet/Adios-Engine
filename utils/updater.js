'use strict';

var async = require('async');
var request = require('request');

var awsManager = require('./awsManager');
var listsManager = require('./listsManager');
var parser = require('./parser');

var updates;

function uploadChanges(name, newList, differences, callback) {
	if (differences.created.length === 0 && differences.deleted.length === 0) {
		var now = new Date();
		console.log(name + ' didn\'t changed (' + now + ')');
		updates.log += name + ' didn\'t changed (' + now + ')\n';
		callback();
	} else {
		console.log(name + ' changed: ' + differences.created.length + ' rules created and ' + differences.deleted.length + ' rules deleted');
		updates.log += name + ' changed: ' + differences.created.length + ' rules created and ' + differences.deleted.length + ' rules deleted\n';
		awsManager.uploadNewList(name, newList, function(errUpload) {
			if (errUpload) {
				console.log('Error uploading rules/' + name + '.txt');
				updates.log += 'Error uploading rules/' + name + '.txt\n';
				callback(updates.log);
			} else {
				console.log('Successfully uploaded rules/' + name + '.txt');
				updates.log += 'Successfully uploaded rules/' + name + '.txt\n';
				var rulesCreated = parser.parseRules(differences.created);
				var rulesDeleted = parser.parseRules(differences.deleted);
				awsManager.uploadUpdates(name, rulesCreated, rulesDeleted, function(errUploadUpdates) {
					if (errUploadUpdates) {
						console.log(errUploadUpdates);
						updates.log += errUploadUpdates + '\n';
						callback(updates.log);
					} else {
						console.log('Successfully uploaded the updates in S3 for ' + name);
						updates.log += 'Successfully uploaded the updates in S3 for ' + name + '\n';
						if (updates.lists != null) {
							updates.lists.push(name);
						} else {
							updates.lists = [name];
						}
						
						updates[name] = {'deleted': rulesDeleted, 'created': rulesCreated};
						callback();
					}
				});
			}
		});
	}
}

module.exports = {
	getUpdates: function(callback) {
		console.log('Let\'s update the lists...');
		updates = {'log': ''};
		async.each(listsManager.getLists(), function(list, cb) {
			request(list.url, function (error, response, listFromTheInternet) {
				if (!error && response.statusCode === 200) {
					awsManager.downloadOldList(list.name, function(errDownload, data) {
						if (errDownload) {
							console.log(updates.log += 'Error downloading rules/' + list.name + '.txt on S3: not found');
							updates.log += 'Error downloading rules/' + list.name + '.txt on S3: not found\n';
							uploadChanges(list.name, listFromTheInternet, listsManager.diffLists('', listFromTheInternet), cb);
						} else {
							uploadChanges(list.name, listFromTheInternet, listsManager.diffLists(data.Body.toString(), listFromTheInternet), cb);
						}
					});
				} else {
					console.log('Error downloading the list ' + list.name);
					updates.log += 'Error downloading the list ' + list.name + '\n';
					cb(updates.log);
				}
			});
		}, function(err) {
			if (err) {
				callback({'log': err});
			} else {
				console.log('All lists have been processed successfully');
				updates.log += 'All lists have been processed successfully\n';
				callback(updates);
			}
		});
	}
};