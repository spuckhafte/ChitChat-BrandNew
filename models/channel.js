const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    messages: {
        type: String
    },
    names: {
        type: String
    }
});

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;