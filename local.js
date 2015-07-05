'use strict';

var parser = require('./parser');
var request = require('request');
var async = require('async');
var fs = require('fs');

var lists = [
	{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'}
];

async.each(lists, function(list, callback) {
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
			callback(json);
		}
	});
}, function(data){
    // if any of the file processing produced an error, err would equal that error
    fs.writeFileSync('./easylist.json', JSON.stringify(data, null, '\t'));
});