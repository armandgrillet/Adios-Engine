module.exports = {
	parseRule: function(rule) {
		if (rule.isNotAComment()) {
			var trigger = {};
			var action = {};
			if (rule.isNotElementHiding()) {
				trigger = { "url-filter": rule.getUrlFilter() };

				if (rule.hasOptions()) {
					var options = rule.getOptions();
					if (options.hasResourceTypes()) {
						if (options.hasCompatibleResourceTypes()) {
							trigger["resource-type"] = options.getResourceTypes();
						} else {
							return null;
						}
					}

					if (options.hasLoadType()) {
						trigger["load-type"] = options.getLoadType();
					}

					if (options.hasDomains()) {
						trigger[options.getTypeDomain()] = options.getDomains();
					}
				}

				action = {};
				if (rule.isNotAnException()) {
					action["type"] = "block";
				} else {
					action["type"] = "ignore-previous-rules";
				}
			} else { // It's element hiding
				trigger = { "url-filter": rule.getElementHidingUrlFilter() };
				if (rule.hasElementHidingDomains()) {
					trigger[rule.getElementHidingTypeDomain()] = rule.getElementHidingDomains();
				}

				action["type"] = "css-display-none",
				action["selector"] = rule.getSelector();
			}
			return {"trigger": trigger, "action": action};
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

String.prototype.isNotAnException = function() {
	if (this.indexOf("@@") == 0) {
		return false;
	}
	return true;
}

String.prototype.isNotElementHiding = function() {
	if (this.indexOf("##") == -1) {
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

	// Remove exception characters
	if (urlFilter.indexOf("@@") == 0) {
		urlFilter = urlFilter.substring(2);
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

String.prototype.hasTidle = function() {
	if (this.substring(0,1) == '~') {
		return true;
	} else {
		return false;
	}
}

String.prototype.getElementHidingDomains = function() {
	var domains = this.getElementHidingDomainsArray();
	var triggerDomains = [];
	var needTidle = this.hasElementHidingMixedDomains();


	for (var i = 0; i < domains.length; i++) {
		if (needTidle && domains[i].hasTidle()) {
			triggerDomains.push(domains[i].slice(1));
		} else {
			triggerDomains.push(domains[i]);
		}
	}
	return triggerDomains;
}

String.prototype.getElementHidingTypeDomain = function() {
	if (this.hasElementHidingMixedDomains()) {
		return "unless-domain";
	}
	return "if-domain";
}

String.prototype.hasElementHidingDomains = function() {
	if (this.getElementHidingDomainsArray()[0].length > 0) {
		return true;
	}
	return false;
}

String.prototype.getElementHidingDomainsArray = function() {
	return this.substring(0, this.indexOf("##")).split(',');
}

String.prototype.hasElementHidingMixedDomains = function() {
	if (this.hasElementHidingDomains()) {
		var domains = this.getElementHidingDomainsArray();
		var ifDomain = false;
		var unlessDomain = false;
		for (var i = 0; i < domains.length; i++) {
			if (domains[i].hasTidle()) {
				ifDomain = true;
			} else {
				unlessDomain = true;
			}
		}
		if (ifDomain && unlessDomain) {
			return true;
		}
	}
	return false;
}

String.prototype.getElementHidingUrlFilter = function() {
	if (this.hasElementHidingMixedDomains()) {
		var domains = this.getElementHidingDomainsArray();
		var expression = "(";
		for (var i = 0; i < domains.length; i++) {
			if (!domains[i].hasTidle()) {
				expression += domains[i] + '|'; // Shitty RegExp because the filters are “if-domain” and “unless-domain” are exclusive.
			}
		}
		expression = expression.slice(0,-1) + ')';
		return expression;
	}
	return ".*";
}

String.prototype.getSelector = function() {
	return this.substring(this.indexOf("##") + 2);
}

Array.prototype.getResourceTypes = function() {
	var resourceTypes = [];
	if (this[0].hasTidle()) {
		resourceTypes = ["document", "script", "image", "style-sheet" /*, "font", "raw", "svg-document", "media", "popup" */];
		for (var i = 0; i < this.length; i++) {
			switch (this[i]) {
				case "~document":
			  	case "~script":
			  	case "~image":
			  		resourceTypes.splice(resourceTypes.indexOf(this[i].substring(1)), 1); // Remove the value from the array.
			  		break;
			  	case "~stylesheet":
			  		resourceTypes.splice(resourceTypes.indexOf("style-sheet"), 1);
			  		break;
			  	// TODO : Add other cases
			  	default:
			    	break;
			}
		}
	} else {
		for (var i = 0; i < this.length; i++) {
			switch (this[i]) {
				case "document":
			  	case "script":
			  	case "image":
			  		resourceTypes.push(this[i]);
			  		break;
			  	case "stylesheet":
			  		resourceTypes.push("style-sheet");
			  		break;
			  	// TODO : Add other cases
			  	default:
			    	break;
			}
		}
	}
	return resourceTypes;
}

Array.prototype.hasResourceTypes = function() {
	var resourceTypes = ["document", "script", "image", "stylesheet", "object", "object-subrequest", "subdocument"];
	for (var i = 0; i < resourceTypes.length; i++) {
	    if (this.indexOf(resourceTypes[i]) > -1 || this.indexOf('~' + resourceTypes[i]) > -1) {
	        return true;
	    }
	}
	return false;
}

Array.prototype.hasCompatibleResourceTypes = function() {
	var compatibleResourceTypes = ["document", "script", "image", "stylesheet", "~document", "~script", "~image", "~stylesheet", "~object", "~object-subrequest", "~subdocument"];
	for (var i = 0; i < compatibleResourceTypes.length; i++) {
	    if (this.indexOf(compatibleResourceTypes[i]) > -1) {
	        return true;
	    }
	}
	return false;
}

Array.prototype.getLoadType = function() {
	if (this.indexOf("third-party") > - 1) {
		return ["third-party"];
	} else { // "~third-party"
		return ["first-party"];
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
		if (this[i].indexOf("domain=") == 0) {
			return true;
		}
	}
	return false;
}

Array.prototype.getDomains = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") == 0) {
			var domains = this[i].substring("domain=".length);
			if (domains.hasTidle()) {
				domains = domains.replaceAll('~', ''); // Removing the ~
			}
			return domains.split('|');
		}
	}
	return null;
}

Array.prototype.getTypeDomain = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") == 0 && this[i].substring("domain=".length).hasTidle()) {
			return "unless-domain";
		}
	}
	return "if-domain";
}