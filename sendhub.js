var request = require('request'),
	fs = require('fs'),
	sys = require('sys'),
	exec = require('child_process').exec,
	config = JSON.parse(fs.readFileSync("config/config.json")), // or +process.argv[process.argv.length - 1]
	sh_api = config.sh_api,
	number = config.phone_number,
	apikey = config.api_key,
	api_ver = config.api_ver,
	identify = '/?username='+number+'&api_key='+apikey
	output = __dirname+'/output.json',
	pass_regex = new RegExp('^'+config.password+'[ ]*'),
	valid_phones = config.valid_phones
	timer = {};
var fileToJson = function(f){
	return JSON.parse(fs.readFileSync(f));
}

function startPoll(){
	timer = setInterval(function(){sendhubGet('inbox');}, 10000);
}
startPoll();

// sendhubGet('inbox');
// main();

function sendhubGet(source){
	var uri = sh_api+'/'+api_ver+'/'+source;
	console.log(uri);

	var options = {
		uri: uri+identify, 
		method: 'GET'
	};

	console.log(options);
	req = request(options, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        console.log(body);
			fs.writeFileSync(output, body); // or just use callback
			main();
			// fs.writeFile(output, body, function(err){
// 				if(err){
// 					console.log(err);
// 				} else{
// 					console.log("successfully wrote file");
// 				}
// 			});
	    } else{
	    	// console.log(error);
	    	// console.log(response);
	    	console.log('something went wrong...');
	    	console.log('Status Code: '+response.statusCode);
	    }
	});
}

function main(){
	var unread = sortByDate(getUnread());
	for(var i=0; i<unread.length; i++){
		var unread = unread[i],
			txt = unread.text,
			msg_id = unread.id,
			sender_id = unread.contacts[0].id_str; // change to handle multiple
			valid = isAuthorized(unread),
			command = getCommand(txt);
		if(valid){
			clearInterval(timer);
			exec(command, function(error, stdout, stderr){
				var msg = stderr ? stderr : error ? 'error with command execution': stdout;
				if(msg.length > 160){ // maybe take out later
					msg = msg.substring(0,78)+'...'+msg.substring(msg.length-79, msg.length);
				}
				if(msg.length == 0){
					msg = 'Command successfully executed but yielded no output';
				}
				var post_data = {
					'contacts': [sender_id],
					'text': msg
				};
				sendhubPost(post_data, 'messages');
				markAsRead(msg_id);
				startPoll();
			});
		} else {
			console.log("not a valid phone or password");
		}
	}	
}

function sendhubPost(post_data, source){
	var uri = sh_api+'/'+api_ver+'/'+source;
	console.log(uri);

	var options = {
		uri: uri+identify, 
		method: 'POST', 
		json: post_data
	};

	console.log(options);
	req = request(options, function (error, response, body) {
	    if (!error && response.statusCode == 201) {
	        console.log(body);
			console.log('request successful');
			// fs.writeFileSync(output, body); // or just use callback
			// fs.writeFile(output, body, function(err){
// 				if(err){
// 					console.log(err);
// 				} else{
// 					console.log("successfully wrote file");
// 				}
// 			});
	    } else{
	    	console.log('something went wrong...');
	    	console.log('Status Code: '+response.statusCode);
	    }
	});
}

function markAsRead(mes_id){
	var uri = sh_api+'/'+api_ver+'/messages/'+mes_id;
	console.log(uri);

	var options = {
		uri: uri+identify, 
		method: 'PUT', 
		json: {unread: false}
	};

	console.log(options);
	req = request(options, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        console.log(body);
			console.log('request successful');
	    } else{
	    	console.log('something went wrong...');
	    	console.log('Status Code: '+response.statusCode);
	    }
	});
}

function isAuthorized(msg){
	var contacts = msg.contacts;
	var phone_arr = [];
	for(var i=0; i<contacts.length; i++){
		if(valid_phones.indexOf(contacts.number) > -1){
			phone_arr.push(contacts[i].number);
		}
	}
	var phone_match = valid_phones.length == 0 ? true : phone_arr.every(function(val){
		return valid_phones.indexOf(val) >=0;
	});
	var pass_match = msg.text.match(pass_regex) !== null ? true : false;
	if(!pass_match){
		console.log('ERROR: Password not matched');
		console.log(msg);
	}
	if(!phone_match){
		console.log('ERROR: Invalid phone number');
	}
	return pass_match && phone_match;
}

function getCommand(msg){
	var not_allowed = ["^[ ]*rm[ ]*"],
		bad_command = false,
		command = msg.replace(pass_regex, '');
	for(var i=0; i<not_allowed.length; i++){
		if(command.match(not_allowed[i]) !== null){
			bad_command = true;
		}
	}
	command = bad_command ? 'echo Command not allowed' : command;
	return command;
}

function getUnread(){ // have json as param???
	var json = fileToJson('output.json'),
		messages = json.objects;
	return messages.filter(function(el){
		return el.unread == true;
	});
}

function getMostRecent(amt){ // have json as param???
	var json = fileToJson('output.json'),
		messages = json.objects
		amt = typeof amt !== 'undefined' ? amt : 5,
		sorted_dates = [];
	sorted_dates = sortByDate(messages, 'd')
	return sorted_dates.slice(0, amt);
}

function sortByDate(arr, order){
	var order = typeof order !== 'undefined' ? order : 'd';
	if(order == 'a'){
		arr.sort(function(a,b){
			var d1 = new Date(a.sent),
				d2 = new Date(b.sent);
			if(d1<d2){
				return -1;
			} else if(d1 == d2){
				return 0;
			} else{
				return 1;
			}
		});
	} else if(order == 'd'){ // don't judge :P
		arr.sort(function(a,b){
			var d1 = new Date(a.sent),
				d2 = new Date(b.sent);
			if(d1<d2){
				return 1;
			} else if(d1 == d2){
				return 0;
			} else{
				return -1;
			}
		});
	}
	return arr;
}