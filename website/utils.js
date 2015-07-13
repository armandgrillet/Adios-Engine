'use strict';

var container;

function displayUpdater(userInfo) {
	document.getElementById('updater').style.display = 'block';
	document.getElementById('user').innerText = userInfo.userRecordName;
}

function hideUpdater() {
	document.getElementById('updater').style.display = 'none';
}

function update(info) {
	console.log(info);
	var record = {
		recordName: 'Yo',
		recordType: 'Lists'
	};
  container.publicCloudDatabase.saveRecord(record).then(function(response) {
    	if(response.hasErrors) {
    		console.log(response.errors[0]);
    	}
  	});
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

function init() {
	CloudKit.configure({
      containers: [{

        // Change this to a container identifier you own.
        containerIdentifier: 'iCloud.AG.Adios.List',

        // And generate an API token through CloudKit Dashboard.
        apiToken: '31e0b2d6eb84ef68476dd53b993b6480d51bf576612cd6a084affbb9e990e0de',

        environment: 'development'
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