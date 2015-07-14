'use strict';

require('dotenv').load();

module.exports = {
	getConfig: function(callback) {
		callback({'containerIdentifier': process.env.CK_CONTAINER_ID, 'apiToken': process.env.CK_API_TOKEN, 'environment': process.env.ENVIRONMENT});
	}
};
