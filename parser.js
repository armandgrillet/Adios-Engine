module.exports = {
	parseRule: function(rule) {
		if (rule.isNotAComment()) {
			var trigger = { "url-filter": rule.getUrlFilter() };

			if (rule.hasOptions()) {
				var options = rule.getOptions();
				if (options.hasResourceTypes()) {
					trigger["resource-type"] = options.getResourceTypes();
				}

				if (options.hasLoadType()) {
					trigger["load-type"] = options.getLoadType();
				}

				if (options.hasDomains()) {
					trigger[options.getTypeDomain()] = options.getDomains();
				}
			}
			return trigger;
		}
		return null;
	}
};

String.prototype.isNotAComment = function() {
	if (this.length > 0 && this.charAt(0) != '!') {
		return true;
	}
	return false;
}

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

String.prototype.getUrlFilter = function() {
	// Escape special regex characters
	var urlFilter = this.replace(/[.$+?{}()\[\]\\]/g, "\\$&");

	// Remove additional informations
	if (urlFilter.indexOf("\$") > 0) {
		urlFilter = urlFilter.substring(0, urlFilter.indexOf("\$") - 1);
	}

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

String.prototype.hasOptions = function() {
	if (this.indexOf("\$") > 0) {
		return true;
	}
	return false;
}

String.prototype.getOptions = function() {
	return this.substring(this.indexOf("\$") + 1).split(',');
}

Array.prototype.getResourceTypes = function() {
	var resourceTypes = [];
	for (var i = 0; i < this.length; i++) {
		switch (this[i]) {
		  	case "script":
		  	case "image":
		  		resourceTypes.push(this[i]);
		  	case "stylesheet":
		  		resourceTypes.push("style-sheet");
		  	// TODO : Add other cases
		  	default:
		    	break;
		}
	}
	return resourceTypes;
}

Array.prototype.hasResourceTypes = function() {
	if (this.indexOf("script") > - 1 || this.indexOf("image") > - 1 || this.indexOf("stylesheet") > - 1 /* || this.indexOf("object") > - 1 || this.indexOf("object-subrequest") > - 1 || this.indexOf("subdocument") > - 1 */) {
		return true;
	}
	return false;
}

Array.prototype.getLoadType = function() {
	if (this.indexOf("third-party") > - 1) {
		return "third-party";
	} else { // "~third-party"
		return "first-party";
	}
}

Array.prototype.hasLoadType = function() {
	if (this.indexOf("third-party") > - 1 || this.indexOf("~third-party") > - 1) {
		return true;
	}
	return false;
}

Array.prototype.getUnlessDomains = function() {
	if (this.index)
	return "";
}

Array.prototype.hasDomains = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain") == 0) {
			return true;
		}
	}
	return false;
}

Array.prototype.getDomains = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") == 0) {
			var domains = this[i].substring("domain=".length);
			if (domains.charAt(0) == '~') {
				domains = domains.replaceAll('~', ''); // Removing the ~
			}
			if (domains.split('|').length == 1) { // Just one domain.
				return domains;
			} else {
				return domains.split('|');
			}
		}
	}
	return null;
}

Array.prototype.getTypeDomain = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=~") == 0) {
			return "unless-domain";
		}
	}
	return "if-domain";
}