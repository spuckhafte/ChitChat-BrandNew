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

let users = {} // { socket.id: 'name' }
const dbUrl = require('./secret')
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(dbUrl, connectionParams).then(() => {
    console.info('Connected to Db')
}).catch(e => {
    console.log('Error: ' + e)
})

// let channelModel = new ChannelModel();
// channelModel.messages = "{'rakshit': 'hi'}"
// channelModel.save((err, data) => {
//     if (err)
//         console.error(err)
//     else
//         console.log('inserted')
// })

function readDb(incoming) {
    ChannelModel.findOne((err, data) => {
        if (err) console.log(err)
        else {
            const msgs = data.messages;
            incoming(msgs)
        }
    })
}

function updateDb(data) {
    readDb(prevMsgData => {
        const prevData = JSON.parse(prevMsgData);
        const updatedData = { ...prevData, ...data }
        ChannelModel.findByIdAndUpdate(
            '62cd7222a12732b600c87c55',
            { messages: JSON.stringify(updatedData) },
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
        io.emit('update-online', Object.values(users), username);
        readDb(prevMsgData => {
            socket.emit('load-prev-msg', prevMsgData);
        })
    })

    socket.on('msg-from-client', (msg, username) => {
        io.emit('msg-of-user', msg, username, socket.id);
    })

    socket.on('update-db', msgData => {
        const exportData = new Object();
        exportData[uuid()] = msgData;
        updateDb(exportData);
    })

    socket.on('fire-join-msg', username => {
        io.emit('send-join-msg', username);
    })

    socket.on('disconnect', () => {
        let username = users[socket.id]
        delete users[socket.id];
        socket.broadcast.emit('update-online', Object.values(users));
        io.emit('user-left', username);
    })
})

http.listen(port, () => console.log('Listening on port ' + port))

