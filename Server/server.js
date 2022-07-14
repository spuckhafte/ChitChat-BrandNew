const http = require('http').createServer();
const mongoose = require('mongoose');
const ChannelModel = require('../models/channel')
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const port = process.env.PORT || 3000;
const { v4: uuid } = require('uuid')

let users = {} // { socket.id: name }
const { dbUrl, messagesId, userInfoId } = require('./secret')
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

/*
 * messages : {
    id: {
        author,
        msg,
        data
    },
 }
 * userInfo: {
    id: {
        name,
        password
    }
 }
*/

mongoose.connect(dbUrl, connectionParams).then(() => {
    console.info('Connected to Db')
}).catch(e => {
    console.log('Error: ' + e)
})

function readDb(type, id, incoming) {
    ChannelModel.findById(id, (err, data) => {
        if (err) console.log(err)
        else {
            const msgs = data.messages;
            const userInfo = data.userInfo;
            if (type == 'messages') incoming(msgs);
            if (type == 'userInfo') incoming(userInfo);
        }
    })
}

function updateDb(type, data, id) {
    readDb(type, id, prevMsgData => {
        const prevData = JSON.parse(prevMsgData);
        const updatedData = { ...prevData, ...data }

        const shipData = {}
        shipData[type] = JSON.stringify(updatedData)

        ChannelModel.findByIdAndUpdate(
            id,
            shipData,
            (err, data) => {
                if (err) console.error(err);
                else console.log('db synced')
            }
        )
    })
}

io.on('connection', socket => {
    console.log('connected ' + socket.id);
    socket.on('user-connect', username => {
        users[socket.id] = username;
        io.emit('update-online', Object.values(users));
        readDb('messages', messagesId, prevMsgData => {
            socket.emit('load-prev-msg', prevMsgData, username);
        });
    })

    socket.on('msg-from-client', (msg, username) => {
        io.emit('msg-of-user', msg, username, socket.id);
    })

    socket.on('update-db', msgData => {
        const exportData = new Object();
        exportData[uuid()] = msgData;
        updateDb('messages', exportData, messagesId);
    });

    socket.on('fire-join-msg', username => {
        io.emit('send-join-msg', username);
    });

    socket.on('user-register', (name, password) => {
        readDb('userInfo', userInfoId, usersData => {
            usersData = JSON.parse(usersData);
            let alreadyIn = false;
            for (let user of Object.values(usersData)) {
                if (user.name == name) {
                    alreadyIn = true;
                    break;
                }
            }
            if (alreadyIn) socket.emit('registration-failed', name);
            else {
                const exportData = {};
                exportData[uuid()] = {
                    name,
                    password
                }
                updateDb('userInfo', exportData, userInfoId);
                socket.emit('registered', name);
            }
        });
    });

    socket.on('user-login', (name, password) => {
        readDb('userInfo', userInfoId, usersData => {
            usersData = JSON.parse(usersData);
            let validUser = false;
            for (let user of Object.values(usersData)) {
                if (user.name == name && user.password == password) {
                    validUser = true;
                    break;
                }
            }
            if (validUser) {
                let sessionAlreadyActive = false;
                let activeSessionId;
                for (let id of Object.keys(users)) {
                    if (name == users[id]) {
                        sessionAlreadyActive = true;
                        activeSessionId = id;
                        break;
                    }
                }
                if (!sessionAlreadyActive) socket.emit('logged-in', name);
                else socket.emit('session-running', activeSessionId);
            }
            else socket.emit('login-failed', name);
        });

        socket.on('end-session', sessionAddress => {
            io.emit('nuke-session', sessionAddress, socket.id);
        });

        socket.on('session-nuked', id => {
            io.emit('session-nuked', id);
        })
    })

    socket.on('disconnect', () => {
        let username = users[socket.id]
        delete users[socket.id];
        socket.broadcast.emit('update-online', Object.values(users));
        if (username) io.emit('user-left', username);
    });
})

http.listen(port, () => console.log('Listening on port ' + port))