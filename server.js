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
                    return done(null,false);
                }else{
                    // Return User Info if password matches
                    var userDetails = data[0];
                    var oldCount = data[0].count;
                    var newCount = oldCount + 1;
                    // var sql_updateCount = newCount + ' WHERE username = \"' + userDetails.username + '\"';

                    var newLoginDate = new Date().toISOString().slice(0, 19).replace('T',' ');
                    console.log(newLoginDate);
                    // var sql_updateLastLogin = newLoginDate + ' WHERE username = \"' + userDetails.username + '\"';
                    var sql_updateCount = newCount +', lastlogin = \"'+ newLoginDate +'\" WHERE username = \"' + userDetails.username + '\"';
                    console.log(sql_updateCount);
                    mysql.readSQLDataSingle("UpdateUserLogInCount",function(){
                            return done(null, userDetails);
                        // mysql.readSQLDataSingle("UpdateUserLastLogInDate",function(){
                        //     console.log("InsideUpdateLastLogInDate");
                        //     // console.log(row);
                        //     return done(null, userDetails);
                        // },sql_updateLastLogin);

                    },sql_updateCount);
            }
        }
        
        },username);  
        // connection.query('SELECT * FROM users WHERE username = ?',[username],function(err, rows){
        //     if(err){
        //         return done(err);
        //     }
        //     // If no user is found
        //     if(!rows.length){
        //         return done(null,false);
        //     }else{
        //         // If user is found but Password is incorrect
        //         if(password != rows[0].password){
        //             console.log(rows[0].id + ' ' + rows[0].username + '' + rows[0].count);
        //             return done(null,false);
        //         }else{
        //             // return User Info if password matches
        //             // console.log(rows[0].id + ' ' + rows[0].username + '' + rows[0].count);
        //             var userDetails = rows[0];
        //             console.log(userDetails);
        //             var oldCount = rows[0].count;
        //             var newCount = oldCount + 1;
        //             connection.query('UPDATE users SET count = ? WHERE username=?',[newCount, username],function(err, rows){
        //                 console.log(userDetails);
        //                 console.log('Updated Count');
        //                 return done(null, userDetails);
        //             });
                    
                    
        //         }
        //     }
        // });
    }
));
passport.serializeUser(function(user,done){
    done(null, user.username);
});
passport.deserializeUser(function(username, done){
    console.log("username from session: " + username);
    mysql.readSQLDataSingle("GetUser", function(){
        console.log("Deserialize info: " + data[0].username);
        done("",data);
    },username);
});


// *** Middleware to check if the USER is logged In *** //

function restrictAccess(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/'); // If not Authenticated, redirect to Home page
}

// *** Routes ** //

app.get('/', function(req,res,next){
    console.log(req.session);
    res.sendFile(path.join(__dirname + '/client/login.html'));
});
app.get('/index',restrictAccess, function(req,res,next){
    res.sendFile(path.join(__dirname + '/client/index.html'));
    // res.json(req.user);
});
app.get('/page1', restrictAccess, function(req,res,next){
    res.sendFile(path.join(__dirname + '/client/page1.html'));
});
app.post('/login', passport.authenticate('local',{ successRedirect: '/index',
                                                    failureRedirect: '/',
                                                    failureFlash: true })
);
app.get('/logout', function(req,res,next){
    req.logout();
    res.redirect('/');
});

// *** Launch Application ** //

app.listen(port);
console.log('Listening at Port: ' + port);