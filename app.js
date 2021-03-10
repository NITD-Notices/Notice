const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

const accounts = require('./models/account');

mongoose.connect(process.env.MONGOURL , { useNewUrlParser: true  , useUnifiedTopology: true});
let db = mongoose.connection;

db.once('open' , ()=>{
    console.log("database connected");
});

db.on('error' ,  (err)=>{
    console.log(err);
});

app.get('/' , (req , res)=>{
    res.render('index' , {success : req.flash('success') , error : req.flash('error')});
});

app.post('/subscribe',(req , res)=>{
    let email = req.body.email;
    accounts.findOne({email:email} , (err , user)=>{
        if(err)
        {
            console.log(err);
        }
        else if(!user)
        {
            let User = new accounts();
            User.email = email;
            User.isSub = true;
            User.save((err)=>{
                if(err)
                console.log(err);
                else{
                    req.flash('success' , `${email} Thanks for Subscribing to NITD Notices`);
                    res.redirect('/');
                }
            })
        }
        else{
            if(user.isSub == true)
            {
                req.flash('error' , `${email} has been resgistered already`);
                res.redirect('/');
            }
            else{
                user.isSub = true;
                user.save((err)=>{
                    if(err)
                    console.log(err);
                    else{
                        req.flash('success' , `Welcome back ${email}`);
                        res.redirect('/');
                    }
                });
            }
            
        }
    })
});

app.post('/unsubscribe' , (req , res)=>{
    let email = req.body.email;
    accounts.findOne({email:email} , (err , user)=>{
        if(err)
        console.log(err);
        else if(!user)
        {
            req.flash('error' , `${email} is not yet Subscribed. Provide a valid Email`);
            res.redirect('/');
        }
        else{
            if(user.isSub == false)
            {
                req.flash('error' , `${email} is already Unsubscribed. Provide a valid Email`);
                res.redirect('/');
            }
            else{
                user.isSub = false;
                user.save((err)=>{
                    if(err)
                    console.log(err);
                    else{
                        req.flash('success' , `${email} is successfully Unsubscribed`);
                        res.redirect('/');
                    }
                })
            }
        }
    })
})


app.listen('3000' , function (err){
    if(err)
    console.log(err);
    else
    console.log("connected to port 3000");
})
