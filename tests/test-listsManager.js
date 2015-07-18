'use strict';

var listsManager = require('../utils/listsManager');
var fs = require('fs');

// Blocking by address parts

exports.testDiffOne = function(test){
	fs.readFile('./test-listsManagerRules1.txt', 'utf8', function(errOne, listOne) {
		if (errOne) {
			throw errOne;
		}
		fs.readFile('./test-listsManagerRules2.txt', 'utf8', function(errTwo, listTwo) {
			if (errTwo) {
				throw errTwo;
			}
			var differences = listsManager.diffLists(listOne, listTwo);
			console.log(differences);
			test.equal(differences.added[0], '&adserve=');
			test.equal(differences.deleted[0], '&ad_network_');
			test.equal(differences.deleted[1], '&adserver=');
			test.equal(differences.deleted[2], '&adType=PREROLL&');
			test.done();
		});
    });
};