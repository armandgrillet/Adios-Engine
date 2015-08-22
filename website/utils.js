'use strict';

var container;
var serverUpdate;

function displayUpdater() {
	document.getElementById('update').style.display = 'block';
}

function hideUpdater() {
	document.getElementById('update').style.display = 'none';
}

function addDataToRule(rule, data) {
	rule.fields.ActionType = { value: data.action.type };

	if (data.action.selector != null) {
		rule.fields.ActionSelector = { value: data.action.selector };
	}

	rule.fields.TriggerUrlFilter = { value: data.trigger['url-filter'] };

	if (data.trigger['url-filter-is-case-sensitive'] === true) {
		rule.fields.TriggerUrlFilterIsCaseSensitive = { value: 1 };
	}

	if (data.trigger['if-domain'] != null) {
		rule.fields.TriggerIfDomain = { value: data.trigger['if-domain'] };
	}

	if (data.trigger['unless-domain'] != null) {
		rule.fields.TriggerUnlessDomain = { value: data.trigger['unless-domain'] };
	}

	if (data.trigger['load-type'] != null) {
		rule.fields.TriggerLoadType = { value: data.trigger['load-type'] };
	}

	if (data.trigger['resource-type'] != null) {
		rule.fields.TriggerResourceType = { value: data.trigger['resource-type'] };
	}

	return rule;
}

function createDeletedRule(listName, creationUpdate, data) {
	var deletedRule = {
		recordType: 'DeletedRules',
		fields: {
			CreationUpdate: { value: creationUpdate },
			Update: { value: (serverUpdate + 1) },
			List: {
				value: { recordName: listName, action: 'DELETE_SELF' }
			}
		}
	};

	rule = addDataToRule(rule, data);
	return rule;
}

function createRule(listName, data) {
	var rule = {
		recordType: 'Rules',
		fields: {
			Update: { value: (serverUpdate + 1) },
			List: {
				value: { recordName: listName, action: 'DELETE_SELF' }
			}
		}
	};

	rule = addDataToRule(rule, data);
	return rule;
}

function createFilter(filterName, filterValue) {
	return { comparator: 'EQUALS', fieldName: filterName, fieldValue: { value: filterValue }};
}

function updateVersion(callback) {
	getUpdateVersion(function(version, changeTag) {
		var batch = container.publicCloudDatabase.newRecordsBatch();
		var record = {
		    recordType: 'Updates',
		    recordName : 'TheOneAndOnly',
		    recordChangeTag: changeTag,
		    fields: { Version: { 'value': version + 1 }}
		}
		batch.update(record);
		batch.commit().then(function(response) {
			callback();
		});
	});
}

function getRule(listName, data, callback) {
	var query = {recordType: 'Rules', filterBy: []};
	query.filterBy.push(createFilter('ActionType', data.action.type));
	query.filterBy.push(createFilter('TriggerUrlFilter', data.trigger['url-filter']));
	query.filterBy.push(createFilter('List', { recordName: listName, action: 'DELETE_SELF' }));

	if (data.action.selector != null) {
		query.filterBy.push(createFilter('ActionSelector', data.action.selector));
	}

	if (data.trigger['url-filter-is-case-sensitive'] === true) {
		query.filterBy.push(createFilter('TriggerUrlFilterIsCaseSensitive', 1));
	}

	if (data.trigger['if-domain'] != null) {
		query.filterBy.push(createFilter('TriggerIfDomain', data.trigger['if-domain']));
	}

	if (data.trigger['unless-domain'] != null) {
		query.filterBy.push(createFilter('TriggerUnlessDomain', data.trigger['unless-domain']));
	}

	if (data.trigger['load-type'] != null) {
		query.filterBy.push(createFilter('TriggerLoadType', data.trigger['load-type']));
	}

	if (data.trigger['resource-type'] != null) {
		query.filterBy.push(createFilter('TriggerResourceType', data.trigger['resource-type']));
	}

	container.publicCloudDatabase.performQuery(query).then(function(response) {
        if(response.hasErrors) {
          document.getElementById('log').innerText += response.errors[0] + '\n';
        } else {
			var records = response.records;
			if (records.length !== 1) {
				document.getElementById('log').innerText += records.length + ' records found for ' + data + '\n';
			} else {
				callback(records[0].recordName, records[0].fields.Update.value, records[0].recordChangeTag);
			}
		}
	});
}

function commit(operations, operationNumber) {
	operations[operationNumber].commit().then(function(response) {
		if(response.hasErrors) {
			document.getElementById('log').innerText += 'Error for operation ' + operationNumber + '\n';
			document.getElementById('log').innerText += response.errors[0];
		} else {
			if (operationNumber === (operations.length - 1)) { // We're done with this update.
				updateVersion(function() {
					document.getElementById('log').innerText += 'Successful upload to CloudKit';
				});
			} else {
				commit(operations, operationNumber + 1);
			}
		}
	});
}

function getUpdateVersion(callback) {
	var query = {recordType: 'Updates', filterBy: []};
	//query.filterBy.push(createFilter('recordName', 'TheOneAndOnly'));
	container.publicCloudDatabase.performQuery(query).then(function(response) {
        if(response.hasErrors) {
          document.getElementById('log').innerText += response.errors[0] + '\n';
        } else {
			var records = response.records;
			if (records.length !== 1) {
				document.getElementById('log').innerText += records.length + ' records found for ' + data + '\n';
			} else {
				serverUpdate = records[0].fields.Version.value;
				callback(records[0].fields.Version.value, records[0].recordChangeTag);
			}
		}
	});
}

var maxOperationsPerBatch = 190;
function update(updates, operations, operationType, currentList, numberOfRulesAlreadyDeleted, generalUpdate) {
	if (operationType === 'delete') {
		console.log('We remove one rule');
		getRule(updates.lists[currentList], updates[updates.lists[currentList]].deleted[numberOfRulesAlreadyDeleted], function(name, creationUpdate, changeTag) { // We're getting the record's name of the rule to delete.
			console.log('On a la règle avec nom ' + name);
			if (generalUpdate % maxOperationsPerBatch === 0) { // No more than 190 rules per records' batch.
				console.log('On créer le batch');
				operations.push(container.publicCloudDatabase.newRecordsBatch());
			}
			operations[Math.floor(generalUpdate / maxOperationsPerBatch)].delete({ recordName: name, recordChangeTag: changeTag }); // Adding the rule to delete to the bach, it's a really simple record with just the record's name.
			generalUpdate++;
			// If we delete a rule we need to create the DeletedRule.
			operations[Math.floor(generalUpdate / maxOperationsPerBatch)].create(createDeletedRule(updates.lists[currentList], creationUpdate, modifications.created[modif])); // Adding the rule to the batch.
			generalUpdate++;
			numberOfRulesAlreadyDeleted++;

			if (numberOfRulesAlreadyDeleted < updates[updates.lists[currentList]].deleted.length) { // Still rules to delete
				update(updates, operations, 'delete', currentList, numberOfRulesAlreadyDeleted, generalUpdate);
			} else {
				if (updates[updates.lists[currentList]].created.length > 0) { // There is rules to add, let's do it.
					update(updates, operations, 'create', currentList, 0, generalUpdate);
				} else if (currentList < (updates.lists.length - 1)) { // There is other lists.
					if (updates[updates.lists[currentList + 1]].deleted.length > 0) {
						update(updates, operations, 'delete', (currentList + 1), 0, generalUpdate);
					} else {
						update(updates, operations, 'create', (currentList + 1), 0, generalUpdate);
					}
				} else {
					commit(operations, 0);
				}
			}
		});
	} else if (operationType === 'create') {
		var modifications = updates[updates.lists[currentList]]; // We're getting the current list because adding rules is synchrnous so we'll do everything at once.
		var modif;
		for (modif in modifications.created) { // For each rule.
			if (generalUpdate % maxOperationsPerBatch === 0) { // No more than 190 rules per records' batch.
				operations.push(container.publicCloudDatabase.newRecordsBatch());
			}

			operations[Math.floor(generalUpdate / maxOperationsPerBatch)].create(createRule(updates.lists[currentList], modifications.created[modif])); // Adding the rule to the batch.
			generalUpdate++;
		}

		if (currentList < (updates.lists.length - 1)) { // There is other lists.
			console.log('There is other lists');
			if (updates[updates.lists[currentList + 1]].deleted.length > 0) { // In the next list we need to delete rules.
				console.log('We need to delete rules in the next list');
				update(updates, operations, 'delete', (currentList + 1), 0, generalUpdate);
			} else { // We need to create rules in the next list.
				console.log('We need to create rules in the next list');
				update(updates, operations, 'create', (currentList + 1), 0, generalUpdate);
			}
		} else {
			commit(operations, 0); // No more rules, we commit.
		}
	}
}

function getUpdates() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
			var updates = JSON.parse(xmlHttp.responseText);
			document.getElementById('log').innerText = updates.log;
			console.log(updates);
			if (updates.lists !== undefined) {
				getUpdateVersion(function() {
					if (updates[updates.lists[0]].deleted.length > 0) {
						console.log('We have some rules to remove');
						update(updates, [], 'delete', 0, 0, 0);
					} else {
						update(updates, [], 'create', 0, 0, 0);
					}
				});
			}
		}
	};
    xmlHttp.open( 'GET', '/update', true );
    xmlHttp.send( null );
}

function init(configuration) {
	var config = JSON.parse(configuration);

	CloudKit.configure({
      	containers: [{
        	containerIdentifier: config.containerIdentifier,
        	apiToken: config.apiToken,
        	environment: config.environment
      	}]
    });
    container = CloudKit.getDefaultContainer();
    container.setUpAuth();
    container.whenUserSignsIn().then(function(userInfo) {
		if(userInfo) {
			displayUpdater();
		} else {
			hideUpdater();
		}
    });
    container.whenUserSignsOut().then(hideUpdater);
    document.getElementById('update').onclick = getUpdates;
}

window.addEventListener('cloudkitloaded', function() {
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
			init(xmlHttp.responseText);
		}
	};
    xmlHttp.open( 'GET', '/cloudkit', true );
    xmlHttp.send( null );
});