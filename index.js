'use strict';

var express = require('express');
var path = require('path');
var wwwhisper = require('connect-wwwhisper');

var updater = require('./utils/updater');

require('dotenv').load();

var app = express();
app.set('port', 5000);
app.use(wwwhisper());
app.use(express.static(__dirname + '/mui'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(req, response) {
    response.sendFile(path.join(__dirname + '/mui/index.html'));
});

app.use('/update', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
    updater.getUpdates(function(data) {
		res.send(data);
    });
});

