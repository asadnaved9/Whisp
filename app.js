const express = require('express');
const app = express();

const userModel = require("./models/user");
const postModel = require("./models/post");

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) =>{
    res.render("index");
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/register', async (req, res) =>{// On submitting the form we will go to /register route
    let {email, name, username, password, age} = req.body;// By this we are destructuring the user details by using req.body

    let user = await userModel.findOne({email});// We will find if the user already exists or not
    if(user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10, (err, salt) => {// this will generate some salt value(encrypted)
        bcrypt.hash(password, salt, async (err, hash) =>{// By the help of hash the password will be encrypted
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password: hash,
            });

            // User aa chuka hai ab token bhjna hai
            let token = jwt.sign({ email: email, userid: user._id}, "shh");// shh is a secret key
            res.cookie("token", token);// we have set the token 
            res.send('registered');
        })
    })
})

app.post('/login', async (req, res) =>{// On submitting the form we will redirected to /login route
    let {email, password} = req.body;// email and password which are written in the form field will be captured by req.body
    
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, (err, result) => {// here password is new pass(which rn in given), user.password means the old and actual pass 
        if(result) res.status(200).send("You can login");// if the new password is and the old password is true Login sucessfully.
        res.redirect('/login');
    })
})

app.get('/logout', (req, res) => {
    res.cookie("token", "");// Basically to logout we have to empty the token in cookie 
    res.redirect("login");
})


app.listen(3000);