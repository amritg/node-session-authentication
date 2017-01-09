var exports = module.exports = {};
var mysql      = require('../scripts/sqlConnection.js');	


exports.createPool =  function (_host,_user,_password,_database) {
		mysql.createPool(_host,_user,_password,_database);
    }

		
exports.readSQLDataSingle = function(querytype, callback, extra_conditions)
		{
			var queryString;
			var data1;
			var data;
			
			
			if (querytype === "NetworkAlarmsGroupeByLocationAndSeverityURL")
			{
					if (extra_conditions === "")
					{	
						queryString = '(select f.severity, count(*) as count,l.location from ne_fault f, ne_location l where f.ne_id = l.ne_id group by f.severity) union (select \"healthy\" as \"severity\", count(*) as count,l.location from ne_location l where l.ne_id NOT IN (SELECT ne_id FROM ne_fault))';			
						
					}
					else
					{
						queryString = '(select f.severity, count(*) as count,l.location from ne_fault f, ne_location l where f.ne_id = l.ne_id and ' + extra_conditions + ' group by f.severity) union (select \"healthy\" as "\severity"\, count(*) as count,l.location from ne_location l where ' + extra_conditions + ' and l.ne_id NOT IN (SELECT ne_id FROM ne_fault))';						
					}
			}
			else if(querytype === "NEESWsGroupedByLocationURL")
			{
					if (extra_conditions === "")
					{		
						queryString = 'select CONCAT(SUBSTRING(i.ne_type,1,9), SUBSTRING(i.ne_type,13)) as ESW, count(*) as count from inventory_shelves i group by SUBSTRING(i.ne_type,13) order by SUBSTRING(i.ne_type,13)'; 
					}
					else
					{						
						queryString = 'select CONCAT(SUBSTRING(i.ne_type,1,9), SUBSTRING(i.ne_type,13)) as ESW,l.location,count(*) as count from inventory_shelves i, ne_location l where l.ne_name = i.ne_name and ' + extra_conditions + ' group by SUBSTRING(i.ne_type,13),l.location order by SUBSTRING(i.ne_type,13)'; 
					}
			}
			else if (querytype === "dataWorstAlarmedLocs")
			{
				queryString = 'select l.location,f.severity as faultcause, count(*) as countfault from ne_fault f, ne_location l where f.ne_id = l.ne_id and f.severity_int > 1 group by l.location,f.severity order by f.severity_int desc, countfault desc';				
				
				/*
				select l.location,CONCAT(SUBSTRING(i.ne_type,1,9), SUBSTRING(i.ne_type,13)) as eswcause, count(*) as countesw  from inventory_shelves i, ne_location l where i.ne_name = l.ne_name and SUBSTRING(i.ne_type,13) IN (" 5.30 60"," 5.40 50")  group by SUBSTRING(i.ne_type,13),l.location order by SUBSTRING(i.ne_type,13), countesw desc
				select l.location,f.severity as faultcause, count(*) as countfault from ne_fault f, ne_location l where f.ne_id = l.ne_id group by l.location,f.severity order by f.severity_int desc,countfault desc 
				*/
			}	
			else if (querytype === "dataWorstESWLocs")
			{
				queryString = 'select l.location,CONCAT(SUBSTRING(i.ne_type,1,9), SUBSTRING(i.ne_type,13)) as eswcause, count(*) as countesw  from inventory_shelves i, ne_location l where i.ne_name = l.ne_name and SUBSTRING(i.ne_type,13) IN (" 5.30 60"," 5.40 50")  group by SUBSTRING(i.ne_type,13),l.location  order by SUBSTRING(i.ne_type,13), countesw desc';				
			}
			else if (querytype === "NetworkAlarms") // This query will be transformed to 3 levels JSON
			{
				queryString = 'select n.severity,l.location as loc, n.ne_name, n.fault_string from ne_fault n, ne_location l where n.ne_id = l.ne_id order by n.severity, l.location';
			}
			else if (querytype === "NetworkAlarmsGroupedBySeverityURL")
			{
				queryString = '(select f.severity, count(*) as count from ne_fault f group by f.severity) union (select "healthy" as "severity", count(*) as count from ne_location f where f.ne_id NOT IN (SELECT ne_id FROM ne_fault f))';
			}				
			else if (querytype === "NetworkAlarms")
			{
				queryString = 'select n.severity,l.location as loc, n.ne_name, n.fault_string  from ne_fault n, ne_location l where n.ne_id = l.ne_id order by n.severity, l.location';
			}
			else if(querytype === "NEESWsURL")
			{
				queryString = 'select CONCAT(SUBSTRING(ne_type,1,9), SUBSTRING(ne_type,13)) as ESW,count(*) as count from inventory_shelves group by SUBSTRING(ne_type,13) order by SUBSTRING(ne_type,13)';
			}
			else if (querytype === "NEsOldSWURL")
			{
				queryString = 'select ne_type as ESW,ne_name from inventory_shelves where ne_type IN ("hiT 7300 SON 5.30 60","hiT 7300 ONN 5.30 60")';
			}
			else if (querytype === "NEsUtiizationURL")
			{
				queryString = 'SELECT metric,utilization,count(*) as count FROM ne_utilization group by metric,utilization';
			}
			else if (querytype === "NEsUtiizationTableLowURL")
			{
				queryString = 'SELECT ne_name,metric,utilization FROM ne_utilization where utilization <= 20';
			}
			else if (querytype === "NEsUtiizationTableHighURL")
			{
				queryString = 'SELECT ne_name,metric,utilization FROM ne_utilization where utilization >= 80';
			}
			else if (querytype === "NELocationURL")
			{
				queryString = 'SELECT ne_location.ne_name, ne_location.lat,ne_location.lon,ne_location.location FROM ne_location';
			}
			else if (querytype === "TrunkLocationURL")
			{
				queryString = 'select n.lat as a_lat,n.lon as a_lon, physical_trails.a_ne_id as a_ne_id,n1.lat as z_lat,n1.lon as z_lon,physical_trails.z_ne_id as z_ne_id,physical_trails.user_label from ne_location n, ne_location n1, physical_trails where n.ne_id = physical_trails.a_ne_id and n1.ne_id = physical_trails.z_ne_id and n.ne_id != n1.ne_id';
			}
			else if (querytype === "LocationRelURL")
			{
				queryString = 'select n.location as a_loc,c.lat as a_lat, c.lon as a_lon, n1.location as z_loc, c1.lat as z_lat, c1.lon as z_lon ,count(*) from ne_location n, ne_location n1, physical_trails, _citiesLatLong c, _citiesLatLong c1 where n.ne_id = physical_trails.a_ne_id and n1.ne_id = physical_trails.z_ne_id and n.location != n1.location  and (c.cityname =n.location and c1.cityname = n1.location)  group by n.location,n1.location';				
			}
			else if(querytype === "NEsGroupedBySeverityURL")
			{
				queryString = 'select f.severity,f.ne_name from ne_fault f order by f.severity_int asc'
			}
			else if(querytype === "LocationsGroupedBySeverityURL")
			{
				queryString = 'select f.severity,l.location as loc, count(*) from ne_fault f, ne_location l where l.ne_id = f.ne_id group by f.severity, l.location order by f.severity_int asc';
			}
			else if(querytype === "GetUser"){
				queryString = 'SELECT * FROM users WHERE username = \"' + extra_conditions + '\"';
			}		
			mysql.handle_database(queryString,callback);
		
		}
		
		
		
	exports.TransformTo3LevelJSON = function(neAlarms) {
				var secondlevelHashMap = new Map();
				var neAlarmsJSON;
				for (var i = 0; i < neAlarms.length; i++)							
				{			
					var secondlevelHashMapkey = neAlarms[i].severity + " ## " + neAlarms[i].loc;		
									
					if (secondlevelHashMap.has(secondlevelHashMapkey))
					{
						var newJSONString = secondlevelHashMap.get(secondlevelHashMapkey) + ",{\"ne_name\":\"" + neAlarms[i].ne_name + "\",\"fault\":\"" + neAlarms[i].fault_string + "\"}";
						secondlevelHashMap.set(secondlevelHashMapkey, newJSONString);
					//	console.log(newJSONString);
					}
					else
					{								
						var newJSONString = "\"" + neAlarms[i].loc + "\":[{\"ne_name\":\"" + neAlarms[i].ne_name + "\",\"fault\":\"" + neAlarms[i].fault_string + "\"}";							
						secondlevelHashMap.set(secondlevelHashMapkey, newJSONString);
					//	console.log(newJSONString);
					}	
				}
					
				var secondlevelIter = secondlevelHashMap.keys();		
				var firstlevelHashMap = new Map();
				for (var secondlevelHMkey of secondlevelIter)
				{
					var firstlevelkey = secondlevelHMkey.split(" ## ");
									
					if (firstlevelHashMap.has(firstlevelkey[0]))
					{
						var newJSONString = firstlevelHashMap.get(firstlevelkey[0]) + "," + secondlevelHashMap.get(secondlevelHMkey) + "]"; 
						firstlevelHashMap.set(firstlevelkey[0], newJSONString);
					//	console.log(newJSONString);
					}
					else
					{								
						var newJSONString = "\n\"" + firstlevelkey[0] + "\":{" + secondlevelHashMap.get(secondlevelHMkey) + "]"; 
						firstlevelHashMap.set(firstlevelkey[0], newJSONString);
				//		console.log(newJSONString);
					}							
				}
				
				var outputJSON = "{";
				var firstlevelIter = firstlevelHashMap.keys();
				for (var firstlevelHMkey of firstlevelIter)
				{
					outputJSON =  outputJSON + firstlevelHashMap.get(firstlevelHMkey) + "},";
				}
					outputJSON = outputJSON.slice(0,outputJSON.length-1);
									
				neAlarmsJSON = outputJSON + "}";
				return neAlarmsJSON;
		}