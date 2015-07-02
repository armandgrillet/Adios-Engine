var parser = require('./parser');
var request = require('request');
var fs  = require("fs");
var aws = require('aws-sdk');

require('dotenv').load();
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create a bucket using bound parameters and put something in it.
// Make sure to change the bucket name from "myBucket" to something unique.
var s3bucket = new aws.S3({params: {Bucket: 'adiosrules'}});
s3bucket.createBucket(function() {
  var params = {Key: 'easylist/hello.txt', Body: 'Hello!'};
  s3bucket.upload(params, function(err, data) {
    if (err) {
      console.log("Error uploading data: ", err);
    } else {
      console.log("Successfully uploaded data to adiosrules/easylist");
    }
  });
});

// request('https://easylist-downloads.adblockplus.org/easylist.txt', function (error, response, body) {
// 	if (!error && response.statusCode == 200) {
// 		var rules = body.split('\n');
// 		var ascii = /^[ -~]+$/;
// 		var rule;
// 		var canBeAdded;
// 		var json = [];

// 		// fs.writeFileSync("./easylist.json", "[\n");
// 		for (var i = 0; i < rules.length; i++) {
// 			if (i != 0 && parser.parseRule(rules[i]) != null) {
// 				rule = parser.parseRule(rules[i]);
// 				canBeAdded = true;

// 				if (rule["trigger"]["if-domain"] != null) {
// 					var ifDomains = rule["trigger"]["if-domain"];
// 					for (var j = 0; j < ifDomains.length; j++) {
// 						if ( !ascii.test( rule["trigger"]["if-domain"][j] )) {
// 							console.log("If-domain: " + rule["trigger"]["if-domain"][j]);
// 							canBeAdded = false;
// 						}
// 					}
// 				}
				
// 				if (rule["trigger"]["unless-domain"] != null) {
// 					var unlessDomains = rule["trigger"]["unless-domain"];
// 					for (var j = 0; j < unlessDomains.length; j++) {
// 						if ( !ascii.test( rule["trigger"]["unless-domain"][j] )) {
// 							console.log("Unless-domain: " + rule["trigger"]["unless-domain"][j]);
// 							canBeAdded = false;
// 						}
// 					}
// 				}

// 				if ( !ascii.test( rule["trigger"]["url-filter"] )) {
// 					console.log("Url-filter: " + rule["trigger"]["url-filter"]);
// 					canBeAdded = false;
// 				}

// 				if (canBeAdded) {
// 					// fs.appendFileSync("./easylist.json", JSON.stringify(rule));
// 					// if (i < rules.length - 1) {
// 					// 	fs.appendFileSync("./easylist.json", ",\n");
// 					// } else {
// 					// 	fs.appendFileSync("./easylist.json", "\n]");
// 					// }
// 					json.push(rule);
// 				}	
// 			}
// 		}
// 	}

// 	var s3 = new aws.S3({params: {Bucket: 'adios', Key: 'easylist'}});
// 	s3.upload({Body: JSON.stringify(json)}).on('httpUploadProgress', function(evt) { console.log(evt); }).send(function(err, data) { console.log(err, data) });});