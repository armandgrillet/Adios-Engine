'use strict';

var parser = require('./parser');
var request = require('request');
var aws = require('aws-sdk');
var async = require('async');
var fs = require('fs');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
require('dotenv').load();

var lists = [
	{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'},
	{'name': 'EasyPrivacy', 'url': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt'},
	{'name': 'AdblockWarningRemoval', 'url': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt'},
	{'name': 'EasyList_France', 'url': 'https://easylist-downloads.adblockplus.org/liste_fr.txt'},
	{'name': 'EasyList_Germany', 'url': 'https://easylist-downloads.adblockplus.org/easylistgermany.txt'},
	{'name': 'EasyList_Italy', 'url': 'https://easylist-downloads.adblockplus.org/easylistitaly.txt'},
	{'name': 'EasyList_Dutch', 'url': 'https://easylist-downloads.adblockplus.org/easylistdutch.txt'},
	{'name': 'EasyList_China', 'url': 'https://easylist-downloads.adblockplus.org/easylistchina.txt'},
	{'name': 'EasyList_Bulgaria', 'url': 'http://stanev.org/abp/adblock_bg.txt'},
	{'name': 'EasyList_Indonesia', 'url': 'https://indonesianadblockrules.googlecode.com/hg/subscriptions/abpindo.txt'},
	{'name': 'EasyList_Arabic', 'url': 'https://liste-ar-adblock.googlecode.com/hg/Liste_AR.txt'},
	{'name': 'EasyList_Czechoslovakia', 'url': 'https://adblock-czechoslovaklist.googlecode.com/svn/filters.txt'},
	{'name': 'EasyList_Hebrew', 'url': 'https://raw.githubusercontent.com/AdBlockPlusIsrael/EasyListHebrew/master/EasyListHebrew.txt'},
	{'name': 'EasyList_SocialMedia', 'url': 'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt'},
	{'name': 'EasyList_Latvia', 'url': 'https://notabug.org/latvian-list/adblock-latvian/raw/master/lists/latvian-list.txt'},
	{'name': 'EasyList_Romania', 'url': 'http://www.zoso.ro/rolist'},
	{'name': 'EasyList_Russia', 'url': 'http://easylist-downloads.adblockplus.org/advblock.txt'},
	{'name': 'EasyList_Iceland', 'url': 'http://adblock.gardar.net/is.abp.txt'},
	{'name': 'EasyList_Greece', 'url': 'http://adblock.gardar.net/is.abp.txt'},
	{'name': 'EasyList_Poland', 'url': 'https://raw.githubusercontent.com/adblockpolska/Adblock_PL_List/master/adblock_polska.txt'},
	{'name': 'List_Japan', 'url': 'https://raw.githubusercontent.com/k2jp/abp-japanese-filters/master/abpjf.txt'},
	{'name': 'List_Estonia', 'url': 'http://gurud.ee/ab.txt'},
	{'name': 'List_Hungary', 'url': 'https://raw.githubusercontent.com/szpeter80/hufilter/master/hufilter.txt'},
	{'name': 'List_Danish', 'url': 'http://adblock.schack.dk/block.txt'},
	{'name': 'List_England', 'url': 'http://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&startdate%5Bday%5D=&startdate%5Bmonth%5D=&startdate%5Byear%5D=&mimetype=plaintext'}
];
var s3bucket = new aws.S3({params: {Bucket: 'adiosrules'}});

async.each(lists, function(list) {
	request(list.url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var rules = body.split('\n');
			var rule;
			var json = [];

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

			s3bucket.getObject({Key: list.name + '.json'}, function(err, data) {
				if (err) {
					console.log('Error downloading ' + list.name + '.json: not found');
					uploadNewList(list.name, JSON.stringify(json));
				} else {
					var now = new Date();
					if (data.Body.toString() !== JSON.stringify(json)) {
						console.log(list.name + ' did changed (' + now + ')');
						// s3bucket.upload({Key: list.name + '/' + Date.now() + '.zip', Body: body}).
						//   on('httpUploadProgress', function(evt) { console.log(evt); }).
						//   send(function(err, data) { 
						//   	console.log('Successfully uploaded data to ' + list.name + '/' + Date.now() + '.zip');
						// 	uploadNewList(list.name, JSON.stringify(json));
						//   });
						uploadNewList(list.name, JSON.stringify(json));
					} else {
						console.log(list.name + ' didn\'t changed (' + now + ')');
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
		var params = {Key: name + '.json', Body: newJson};
		s3bucket.upload(params, function(err) {
			if (err) {
				console.log('Error uploading data: ', err);
			} else {
				console.log('Successfully uploaded ' + name + '.json');
			}
		});
	});
}