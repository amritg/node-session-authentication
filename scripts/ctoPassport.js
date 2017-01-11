
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var exports = module.exports ={};

exports.passport.use(new LocalStrategy(
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