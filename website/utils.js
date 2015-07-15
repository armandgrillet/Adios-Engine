'use strict';

var container;

function displayUpdater(userInfo) {
	document.getElementById('update').style.display = 'block';
}

function hideUpdater() {
	document.getElementById('update').style.display = 'none';
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

	if (data.trigger['url-filter-is-case-sensitive'] === true) {
			fieldsValue.TriggerFilterCaseSensitive = { value: 1 };
	}

	if (data.trigger['if-domain'] != null) {
		console.log('If domain: ' + data.trigger['if-domain']);
		fieldsValue.TriggerIfDomain = { value: data.trigger['if-domain'] };
	}

	if (data.trigger['unless-domain'] != null) {
		console.log('Unless domain: ' + data.trigger['unless-domain']);
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

function commit(operations, operationNumber) {
	operations[operationNumber].commit().then(function(response) {
		if(response.hasErrors) {
			document.getElementById('log').innerText += 'Error for operation ' + operationNumber + '\n';
			document.getElementById('log').innerText += response.errors[0];
		} else {
			if (operationNumber === (operations.length - 1)) {
				document.getElementById('log').innerText += 'Successful upload to CloudKit';
			} else {
				commit(operations, operationNumber + 1);
			}
		}
	});
}

function update(info) {
	var updates = JSON.parse(info);
	document.getElementById('log').innerText = updates.log;

	if (updates.lists.length > 0) {
		var operations = [];
		var i;
		var operationNumber = 0;
		var maxOperationsPerBatch = 190;
		var modifications;
		var modif;
		for (i = 0; i < updates.lists.length; i++) {
			modifications = updates[updates.lists[i]];
			for (modif in modifications.added) {
				if (operationNumber % maxOperationsPerBatch === 0) {
					operations.push(container.publicCloudDatabase.newRecordsBatch());
				}
				operations[Math.floor(operationNumber / maxOperationsPerBatch)].create(constructRule(updates.lists[i], modifications.added[modif]));
				operationNumber++;
			}
			for (modif in modifications.removed) {
				if (operationNumber % maxOperationsPerBatch === 0) {
					operations.push(container.publicCloudDatabase.newRecordsBatch());
				}
				operations[Math.floor(operationNumber / maxOperationsPerBatch)].delete(constructRule(updates.lists[i], modifications.removed[modif]));
				operationNumber++;
			}
		}
		commit(operations, 0);
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