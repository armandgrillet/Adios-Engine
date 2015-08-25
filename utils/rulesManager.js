'use strict';

function getStringRule(rule) {
	var stringRule = '{ \"trigger\": { \"url-filter\": \"' + rule.trigger['url-filter']+ '\"';
    if (rule.trigger['url-filter-is-case-sensitive'] !== undefined) {
        stringRule += ',\"url-filter-is-case-sensitive\": ' + rule.trigger['url-filter-is-case-sensitive'];
    }
    if (rule.trigger['resource-type'] !== undefined) {
        stringRule += ',\"resource-type\": ' + rule.trigger['resource-type'];
    }
    if (rule.trigger['load-type'] !== undefined) {
        stringRule += ',\"load-type\": ' + rule.trigger['load-type'];
    }
    if (rule.trigger['if-domain'] !== undefined) {
        stringRule += ',\"if-domain\": ' + rule.trigger['if-domain'];
    } else if (rule.trigger['unless-domain'] !== undefined) {
        stringRule += ',\"unless-domain\": ' + rule.trigger['unless-domain'];
    }
    
    stringRule += '}, \"action\": {\"type\": \"' + rule.action.type + '\"';
    
    if (rule.action.selector !== undefined) {
        stringRule += ',\"selector\": \"" + rule.action.selector + "\"';
    }
    
    return stringRule + '}},';
}

module.exports = {
	getRulesWithType: function(rules, type) {
		let rulesArray = [];
		for (var rule of rules) {
			if (rule.action.type == type) {
				rulesArray.push(getStringRule(rule));
			}
		}
		return rulesArray
	}
};