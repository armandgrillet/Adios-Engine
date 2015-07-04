'use strict';

var parser = require('./parser');
var request = require('request');
var aws = require('aws-sdk');
var async = require('async');
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
require('dotenv').load();

var lists = [
	{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'},
	{'name': 'EasyList_FR', 'url': 'https://easylist-downloads.adblockplus.org/liste_fr.txt'}
];

async.each(lists, function(list) {
	request(list.url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var rules = body.split('\n');
			var rule;
			var json = [];

			// fs.writeFileSync('./easylist.json', '[\n');
			for (var i = 0; i < rules.length; i++) {
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
			var s3bucket = new aws.S3({params: {Bucket: 'adiosrules'}});
			s3bucket.createBucket(function() {
				var params = {Key: list.name + '/list.json', Body: JSON.stringify(json)};
				s3bucket.upload(params, function(err, data) {
					if (err) {
						console.log('Error uploading data: ', err);
					} else {
						console.log('Successfully uploaded data to adiosrules/easylist');
					}
				});
			});
		}
	});
}, function(err){
    // if any of the file processing produced an error, err would equal that error
    if( err ) {
      // One of the iterations produced an error.
      // All processing will now stop.
      console.log('A list failed to process');
    } else {
      console.log('All lists have been processed successfully');
    }
});