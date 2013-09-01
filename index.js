var request = require('request'),
	drib = require('./drib.js'),
	rateLimit = require('function-rate-limit');

global.mysql      = require('mysql');
global._ = require('underscore');
global.connection = mysql.createConnection({
  host     : 'localhost',
  database : 'drib',
  user     : 'drib',
  password : 'drib',
});
connection.connect();

var setupFeed = function(delay, list){
	console.log('Setup feed for %s', list);
	setTimeout(function(){
		setInterval(function(){
			drib.refreshList(list);
		}, 30 * 60 * 1000);
		drib.refreshList(list);
	}, delay * 60 * 1000);
};

setupFeed(0, 'debuts');
setupFeed(5, 'everyone');
setupFeed(15, 'popular');

setTimeout(function(){

	setInterval(function(){
		drib.refreshShots();
	}, 30 * 60 * 1000);

}, 20 * 60 * 1000);

//drib.refreshShots();
