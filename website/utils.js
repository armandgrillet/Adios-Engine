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
	var updates = JSON.parse(info);
	document.getElementById('log').innerText = updates.log;

	var operation = container.publicCloudDatabase.newRecordsBatch();

	var lists = [
			'AdiosList',
			'EasyPrivacy',
			'AdblockWarningRemoval',
			'EasyList_France',
			'EasyList_Germany',
			'EasyList_Italy',
			'EasyList_Dutch',
			'EasyList_China',
			'EasyList_Bulgaria',
			'EasyList_Indonesia',
			'EasyList_Arabic',
			'EasyList_Czechoslovakia',
			'EasyList_Hebrew',
			'EasyList_SocialMedia',
			'EasyList_Latvia',
			'EasyList_Romania',
			'EasyList_Russia',
			'EasyList_Iceland',
			'EasyList_Greece',
			'EasyList_Poland',
			'List_Japan',
			'List_Estonia',
			'List_Hungary',
			'List_Danish',
			'List_England'
		];

	for (var i in lists) {
		operation.create({recordName: lists[i], recordType: 'Lists'});
	}
	operation.commit().then(function(response) {
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