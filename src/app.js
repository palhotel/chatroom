(function () {
    var createApp = Vue.createApp;

    function request(url, options) {
        return fetch(url, options).then(function (res) {
            if (!res.ok && res.status !== 204) {
                throw new Error('Request failed: ' + res.status);
            }
            if (res.status === 204) {
                return null;
            }
            return res.json();
        });
    }

    createApp({
        data: function () {
            return {
                title: 'PalChatRoom',
                statusMessage: '欢迎来到聊天室，请先登录。',
                inputName: '',
                inputPass: '',
                inputMessage: '',
                alreadyLogin: false,
                me: {
                    id: '',
                    name: 'Me'
                },
                users: [],
                chats: [],
                socket: null
            };
        },
        computed: {
            onlineUsers: function () {
                return this.users.filter(function (user) {
                    return user.online === 1;
                });
            }
        },
        mounted: function () {
            var self = this;
            self.socket = io();
            self.bindSocketEvents();
            self.refreshAll();
        },
        methods: {
            bindSocketEvents: function () {
                var self = this;
                ['server:someone-login', 'server:someone-logout', 'server:someone-sent'].forEach(function (eventName) {
                    self.socket.on(eventName, function () {
                        self.refreshAll();
                    });
                });
            },
            refreshAll: function () {
                var self = this;
                self.fetchUsers();
                self.fetchMessages();
            },
            fetchUsers: function () {
                var self = this;
                request('/api/users').then(function (users) {
                    self.users = users || [];
                }, function () {
                    self.statusMessage = '加载用户列表失败。';
                });
            },
            fetchMessages: function () {
                var self = this;
                request('/api/messages').then(function (messages) {
                    self.chats = (messages || []).slice(-100);
                    self.$nextTick(function () {
                        var panel = self.$refs.messagePanel;
                        if (panel) {
                            panel.scrollTop = panel.scrollHeight;
                        }
                    });
                }, function () {
                    self.statusMessage = '加载消息失败。';
                });
            },
            login: function () {
                var self = this;
                if (!self.inputName || !self.inputPass) {
                    self.statusMessage = '请输入用户名和密码。';
                    return;
                }
                request('/api/security/userlogin', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: self.inputName,
                        password: self.inputPass
                    })
                }).then(function (result) {
                    if (result && result.login) {
                        self.alreadyLogin = true;
                        self.me.id = result.userId;
                        self.me.name = self.inputName;
                        self.statusMessage = '登录成功，开始聊天吧。';
                        self.socket.emit('user:login', result.userId);
                        self.refreshAll();
                        return;
                    }
                    self.statusMessage = result && result.overMaxUsers ? '聊天室已满员。' : '用户名或密码错误。';
                }, function () {
                    self.statusMessage = '登录失败，请稍后再试。';
                });
            },
            logout: function () {
                var self = this;
                if (!self.alreadyLogin) {
                    return;
                }
                request('/api/security/userlogout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: self.inputName,
                        password: self.inputPass
                    })
                }).then(function () {
                    self.socket.emit('user:logout');
                    self.alreadyLogin = false;
                    self.statusMessage = '你已退出登录。';
                    self.refreshAll();
                }, function () {
                    self.socket.emit('user:logout');
                    self.alreadyLogin = false;
                    self.statusMessage = '你已退出登录。';
                    self.refreshAll();
                });
            },
            send: function () {
                var self = this;
                var message = self.inputMessage.trim();
                if (!self.alreadyLogin) {
                    self.statusMessage = '登录后才能发送消息。';
                    return;
                }
                if (!message) {
                    return;
                }
                request('/api/messages', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        from_id: self.me.id,
                        message: message,
                        date: new Date().toISOString()
                    })
                }).then(function () {
                    self.inputMessage = '';
                    self.socket.emit('user:send-message');
                    self.fetchMessages();
                }, function () {
                    self.statusMessage = '发送失败，请重试。';
                });
            },
            keyDownHandler: function (event) {
                if (event.ctrlKey && event.key === 'Enter') {
                    event.preventDefault();
                    this.send();
                }
            },
            formatDate: function (dateValue) {
                var date = new Date(dateValue);
                if (isNaN(date.getTime())) {
                    return dateValue;
                }
                return date.toLocaleString();
            }
        }
    }).mount('#app');
})();
