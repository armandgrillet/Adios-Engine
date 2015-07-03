var ascii = /^[ -~]+$/;

module.exports = {
	// Create a JSON object from the RegExp
	parseRule: function(rule) {
		if (rule.isNotAComment()) {
			var trigger = {};
			var action = {};
			if (rule.isNotElementHiding()) {
				trigger = { "url-filter": rule.getUrlFilter() };

				if (rule.hasOptions()) {
					var options = rule.getOptions();

					if (options.isCaseSensitive()) {
						trigger["url-filter-is-case-sensitive"] = true;
					}

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
						trigger[options.getTypeDomain()] = options.getDomainsWithoutTidle();
					}
				}

				action = {};
				if (rule.isAnException()) {
					action.type = "ignore-previous-rules";
				} else {
					action.type = "block";
				}
			} else { // It's element hiding
				if (rule.hasExceptionRuleSyntax()) {
					rule = rule.transformInElementHidingSyntax();
				}
				trigger = { "url-filter": rule.getElementHidingUrlFilter() };
				if (rule.hasElementHidingDomains()) {
					trigger[rule.getElementHidingTypeDomain()] = rule.getElementHidingDomains();
				}

				action.type = "css-display-none",
				action.selector = rule.getSelector();
			}
			return {"trigger": trigger, "action": action};
		}
		return null;
	},

	// Returns true if the rule can be added (no ASCII in it).
	isAddable: function(rule) {
		if (rule != null) {
			if (rule.trigger["if-domain"] != null) {
				for (var i = 0; i < rule.trigger["if-domain"].length; i++) {
					if ( !ascii.test( rule.trigger["if-domain"][i] )) {
						return false;
					}
				}
			}

			if (rule.trigger["unless-domain"] != null) {
				for (var i = 0; i < rule.trigger["unless-domain"].length; i++) {
					if ( !ascii.test( rule.trigger["unless-domain"][i] )) {
						return false;
					}
				}
			}

			if (!ascii.test( rule.trigger["url-filter"])) {
				return false;
			}

			return true;
		}
		return false;
	}
};

String.prototype.isNotAComment = function() {
	if (this.length > 0 && this.charAt(0) != '!') {
		return true;
	}
	return false;
},

String.prototype.isAnException = function() {
	if (this.indexOf("@@") === 0) {
		return true;
	}
	return false;
},

String.prototype.isNotElementHiding = function() {
	if (this.indexOf("##") == -1 && this.indexOf("#@#") == -1) {
		return true;
	}
	return false;
},

String.prototype.hasExceptionRuleSyntax = function() {
	if (this.indexOf("#@#") != -1) {
		return true;
	}
	return false;
},

String.prototype.transformInElementHidingSyntax = function() {
	var domains = this.substring(0, this.indexOf("#@#")).split(',');
	var newDomains = [];
	for (var i = 0; i < domains.length; i++) {
		if (domains[i].hasTidle()) {
			newDomains.push(domains[i].slice(1));
		} else {
			newDomains.push('~' + domains[i]);
		}
	}
	return newDomains.join() + "##" + this.substring(this.indexOf("#@#") + 3);
},

String.prototype.getUrlFilter = function() {
	var urlFilter = this;

	// Remove additional informations
	if (urlFilter.indexOf("$") > 0) {
		urlFilter = urlFilter.substring(0, urlFilter.indexOf("$"));
	}

	// Escape special regex characters
	urlFilter = urlFilter.replace(/[.$+?{}()\[\]\\]/g, "\\$&");

	// Remove exception characters
	if (urlFilter.indexOf("@@") === 0) {
		urlFilter = urlFilter.substring(2);
	}

	// Separator character ^ matches anything but a letter, a digit, or one of the following: _ - . %.
	// The end of the address is also accepted as separator.
	urlFilter = urlFilter.replace(/\^/g, String.raw`[^a-z\-A-Z0-9._.%]`);

	// * symbol
	urlFilter = urlFilter.replace(/\*/g, ".*");

	// | in the end means the end of the address
	if (urlFilter.slice(-1) == '|') {
        urlFilter = urlFilter.slice(0, -1) + '$';
	}

	// || in the beginning means beginning of the domain name
	if (urlFilter.substring(0, 2) == "||") {
        if (urlFilter.length > 2) {
        	urlFilter = String.raw`^(?:[^:/?#]+:)?(?://(?:[^/?#]*\.)?)?` + urlFilter.slice(2);
        }
	} else if (urlFilter.charAt(0) == '|') { // | in the beginning means start of the address
		urlFilter = '^' + urlFilter.slice(1);
	}

	// other | symbols should be escaped, we have "|$" in our regexp - do not touch it
	urlFilter = urlFilter.replace(/\|/g, String.raw`\|`);

	return urlFilter;
},

String.prototype.hasOptions = function() {
	if (this.indexOf("\$") > 0) {
		return true;
	}
	return false;
},

String.prototype.getOptions = function() {
	return this.substring(this.indexOf("\$") + 1).split(',');
},

String.prototype.hasTidle = function() {
	if (this.substring(0, 1) == '~') {
		return true;
	} else {
		return false;
	}
},

String.prototype.getElementHidingDomains = function() {
	var domains = this.getElementHidingDomainsArray();
	var triggerDomains = [];
	var needTidle;
	if (this.getElementHidingTypeDomain() == "if-domain") {
		needTidle = false;
	} else {
		needTidle = true;
	}

	for (var i = 0; i < domains.length; i++) {
		if (needTidle && domains[i].hasTidle()) {
			triggerDomains.push(domains[i].slice(1));
		} else if (!needTidle && !domains[i].hasTidle()) {
			triggerDomains.push(domains[i]);
		}
	}
	return triggerDomains;
},

String.prototype.getElementHidingTypeDomain = function() {
	var domains = this.getElementHidingDomainsArray();
	for (var i = 0; i < domains.length; i++) {
		if (domains[i].hasTidle()) {
			return "unless-domain";
		}
	}
	return "if-domain";
},

String.prototype.hasElementHidingDomains = function() {
	if (this.getElementHidingDomainsArray()[0].length > 0) {
		return true;
	}
	return false;
},

String.prototype.getElementHidingDomainsArray = function() {
	return this.substring(0, this.indexOf("##")).split(',');
},

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
},

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
},

String.prototype.getSelector = function() {
	return this.substring(this.indexOf("##") + 2);
},

Array.prototype.isCaseSensitive = function() {
	if (this.indexOf("match-case") > -1) {
		return true;
	}
	return false;
},

Array.prototype.getResourceTypes = function() {
	var resourceTypes = [];
	var i = 0;
	if (this[0].hasTidle()) {
		resourceTypes = ["document", "script", "image", "style-sheet", "raw", "popup" /*, "font", "svg-document", "media" */];
		for (i; i < this.length; i++) {
			switch (this[i]) {
				case "~document":
			  	case "~script":
			  	case "~image":
			  		resourceTypes.splice(resourceTypes.indexOf(this[i].substring(1)), 1); // Remove the value from the array.
			  		break;
			  	case "~stylesheet":
			  		resourceTypes.splice(resourceTypes.indexOf("style-sheet"), 1);
			  		break;
			  	case "subdocument":
			  		resourceTypes.splice(resourceTypes.indexOf("popup"), 1);
			  		break;
			  	case "xmlhttprequest":
			  		resourceTypes.splice(resourceTypes.indexOf("raw"), 1);
			  		break;
			  	default:
			    	break;
			}
		}
	} else {
		for (i; i < this.length; i++) {
			switch (this[i]) {
				case "document":
			  	case "script":
			  	case "image":
			  		resourceTypes.push(this[i]);
			  		break;
			  	case "stylesheet":
			  		resourceTypes.push("style-sheet");
			  		break;
			  	case "subdocument":
			  		resourceTypes.push("popup"); // http://trac.webkit.org/browser/trunk/Source/WebCore/page/DOMWindow.cpp#L2149
			  		break;
			  	case "xmlhttprequest":
			  		resourceTypes.push("raw");
			  		break;
			  	// TODO : Add other cases
			  	default:
			    	break;
			}
		}
	}
	return resourceTypes;
},

Array.prototype.hasResourceTypes = function() {
	var resourceTypes = ["document", "script", "image", "stylesheet", "xmlhttprequest", "object", "object-subrequest", "subdocument"];
	for (var i = 0; i < resourceTypes.length; i++) {
	    if (this.indexOf(resourceTypes[i]) > -1 || this.indexOf('~' + resourceTypes[i]) > -1) {
	        return true;
	    }
	}
	return false;
},

Array.prototype.hasCompatibleResourceTypes = function() {
	var compatibleResourceTypes = [ // No "object" because iOS devices don't manage Java or Flash.
		"document", "script", "image", "stylesheet", "xmlhttprequest", "subdocument",
		"~document", "~script", "~image", "~stylesheet", "~xmlhttprequest", "~object", "~object-subrequest", "~subdocument"
	];
	for (var i = 0; i < compatibleResourceTypes.length; i++) {
	    if (this.indexOf(compatibleResourceTypes[i]) > -1) {
	        return true;
	    }
	}
	return false;
},

Array.prototype.getLoadType = function() {
	if (this.indexOf("third-party") > - 1) {
		return ["third-party"];
	} else { // "~third-party"
		return ["first-party"];
	}
},

Array.prototype.hasLoadType = function() {
	if (this.indexOf("third-party") > - 1 || this.indexOf("~third-party") > - 1) {
		return true;
	}
	return false;
},

Array.prototype.getUnlessDomains = function() {
	if (this.index)
	return "";
},

Array.prototype.hasDomains = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") === 0) {
			return true;
		}
	}
	return false;
},

Array.prototype.getDomainsWithoutTidle = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") === 0) {
			return this[i].substring("domain=".length).replace(/~/g, '').split('|'); // Returns the domains without the tidle, splitted by '|'.
		}
	}
	return null;
},

Array.prototype.getTypeDomain = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i].indexOf("domain=") === 0 && this[i].substring("domain=".length).hasTidle()) {
			return "unless-domain";
		}
	}
	return "if-domain";
}
