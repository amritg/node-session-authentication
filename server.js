'use strict';

// *** SetUp -> Get all the tools needed *** //

var express =  require('express');
var path = require('path'); // Providies utilities working with file and directory paths
var morgan = require('morgan'); //  HTTP request logger module
var bodyParser = require('body-parser'); // Parse incoming request bodies in a middle before your handlers
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var SessionFileStore = require('session-file-store')(session);
var flash = require('connect-flash');

// *** DATABASE THINGS *** //

var mysql = require('./scripts/sqlCTOQueries.js');
mysql.createPool('localhost','root','','user_credentials');

var app = express();
var port = 3000;

// *** Middlewares *** //

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(session({
    name: 'auth',
    secret: 'agautam',
    resave: true,
    saveUninitialized: true,
    store: new SessionFileStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// *** Passport Authentication ***/


passport.use(new LocalStrategy(
    function(username,password,done){
        mysql.readSQLDataSingle("GetUser",function(){ 
            // console.log("Data from mysql server: " + data);
            if(!data.length){   // If no user is found
                return done(null,false);
            }else{
                // If user is found but Password is incorrect
                if(password != data[0].password){
                    return done(null,false,req.flash('logInError','Invalid Username OR Password.'));
                }else{
                    // Return User Info if password matches
                    var userDetails = data[0];
                    var oldCount = data[0].count;
                    var newCount = oldCount + 1;

                    var newLoginDate = new Date().toISOString().slice(0, 19).replace('T',' ');
                    var sql_updateDateCount = newCount +', lastlogin = \"'+ newLoginDate +'\" WHERE username = \"' + userDetails.username + '\"';
                    // console.log(sql_updateDateCount);
                    mysql.readSQLDataSingle("UpdateUserLogInCount",function(){
                            console.log("Return from db");
                            console.log(userDetails);
                            return done(null,{user: userDetails.username});
                            // return done(null,{user: userDetails.username, lastlogin: userDetails.lastlogin});
                    },sql_updateDateCount);
                }
            }
        },username);
    }
));
passport.serializeUser(function(user,done){
    // console.log('In serializeUser');
    // console.log(user);
    done(null, user);
});
passport.deserializeUser(function(user, done){
    // console.log('In deserializeUser');
    // console.log(user);
    mysql.readSQLDataSingle("GetUser", function(){
        done("",data);
    },user);
});


// *** Middleware to check if the USER is logged In *** //

function restrictAccess(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.sendStatus(401);  // If not Authenticated, redirect to Home page
    }
    // res.redirect('/'); // If not Authenticated, redirect to Home page
}

// *** Routes ** //

// app.get('/', function(req,res,next){
//     res.sendFile(path.join(__dirname + '/client/login.html'));
// });
// app.get('/index',restrictAccess, function(req,res,next){
//     res.sendFile(path.join(__dirname + '/client/index.html'));
// });
// app.post('/login', passport.authenticate('local',{ successRedirect: '/home',
//                                                     failureRedirect: '/',
//                                                     failureFlash: true })
// );

app.get('/loggedIn',function(req, res){
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/login', passport.authenticate('local'),function(req,res,next){
    console.log('After authentication:');
    console.log(req.body);
    console.log(req.user);
    console.log(req.flash);
    res.send(req.user);
    next();
});
app.get('/logout', function(req,res,next){
    req.logout();
    res.sendStatus(200);
});

// *** Launch Application ** //

app.listen(port);
console.log('Listening at Port: ' + port);