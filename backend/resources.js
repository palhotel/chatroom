//restful api
var Q = require('q');
function resources(chatService, config, logger, Base64) {


	var getAllUsers = function (req, res) {
		chatService.getAllUsers()
			.then(function(data){
				res.send(data);
			})
			.catch(function(e){
				throw err;
			})
			.done();
	};

	var getMatchUser = function (req, res) {
		if (global.appRuntime.onlineUserCount >= config.MAX_USERS) {
			res.send({login: false, overMaxUsers: true});
		} else {
			var auth = req.headers.authorization;
			var text = Base64.decode(auth.split('Basic ')[1]);
			var nameAndPass = text.split(':');
			chatService.getMatchUser(nameAndPass[0], nameAndPass[1].replace(config.SALT, ""))
				.then(function(data){
					data.token = auth;
					res.status(200).send(data);
				})
				.catch(function(e){
					logger.error(e);
					res.sendStatus(403);
				})
				.done();
		}
	};

	var getUserById = function (req, res) {
		chatService.getUserById(req.params.id)
			.then(function(data){
				res.send(data)
			})
			.catch(function(e){
				logger.error(e)
			})
			.done();
	};

	var addUser = function (req, res) {
		chatService.addUser(req.body)
			.then(function(data){
				res.send(data);
			})
			.catch(function(err){
				res.sendStatus(500);
				logger.error(err);
			})
			.done();
	};

	var getMessageById = function (req, res) {
		chatService.getMessageById(req.params.id)
			.then(function(data){
				res.send(data);
			})
			.catch(function(err){
				logger.error(err);
			})
			.done();
	};

	var getMessages = function (req, res) {
		chatService.getMessages()
			.then(function(data){
				res.send(data);
			})
			.catch(function(err){
				logger.error(err);
			})
			.done();
	};

	var addMessage = function (req, res) {
		logger.error("cetc#:", req, req.body);
		chatService.addMessage(req.body)
			.then(function(data){
				res.send(data);
			})
			.catch(function(err){
				logger.error(err);
			})
			.done();
	};

	var userLogOut = function (req, res) {
		chatService.userLogOut(req.body.name, req.body.password)
			.then(function(){
				res.sendStatus(204);
			})
			.catch(function(err){
				logger.error(err);
				res.sendStatus(404);
			})
			.done();
	};

	var getPaint = function (req, res) {
		chatService.getPaint()
			.then(function(data){
				res.send(data);
			})
			.catch(function(err){
				logger.error(err);
			})
			.done();
	};

	var savePaint = function (req, res) {
		chatService.savePaintToMemory(req.body.pic);
		res.sendStatus(200);
	};

	return {
		savePaint: savePaint,
		getPaint: getPaint,
		userLogOut: userLogOut,
		addMessage: addMessage,
		getMessages: getMessages,
		getMessageById: getMessageById,
		addUser: addUser,
		getUserById: getUserById,
		getMatchUser: getMatchUser,
		getAllUsers: getAllUsers
	};
}

module.exports = resources;
