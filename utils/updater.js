'use strict';

var async = require('async');
var request = require('request');

var awsManager = require('./awsManager');
var listsManager = require('./listsManager');
var parser = require('./parser');
var rulesManager = require('./rulesManager');

var updates;

function uploadChanges(name, newList, callback) {
	awsManager.uploadNewList(name, newList, function(errUpload) {
		if (errUpload) {
			console.log('Error uploading textLists/' + name + '.txt');
			updates.log += 'Error uploading textLists/' + name + '.txt\n';
			callback(updates.log);
		} else {
			console.log(name + '.txt uploaded');
			updates.log += name + '.txt uploaded\n';
			var cleanList = listsManager.cleanList(newList);
			var rulesCreated = parser.parseRules(cleanList);
			if (updates.lists !== undefined) {
				updates.lists.push(name);
			} else {
				updates.lists = [name];
			}
			updates[name + 'Block'] = {rules: rulesManager.getRulesWithType(rulesCreated, 'block')};
			updates[name + 'BlockCookies'] = {rules: rulesManager.getRulesWithType(rulesCreated, 'block-cookies')};
			updates[name + 'CSSDisplayNone'] = {rules: rulesManager.getRulesWithType(rulesCreated, 'css-display-none')};
			updates[name + 'IgnorePreviousRules'] = {rules: rulesManager.getRulesWithType(rulesCreated, 'ignore-previous-rules')};
			callback();
		}
	});
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
							console.log('textLists/' + list.name + '.txt not found on S3');
							updates.log += 'textLists/' + list.name + '.txt not found on S3\n';
							uploadChanges(list.name, listFromTheInternet, cb);
						} else if (data.Body.toString() === listFromTheInternet) {
							uploadChanges(list.name, listFromTheInternet, cb);
						} else {
							console.log('No update for' + list.name);
							updates.log += 'No update for' + list.name + '\n';
							cb();
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