'use strict';

var container;
var serverUpdate;

function displayUpdater() {
	document.getElementById('update').style.display = 'block';
}

function hideUpdater() {
	document.getElementById('update').style.display = 'none';
}

function getRulesetsForList(list, callback) {
	var query = {
		recordType: 'Rulesets', 
		filterBy: [
			{ comparator: 'EQUALS', fieldName: 'List', fieldValue: { value: { recordName: list, action: 'DELETE_SELF' } }}
		]
	};
	container.publicCloudDatabase.performQuery(query).then(function(response) {
        if(response.hasErrors) {
          document.getElementById('log').innerText += response.errors[0] + '\n';
        } else {
			var records = response.records;
			if (records.length !== 4) {
				document.getElementById('log').innerText += records.length + ' records found for ' + data + '\n';
			} else {
				var results = [];
				for (var record of records) {
					results.push({
						name: record.recordName,
						changeTag: record.recordChangeTag
					})
				}
				callback(results);
			}
		}
	});
}

function updateVersion(callback) {
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
				var batch = container.publicCloudDatabase.newRecordsBatch();
				var record = {
				    recordType: 'Updates',
				    recordName : 'TheOneAndOnly',
				    recordChangeTag: records[0].recordChangeTag,
				    fields: { Version: { 'value': records[0].fields.Version.value + 1 }}
				}
				batch.update(record);
				batch.commit().then(function(response) {
					document.getElementById('log').innerText += 'Version updated';
				});
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

function updateRulesets(update, batch) {
	var list = update.lists.shift();
	getRulesetsForList(list, function(rulesets) {
		for (var ruleset of rulesets) {
			if (update[ruleset] != undefined) {
				var newRuleset = {
				    recordType: 'Rulesets',
				    recordName : ruleset.recordName,
				    recordChangeTag: ruleset.recordChangeTag,
				    fields: { Rules: { 'value': update[ruleset] }}
				}
				batch.update(newRuleset);
			}
			if (update.lists !== []) {
				callback(update, batch);
			} else {
				commit(batch);
			}
		}
	});
}

function createRulesets(update) {
	var batch = container.publicCloudDatabase.newRecordsBatch();
	for (var list of update.lists) {
		for (var type of ['Block', 'BlockCookies', 'CSSDisplayNone', 'IgnorePreviousRules']) {
			var ruleset = {
				recordName: (list + type),
				recordType: 'Rulesets',
				fields: {
					Rules: { value: update[list + type].rules },
					List: {
						value: { recordName: list, action: 'DELETE_SELF' }
					}
				}
			};
			batch.create(ruleset);
		}
	}
	commit(batch);
}

function commit(batch) {
	console.log('On commit le btach');
	console.log(batch);
	batch.commit().then(function(response) {
		if(response.hasErrors) {
			document.getElementById('log').innerText += 'Error for operation ' + list + '\n';
			document.getElementById('log').innerText += response.errors[0];
		} else {
			updateVersion(function() {
				document.getElementById('log').innerText += 'Successful upload to CloudKit';
			});
		}
	});
}

function getUpdates() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
			var updates = JSON.parse(xmlHttp.responseText);
			document.getElementById('log').innerText = updates.log;
			console.log(updates);
			if (updates.lists !== undefined && updates.lists !== []) {
				createRulesets(updates);
				// updateRulesets(updates, container.publicCloudDatabase.newRecordsBatch())
			}
		}
	};
    xmlHttp.open( 'GET', '/update', true );
    xmlHttp.send( null );
}

function gotoAuthenticatedState(userInfo) {
    container.whenUserSignsOut().then(gotoUnauthenticatedState);
}

function gotoUnauthenticatedState(error) {
    if(error && error.ckErrorCode === 'AUTH_PERSIST_ERROR') {
      	showDialogForPersistError();
    }
    
    container.whenUserSignsIn().then(gotoAuthenticatedState).catch(gotoUnauthenticatedState);
}

function init(configuration) {
	var config = JSON.parse(configuration);

	CloudKit.configure({
      	containers: [{
        	containerIdentifier: config.containerIdentifier,
        	apiToken: config.apiToken,
        	environment: config.environment,
        	auth: {
	            persist: true
	        }
      	}]
    });
    container = CloudKit.getDefaultContainer();
    container.setUpAuth().then(function(userInfo) {
      if(userInfo) {
        gotoAuthenticatedState(userInfo);
      } else {
        gotoUnauthenticatedState();
      }
    });
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