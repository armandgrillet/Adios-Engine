'use strict';

var container;

function displayUpdater(userInfo) {
	document.getElementById('updater').style.display = 'block';
	document.getElementById('user').innerText = userInfo.userRecordName;
}

function hideUpdater() {
	document.getElementById('updater').style.display = 'none';
}

function constructRule(listName, data) {
	var rule = { recordType: 'Rules' };
	var fieldsValue = {
		ActionType: { value: data.action.type },
		TriggerFilter: { value: data.trigger['url-filter'] },
		List: { value: { recordName: listName, action: 'DELETE_SELF' }}
	};

	if (data.action.selector != null) {
		fieldsValue.ActionSelector = { value: data.action.selector };
	}

	if (data.trigger['url-filter-is-case-sensitive'] != null) {
		fieldsValue.TriggerFilterCaseSensitive = { value: data.trigger['url-filter-is-case-sensitive'] };
	}

	if (data.trigger['if-domain'] != null) {
		fieldsValue.TriggerIfDomain = { value: data.trigger['if-domain'] };
	}

	if (data.trigger['unless-domain'] != null) {
		fieldsValue.TriggerUnlessDomain = { value: data.trigger['unless-domain'] };
	}

	if (data.trigger['load-type'] != null) {
		fieldsValue.TriggerLoadType = { value: data.trigger['load-type'] };
	}

	if (data.trigger['resource-type'] != null) {
		fieldsValue.TriggerResourceType = { value: data.trigger['resource-type'] };
	}

	rule.fields = fieldsValue;
	console.log(rule);
	return rule;
}

function update(info) {
	var updates = JSON.parse(info);
	document.getElementById('log').innerText = updates.log;

	if (updates.lists !== undefined) {
		var operations = container.publicCloudDatabase.newRecordsBatch();
		// var i = 0;
		// for (i = 0; i < updates.lists.length; i++) {
		// 	var modifications = updates[updates.lists[i]];
		// 	var modif;
		// 	for (modif in modifications.added) {
		// 		operations.create(constructRule(updates.lists[i], modifications.added[modif]));
		// 	}
		// 	for (modif in modifications.removed) {
		// 		operations.delete(constructRule(updates.lists[i], modifications.removed[modif]));
		// 	}
		// }
		// operations.create({recordType: 'Rules', fields: {ActionType: {value: "block"}, TriggerFilter: {value: "\.com/eeazrearzezr3lanat/"}, List: {value: "AdiosList"}}});
		operations.create({
			recordType: 'Rules',
			fields: {
				ActionType: {
					value: 'block'
				},
				TriggerFilter: {
					value: '\.com/e3lfsdsregfan/'
				},
				List: {
					value: {
						recordName: 'AdiosList',
						action: 'DELETE_SELF'
					}
				},
				TriggerIfDomain: {
					value: ['yo.com']
				}
			}
		});
		// operations.create({
		// 	recordType: 'Rules',
		// 	fields: {
		// 		ActionType: {
		// 			value: 'block'
		// 		}
		// 	}
		// });
		operations.commit().then(function(response) {
			console.log('Yo');
			if(response.hasErrors) {
				console.log(response.errors[0]);
			}
		});
	}
}

function getUpdates() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
			update(xmlHttp.responseText);
		}
	};
    xmlHttp.open( 'GET', '/update', true );
    xmlHttp.send( null );
}

function init(configuration) {
	var config = JSON.parse(configuration);

	CloudKit.configure({
      containers: [{

        // Change this to a container identifier you own.
        containerIdentifier: config.containerIdentifier,

        // And generate an API token through CloudKit Dashboard.
        apiToken: config.apiToken,

        environment: config.environment
      }]
    });
    container = CloudKit.getDefaultContainer();
    container.setUpAuth();
    container.whenUserSignsIn().then(function(userInfo) {
		if(userInfo) {
			displayUpdater(userInfo);
		} else {
			hideUpdater();
		}
    });
    container.whenUserSignsOut().then(hideUpdater);
    document.getElementById('update').onclick = getUpdates;
}

function configureCloudKit() {
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
			init(xmlHttp.responseText);
		}
	};
    xmlHttp.open( 'GET', '/cloudkit', true );
    xmlHttp.send( null );
}