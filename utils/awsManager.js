'use strict';

var aws = require('aws-sdk');
require('dotenv').load();

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var s3bucket = new aws.S3({params: {Bucket: 'adiosrules'}});

module.exports = {
	downloadOldList: function(list, callback) {
		s3bucket.getObject({Key: process.env.ENVIRONMENT + '/lists/' + list + '.txt'}, callback);
	},
	uploadNewList: function(name, content, callback) {
		s3bucket.createBucket(function() {
			var params = {Key: process.env.ENVIRONMENT + '/lists/' + name + '.txt', Body: content};
			s3bucket.upload(params, callback);
		});
	},
	uploadUpdates: function(list, rulesAdded, rulesRemoved, callback) {
		var now = Date.now();
		if (rulesAdded.length > 0) {
			s3bucket.createBucket(function() {
				s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_add.json', Body: JSON.stringify(rulesAdded, null, '\t')})
				.send(function(errUploadRulesAdded) {
					if (errUploadRulesAdded) {
						callback(errUploadRulesAdded);
					} else {
						if (rulesRemoved.length > 0) {
							s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_remove.json', Body: JSON.stringify(rulesRemoved, null, '\t')})
							.send(function(errUploadRulesRemoved) {
								if (errUploadRulesRemoved) {
									callback(errUploadRulesRemoved);
								} else {
									callback();
								}
							});
						} else {
							callback();
						}
					}
				});
			});
		} else if (rulesRemoved.length > 0) {
			s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_remove.json', Body: JSON.stringify(rulesRemoved, null, '\t')})
			.send(function(errUploadRulesRemoved) {
				if (errUploadRulesRemoved) {
					callback(errUploadRulesRemoved);
				} else {
					callback();
				}
			});
		}
	}
};
