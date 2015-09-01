function routes(app, resources){
    app.get('/api/users', resources.getAllUsers);
    app.get('/api/users/:id', resources.getUserById);
    app.post('/api/users', resources.addUser);

    app.post('/api/security/userlogin', resources.getMatchUser);
    app.post('/api/security/userlogout', resources.userLogOut);

    app.get('/api/messages', resources.getMessages);
    app.get('/api/messages/:id', resources.getMessageById);
    app.post('/api/messages', resources.addMessage);

    app.get('/api/paint', resources.getPaint);
    app.put('/api/paint,', resources.savePaint);
}

module.exports = routes;
