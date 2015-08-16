var qs = require('querystring'),
		twilio = require('twilio'),
    http = require('http'),
		fs = require('fs'),
		sys = require('sys'),
		exec = require('child_process').exec,
		config = JSON.parse(fs.readFileSync("config/twilio_config.json")), // or +process.argv[process.argv.length - 1]
		passRegex = new RegExp('^'+config.password+'[ ]*'),
		validPhones = config.validPhones,
		accountSid = config.accountSid,
		authToken = config.authToken,
		twilioNumber = config.twilioNumber,
		client = require('twilio')(accountSid, authToken);

http.createServer(function(req, res) {
	if(req.method == 'POST'){
		var body = '';
		req.on('data', function(data){
			body += data;
			// Too much POST data, kill the connection!
			if(body.length > 1e6)
			req.connection.destroy();
		});
		req.on('end', function(){
			var post = qs.parse(body),
				fromNum = post.From,
				txt = post.Body,
				valid = isAuthorized(fromNum, txt),
				command = getCommand(txt);
			console.log(post);
			if(valid){
				exec(command, function(error, stdout, stderr){
					var msg = stderr ? stderr : error ? 'error with command execution': stdout;
					// if(msg.length > 160){ // maybe take out later.  Not sure if necessary
					// 	msg = msg.substring(0,78)+'...'+msg.substring(msg.length-79, msg.length);
					// }
					if(msg.length == 0){
						msg = 'Command successfully executed but yielded no output';
					}
					// SEND MESSAGES
					client.messages.create({
						to: fromNum,
						from: twilioNumber,
						body: msg,
						// statusCallback: "callback",
					}, function(err, message) {
						if(err){
							console.log('Something went wrong...');
							console.log(err);
						} else {
							console.log(message.sid);
							console.log(message.status);
						}
					});
				});
			} else {
				console.log("not a valid phone or password");
			}
		});
	}
}).listen(1337);

function isAuthorized(fromNum, body){
	var phoneMatch = validPhones.length == 0 ? true : validPhones.indexOf(fromNum) >= 0;
	var passMatch = body.match(passRegex) !== null;
	if(!passMatch){
		console.log('ERROR: Password not matched');
	}
	if(!phoneMatch){
		console.log('ERROR: Invalid phone number');
	}
	return passMatch && phoneMatch;
}

function getCommand(msg){
	var notAllowed = ["^[ ]*rm[ ]*"],
		badCommand = false,
		command = msg.replace(passRegex, '');
	for(var i=0; i<notAllowed.length; i++){
		if(command.match(notAllowed[i]) !== null){
			badCommand = true;
		}
	}
	command = badCommand ? 'echo Command not allowed' : command;
	return command;
}
