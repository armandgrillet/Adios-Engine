var parser = require('./parser');

// Blocking by address parts

exports.testAddressPartBlocksOne = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner/foo/img";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartBlocksTwo = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner/foo/bar/img?param";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartBlocksThree = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner//img/foo";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner/img";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner/foo/imgraph";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockThree = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["url-filter"];
	var url = "http://example.com/banner/foo/img.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Blocking by domain name

exports.testDomainNameBlocksOne = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["url-filter"];
	var url = "http://ads.example.com/foo.gif";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameBlocksTwo = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["url-filter"];
	var url = "http://server1.ads.example.com/foo.gif";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameBlocksThree = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["url-filter"];
	var url = "https://ads.example.com:8000/";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["url-filter"];
	var url = "http://ads.example.com.ua/foo.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["url-filter"];
	var url = "http://example.com/redirect/http://ads.example.com/";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Blocking exact address

exports.testExactAddressBlocksOne = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["url-filter"];
	var url = "http://example.com/";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testExactAddressDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["url-filter"];
	var url = "http://example.com/foo.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testExactAddressDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["url-filter"];
	var url = "http://example.info/redirect/http://example.com/";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Additional information.

exports.testAdditionalInfoOne = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch");
	var url = "http://example.com/banner/foo/img";
	test.notEqual(url.match(parsedRule["url-filter"]), null); // We still find the URL
    test.done();
};

exports.testAdditionalInfoTwo = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch");
	test.equal(parsedRule["unless-domain"], "adresult.ch");
    test.done();
};

exports.testAdditionalInfoThree = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch");
	test.equal(parsedRule["if-domain"], null);
    test.done();
};

exports.testAdditionalInfoFour = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~channel4.com|~watchever.de");
	test.equal(parsedRule["unless-domain"][0], "channel4.com");
	test.equal(parsedRule["unless-domain"][1], "watchever.de");
    test.done();
};

exports.testAdditionalInfoFive = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=channel4.com|watchever.de");
	test.equal(parsedRule["if-domain"][0], "channel4.com");
	test.equal(parsedRule["if-domain"][1], "watchever.de");
    test.done();
};

exports.testAdditionalInfoSix = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$script,subdocument,third-party");
	test.equal(parsedRule["resource-type"][0], "script");
	test.equal(parsedRule["load-type"], "third-party");
    test.done();
};

exports.testAdditionalInfoSeven = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$script,subdocument,~third-party");
	test.equal(parsedRule["load-type"], "first-party");
    test.done();
};