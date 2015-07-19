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
	uploadUpdates: function(list, rulesCreated, rulesDeleted, callback) {
		var now = Date.now();
		if (rulesCreated.length > 0) {
			s3bucket.createBucket(function() {
				s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_create.json', Body: JSON.stringify(rulesCreated, null, '\t')})
				.send(function(errUploadRulesCreated) {
					if (errUploadRulesCreated) {
						callback(errUploadRulesCreated);
					} else {
						if (rulesDeleted.length > 0) {
							s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_delete.json', Body: JSON.stringify(rulesDeleted, null, '\t')})
							.send(function(errUploadRulesDeleted) {
								if (errUploadRulesDeleted) {
									callback(errUploadRulesDeleted);
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
		} else if (rulesDeleted.length > 0) {
			s3bucket.upload({Key: process.env.ENVIRONMENT + '/' + list + '/' + now + '_delete.json', Body: JSON.stringify(rulesDeleted, null, '\t')})
			.send(function(errUploadRulesDeleted) {
				if (errUploadRulesDeleted) {
					callback(errUploadRulesDeleted);
				} else {
					callback();
				}
			});
		}
	}
};
