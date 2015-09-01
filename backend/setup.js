//setup sqlite3 database
function setUpChatroom(sqlConfig, config, fs, sqlite3, logger){

	fs.exists(sqlConfig.PATH, function(result){
		if(result !== true){

			var db = new sqlite3.Database(sqlConfig.PATH);
			var tables = sqlConfig.TABLES;
			db.serialize(function() {
				db.run(tables.USERS.join(''));
				db.run(tables.CHATS.join(''));
				db.run(sqlConfig.INIT[0]);
			});
			db.close();
			logger.log('create database at ' + sqlConfig.PATH)

		} else {
			logger.log('no need to setup database at '+ sqlConfig.PATH);
		}
	});
}

module.exports = setUpChatroom;
