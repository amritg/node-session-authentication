	
	var exports = module.exports = {};

	
	// SQL CONNECTION TO MARIA DB			
	var mysql      = require('mysql');	
		
	
	exports.createPool =  function (_host,_user,_password,_database) {
		pool      =    mysql.createPool({
				connectionLimit : 100, //important
				host     : _host,
				user     : _user,	
				password : _password,
				database : _database,
				debug    :  false
		});
		console.log ("Connecting to ISQL DB server " + _host );		
		console.log ("using DBName " + _database);
    }

	exports.handle_database =  function (req,callback) {
		pool.getConnection(function(err,connection){
				if (err) {
				  connection.release();
				  res.json({"code" : 100, "status" : "Error in connection database"});
				  console.log("Error in connection database. couldnt get connectionId");
				  callback(res);
				}   

				console.log('connected as id ' + connection.threadId);

				connection.query(req,function(err,rows){
					connection.release();
					if(!err) {
						if(rows.constructor === Array){
							data = rows.slice();
							//console.log(data);					
							callback(data);
						}else{
							// console.log(rows);
							//console.log(typeof(rows.affectedRows));
							callback(rows);
						}
						//res.json(rows);
					}           
				});

				connection.on('error', function(err) {      
					  res.json({"code" : 100, "status" : "Error in connection database"});
					  console.log("Error in connection database" + connection.threadId);
					  callback(res);					
				});
			});
		}
			