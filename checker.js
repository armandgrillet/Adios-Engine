'use strict';

var parser = require('./parser');
var request = require('request');
var aws = require('aws-sdk');
var async = require('async');
var archiver = require("archiver");

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
require('dotenv').load();

var lists = [
	{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'}];

var s3bucket = new aws.S3({params: {Bucket: 'adiosrules'}});

async.each(lists, function(list) {
	request(list.url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var rules = body.split('\n');
			var rule;
			var json = [];

			// fs.writeFileSync('./easylist.json', '[\n');
			for (var i = 1; i < rules.length; i++) {
				if (i !== 0 && parser.parseRule(rules[i]) != null) {
					if (parser.isRule(rules[i])) {
						rule = parser.parseRule(rules[i]);
						if (rule !== undefined) {
							if (rule instanceof Array) { // Multiple rules, exceptionnal case due to the exclusivity of if-domain and unless-domain
								for (var realRule in rule) {
									json.push(rule[realRule]);
								}
							} else {
								json.push(rule);
							}
						}
					}
				}
			}

			s3bucket.getObject({Key: 'last/' + list.name + '.json'}, function(err, data) {
				if (err) {
					console.log('Error downloading last/' + list.name + '.json: not found');
					uploadNewList(list.name, JSON.stringify(json));
				} else {
					if (data.Body.toString() !== JSON.stringify(json)) {
						// Creation of the zip containing the JSON
						var zip = TODO;

						// We send the file
						s3bucket.createBucket(function() {
							var params = {Key: list.name + '/' + Date.now() + '.zip', Body: zip.toBuffer()};
							s3bucket.upload(params, function(err, data) {
								if (err) {
									console.log('Error uploading data: ', err);
								} else {
									console.log('Successfully uploaded data to ' + list.name + '/' + Date.now() + '.zip');
									uploadNewList(list.name, JSON.stringify(json));
								}
							});
						});
					} else {
						var now = new Date();
						console.log(list.name + ' didn\'t changed at ' + now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear());
					}
				}
			});
		}
	});
}, function(err){
    if (err) {
      	console.log('A list failed to process');
    } else {
      	console.log('All lists have been processed successfully');
    }
});

function uploadNewList(name, newJson) {
	s3bucket.createBucket(function() {
		var params = {Key: 'last/' + name + '.json', Body: newJson};
		s3bucket.upload(params, function(err) {
			if (err) {
				console.log('Error uploading data: ', err);
			} else {
				console.log('Successfully uploaded last/' + name + '.json');
			}
		});
	});
}