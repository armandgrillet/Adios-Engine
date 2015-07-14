'use strict';

var async = require('async');
var request = require('request');

var awsManager = require('./awsManager');
var listsManager = require('./listsManager');
var parser = require('./parser');

var updates;

function uploadChanges(name, newList, differences, callback) {
	if (differences.added.length === 0 && differences.removed.length === 0) {
		var now = new Date();
		console.log(name + ' didn\'t changed (' + now + ')');
		updates.log += name + ' didn\'t changed (' + now + ')\n';
		callback();
	} else {
		console.log(name + ' changed: ' + differences.added.length + ' rules added and ' + differences.removed.length + ' rules removed');
		updates.log += name + ' changed: ' + differences.added.length + ' rules added and ' + differences.removed.length + ' rules removed\n';
		awsManager.uploadNewList(name, newList, function(errUpload) {
			if (errUpload) {
				console.log('Error uploading rules/' + name + '.txt');
				updates.log += 'Error uploading rules/' + name + '.txt\n';
				callback(updates.log);
			} else {
				console.log('Successfully uploaded rules/' + name + '.txt');
				updates.log += 'Successfully uploaded rules/' + name + '.txt\n';
				var rulesAdded = parser.parseRules(differences.added);
				var rulesRemoved = parser.parseRules(differences.removed);
				awsManager.uploadUpdates(name, rulesAdded, rulesRemoved, function(errUploadUpdates) {
					if (errUploadUpdates) {
						console.log(errUploadUpdates);
						updates.log += errUploadUpdates + '\n';
						callback(updates.log);
					} else {
						console.log('Successfully uploaded the updates in S3 for ' + name);
						updates.log += 'Successfully uploaded the updates in S3 for ' + name + '\n';
						updates.lists.push(name);
						updates[name] = {'added': rulesAdded, 'removed': rulesRemoved};
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
		updates = {'log': '', 'lists': []};
		async.each(listsManager.getList(), function(list, cb) {
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
				callback({'log': err, 'lists': []});
			} else {
				console.log('All lists have been processed successfully');
				updates.log += 'All lists have been processed successfully\n';
				callback(updates);
			}
		});
	}
};