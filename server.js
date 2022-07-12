const http = require('http').createServer();
const mongoose = require('mongoose');
const ChannelModel = require('./models/channel')
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const port = process.env.PORT || 3000;


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
// channelModel.names = "['test']"
// channelModel.save((err, data) => {
//     if (err)
//         console.error(err)
//     else
//         console.log('inserted')
// })

function readDb() {
    ChannelModel.findOne((err, data) => {
        if (err) console.log(err)
        else console.log(data.messages)
    })
}

function updateDb(data) {
    ChannelModel.findOneAndUpdate(
        '62cc4b9bd78851ef10918e58',
        data,
        (err, data) => {
            if (err) console.error(err);
            else console.log(data)
        }
    )
}


io.on('connection', socket => {
    console.log('connected ' + socket.id);
    socket.on('user-connect', username => {
        users[socket.id] = username;
        io.emit('update-online', Object.values(users), username);
        socket.broadcast.emit('send-join-msg', username);
    })

    socket.on('msg-from-client', (msg, username) => {
        io.emit('msg-of-user', msg, username, socket.id);
    })

    socket.on('update-db', msgData => {
        let author = msgData.author;
        delete msgData.author
        const exportData = {
            author: msgData
        }
        updateDb
    })

    socket.on('disconnect', () => {
        delete users[socket.id];
        socket.broadcast.emit('update-online', Object.values(users));
    })
})

http.listen(port, () => console.log('Listening on port ' + port))