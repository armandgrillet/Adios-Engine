// 'module.exports' is a node.JS specific feature, it does not work with regular JavaScript
var parser = require('./parser');

module.exports = {
	parseRule: function(rule) {
// 		“url-filter” (string, mandatory): matches the resource’s URL.
// “url-filter-is-case-sensitive”: (boolean, optional): changes the “url-filter” case-sensitivity.
// “resource-type”: (array of strings, optional): matches how the resource will be used.
// “load-type”: (array of strings, optional): matches the relation to the main resource.
// “if-domain”/”unless-domain” (array of strings, optional): matches the domain of the document.
		
		var trigger = { "url-filter": rule.getUrlFilter() };

		if (rule.hasResourceTypes()) {
			trigger["resource-type"] = rule.getResourceTypes();
		}

		if (rule.hasLoadType()) {
			trigger["load-type"] = rule.getLoadType();
		}

		if (rule.hasIfDomains()) {
			trigger["if-domain"] = rule.getIfDomains();
		}

		if (rule.hasUnlessDomains()) {
			trigger["unless-domain"] = rule.getUnlessDomains();
		}

		return trigger;
	}
};

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

String.prototype.getUrlFilter = function() {
	// Escape special regex characters
	var urlFilter = this.replace(/[.$+?{}()\[\]\\]/g, "\\$&");

	// Separator character ^ matches anything but a letter, a digit, or one of the following: _ - . %. 
	// The end of the address is also accepted as separator.
	urlFilter = urlFilter.replaceAll("^", String.raw`(?:[^\w\d_\-.%]|$)`);

	// * symbol
	urlFilter = urlFilter.replaceAll("*", ".*");

	// | in the end means the end of the address
	if (urlFilter.slice(-1) == '|') {
        urlFilter = urlFilter.slice(0,-1) + '$';
	}

	// || in the beginning means beginning of the domain name
	if (urlFilter.substring(0, 2) == "||") {
        if (urlFilter.length > 2) {
        	urlFilter = String.raw`^(?:[^:/?#]+:)?(?://(?:[^/?#]*\.)?)?` + urlFilter.slice(2);
        }
	} else if (urlFilter.charAt(0) == '|') { // | in the beginning means start of the address
		urlFilter = '^' + urlFilter.slice(1);
	}

	// other | symbols should be escaped
	urlFilter = urlFilter.replaceAll("(\|)[^$]", String.raw`\|`)

	return urlFilter;
}

String.prototype.getResourceTypes = function() {
	return "";
}

String.prototype.hasResourceTypes = function() {
	return false;
}

String.prototype.getLoadType = function() {
	return "";
}

String.prototype.hasLoadType = function() {
	return false;
}

String.prototype.getUnlessDomains = function() {
	return "";
}

String.prototype.hasUnlessDomains = function() {
	return false;
}

String.prototype.getIfDomains = function() {
	return "";
}

String.prototype.hasIfDomains = function() {
	return false;
}