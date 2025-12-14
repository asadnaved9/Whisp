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

app.get('/profile', isLoggedIn, async (req, res) =>{ 
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("profile", {user});
})

app.get('/like/:id', isLoggedIn, async (req, res) =>{ 
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect("/feed");
})

app.get('/edit/:id', isLoggedIn, async (req, res) =>{ 
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    res.render("edit", {post})
})

app.post('/update/:id', isLoggedIn, async (req, res) =>{ 
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});
    res.redirect("/profile");
})

//Feed Section
app.get("/feed", isLoggedIn, async (req, res) => {
    const posts = await postModel.find()
        .populate("user")   // so we can show user info
        .sort({date: -1}); // newest first

    res.render("feed", { posts, user:req.user });
});



app.post('/post', isLoggedIn, async (req, res) =>{// isLoggedIn means post tb hi hoga jb app logged in ho.
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.body;

    let post = await postModel.create({
        user: user._id,
        content, // req.body se jo bhi content text area me rhega vo accessable hai
    });
    user.posts.push(post._id);// abb user ko batana hai ki post ki id kiya hai
    await user.save();// ye user me save kiye hai kyuki abhi humlog haath se kiye hai
    res.redirect("/profile");
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
            // res.redirect("/login");
            res.send("registerd")
        })
    })
})

app.post('/login', async (req, res) =>{// On submitting the form we will redirected to /login route
    let {email, password} = req.body;// email and password which are written in the form field will be captured by req.body
    
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, (err, result) => {// here password is new pass(which rn in given), user.password means the old and actual pass 
        if(result) {
             // here we have set the jwt because login kre ya register tokeen set hona chye
            let token = jwt.sign({ email: email, userid: user._id}, "shh");// shh is a secret key
            res.cookie("token", token);// we have set the token

            res.status(200).redirect('profile');// if the new password is and the old password is true Login sucessfully.
        }
        else res.redirect('/login');
    })
})

app.get('/logout', (req, res) => {
    res.cookie("token", "");// Basically to logout we have to empty the token in cookie 
    res.redirect("login");
})

// Protected Route 
// If we are loggedIn this middleware will check if it contains the token or not 
function isLoggedIn(req, res, next){// this is a middleware 
    if(req.cookies.token === "") res.redirect('/login');// browser se jo token ki value aarhi hai vo blank hai toh ww will redirect
    
    else {// agr token blank nhi hai toh
        let data = jwt.verify(req.cookies.token, "shh");// agr ye valid token hai toh secret key saath hume vo data (email, userid) mil jyega
        req.user = data; // isme email aur userid wala data set hua hai jo valid hoga.
        next();
    }
}

app.listen(process.env.PORT || 5000);