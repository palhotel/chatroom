//setup sqlite3 database, try to use memory dabase in the future
var SQL_CONFIG = require('./sql.json');
var LOG_FILE = 'logs/access.log.default';
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

fs.exists(SQL_CONFIG.PATH, function(result){
	if(result !== true){

		var db = new sqlite3.Database(SQL_CONFIG.PATH);
		var tables = SQL_CONFIG.TABLES;
		db.serialize(function() {
			db.run(tables.USERS.join(''));
			db.run(tables.CHATS.join(''));
			db.run(SQL_CONFIG.INIT[0]);
		});
		db.close();
		console.log('create database at ' + SQL_CONFIG.PATH)

	} else {
		console.log(result,'no need to setup database at '+ SQL_CONFIG.PATH);
	}
});

fs.exists(LOG_FILE, function(result){
	if(result !== true) {
		fs.renameSync(LOG_FILE, 'logs/access.log');
	}
});
