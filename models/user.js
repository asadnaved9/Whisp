const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");


// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    posts: [//arrays of _ids
        {
            type: mongoose.Schema.Types.ObjectId, ref: "post"
        }
    ]  
})

module.exports = mongoose.model('user', userSchema);