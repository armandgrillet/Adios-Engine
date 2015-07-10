'use strict';

var parser = require('./parser');
var request = require('request');
var async = require('async');
var archiver = require("archiver");
var fs = require('fs');

var lists = [
	{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'}];

async.each(lists, function(list) {
	request(list.url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var rules = body.split('\n');
			var rule;
			var json = [];

			// Adding the rules.
			for (var i = 1; i < rules.length; i++) {
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

			var now = Date.now();

			var output = fs.createWriteStream(now + '.zip');
			var archive = archiver('zip');

			archive.on('error', function(err) {
			  throw err;
			});

			archive.pipe(output);

			archive.append(JSON.stringify(json), { name: now + '.json' }).finalize();
		}
	});
});