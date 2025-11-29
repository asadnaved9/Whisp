const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,// user id
        ref: "user",
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user" }// the id of user who liked it
    ]
})

module.exports = mongoose.model('post', postSchema); 