var parser = require('./parser');

// Blocking by address parts

exports.testAddressPartBlocksOne = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner/foo/img";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartBlocksTwo = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner/foo/bar/img?param";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartBlocksThree = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner//img/foo";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner/img";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner/foo/imgraph";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testAddressPartDoesNotBlockThree = function(test){
	var regexFromRule = parser.parseRule("/banner/*/img^")["trigger"]["url-filter"];
	var url = "http://example.com/banner/foo/img.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Blocking by domain name

exports.testDomainNameBlocksOne = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["trigger"]["url-filter"];
	var url = "http://ads.example.com/foo.gif";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameBlocksTwo = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["trigger"]["url-filter"];
	var url = "http://server1.ads.example.com/foo.gif";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameBlocksThree = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["trigger"]["url-filter"];
	var url = "https://ads.example.com:8000/";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["trigger"]["url-filter"];
	var url = "http://ads.example.com.ua/foo.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testDomainNameDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("||ads.example.com^")["trigger"]["url-filter"];
	var url = "http://example.com/redirect/http://ads.example.com/";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Blocking exact address

exports.testExactAddressBlocksOne = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["trigger"]["url-filter"];
	var url = "http://example.com/";
	test.notEqual(url.match(regexFromRule), null);
    test.done();
};

exports.testExactAddressDoesNotBlockOne = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["trigger"]["url-filter"];
	var url = "http://example.com/foo.gif";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

exports.testExactAddressDoesNotBlockTwo = function(test){
	var regexFromRule = parser.parseRule("|http://example.com/|")["trigger"]["url-filter"];
	var url = "http://example.info/redirect/http://example.com/";
	test.equal(url.match(regexFromRule), null);
    test.done();
};

// Additional information.

exports.testAdditionalInfoOne = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch")["trigger"];
	var url = "http://example.com/banner/foo/img";
	test.notEqual(url.match(parsedRule["url-filter"]), null); // We still find the URL
    test.done();
};

exports.testAdditionalInfoTwo = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch")["trigger"];
	test.equal(parsedRule["unless-domain"][0], "adresult.ch");
    test.done();
};

exports.testAdditionalInfoThree = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~adresult.ch")["trigger"];
	test.equal(parsedRule["if-domain"], null);
    test.done();
};

exports.testAdditionalInfoFour = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=~channel4.com|~watchever.de")["trigger"];
	test.equal(parsedRule["unless-domain"][0], "channel4.com");
	test.equal(parsedRule["unless-domain"][1], "watchever.de");
    test.done();
};

exports.testAdditionalInfoFive = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$domain=channel4.com|watchever.de")["trigger"];
	test.equal(parsedRule["if-domain"][0], "channel4.com");
	test.equal(parsedRule["if-domain"][1], "watchever.de");
    test.done();
};

exports.testAdditionalInfoSix = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$script,subdocument,third-party")["trigger"];
	test.equal(parsedRule["resource-type"][0], "script");
	test.equal(parsedRule["load-type"][0], "third-party");
    test.done();
};

exports.testAdditionalInfoSeven = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$script,subdocument,~third-party")["trigger"];
	test.equal(parsedRule["load-type"][0], "first-party");
    test.done();
};

exports.testAdditionalInfoHeight = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$~script")["trigger"];
	test.equal(parsedRule["resource-type"][0], "document");
	test.equal(parsedRule["resource-type"][1], "image");
	test.equal(parsedRule["resource-type"][2], "style-sheet");
    test.done();
};

exports.testAdditionalInfoNine = function(test){
	var parsedRule = parser.parseRule("/banner/*/img^$~script,~image")["trigger"];
	test.equal(parsedRule["resource-type"][0], "document");
	test.equal(parsedRule["resource-type"][1], "style-sheet");
    test.done();
};

exports.testActionOne = function(test){
	var rule = parser.parseRule("/banner/*/img^");
	var url = "http://example.com/banner/foo/bar/img?param";
	test.notEqual(url.match(rule["trigger"]["url-filter"]), null);
	test.equal(rule["action"]["type"], "block");
    test.done();
};

exports.testActionTwo = function(test){
	var rule = parser.parseRule("@@/banner/*/img^");
	var url = "http://example.com/banner/foo/bar/img?param";
	test.notEqual(url.match(rule["trigger"]["url-filter"]), null);
	test.equal(rule["action"]["type"], "ignore-previous-rules");
    test.done();
};

exports.testElementHidingOne = function(test){
	var rule = parser.parseRule("retrevo.com###pcw_bottom_inner");
	var url = "http://example.com/banner/foo/bar/img?param";
	test.equal(rule["action"]["type"], "css-display-none");
	test.equal(rule["action"]["selector"], "#pcw_bottom_inner");
	test.equal(rule["trigger"]["if-domain"][0], "retrevo.com");
	test.equal(rule["trigger"]["url-filter"], ".*");
    test.done();
};

exports.testElementHidingTwo = function(test){
	var ifDomains = parser.parseRule("yourmovies.com.au,yourrestaurants.com.au,yourtv.com.au###preheader-ninemsn-container")["trigger"]["if-domain"];
	var url = "http://example.com/banner/foo/bar/img?param";
	test.equal(ifDomains[0], "yourmovies.com.au");
	test.equal(ifDomains[1], "yourrestaurants.com.au");
	test.equal(ifDomains[2], "yourtv.com.au");
    test.done();
};

exports.testElementHidingThree = function(test){
	var rule = parser.parseRule("~images.search.yahoo.com,search.yahoo.com###right > div > .searchRightMiddle + div[id]:last-child");
	var url = "http://example.com/banner/foo/bar/img?param";
	test.equal(rule["action"]["type"], "css-display-none");
	test.equal(rule["action"]["selector"], "#right > div > .searchRightMiddle + div[id]:last-child");
	test.equal(rule["trigger"]["unless-domain"][0], "images.search.yahoo.com");
	test.equal(rule["trigger"]["url-filter"], "(search.yahoo.com)");
    test.done();
};