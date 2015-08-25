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
		s3bucket.getObject({Key: process.env.ENVIRONMENT + '/textLists/' + list + '.txt'}, callback);
	},
	uploadNewList: function(name, content, callback) {
		s3bucket.createBucket(function() {
			var params = {Key: process.env.ENVIRONMENT + '/textLists/' + name + '.txt', Body: content};
			s3bucket.upload(params, callback);
		});
	}
};
