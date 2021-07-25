const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeSchema = new Schema({
    userId: { //userId of Twitch user
        type: String,
        required: true
    },
    broadcasterId: {//userId of stream being watched
        type: String,
        required: true
    },
    timeWatched: {//time watched in minutes
        type: String, //Cannot send numbers in express!
        required: true
    }
}, { timestamps: true });

const TimeInfo = mongoose.model("timeinfo", timeSchema); //look for timeinfos collection
module.exports = TimeInfo;