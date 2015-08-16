var qs = require('querystring'),
		twilio = require('twilio'),
    http = require('http'),
		fs = require('fs'),
		sys = require('sys'),
		exec = require('child_process').exec,
		config = JSON.parse(fs.readFileSync("config/twilio_config.json")), // or +process.argv[process.argv.length - 1]
		pass_regex = new RegExp('^'+config.password+'[ ]*'),
		accountSid = config.accountSid,
		authToken = config.authToken,
		client = require('twilio')(accountSid, authToken);

// Create an HTTP server, listening on port 1337, that
// will respond with a TwiML XML document
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
			var post = qs.parse(body);
			console.log(post);
			console.log(post['From']);
			console.log(post.To);

			// MAYBE MOVE TO DIFFERENT FUNCTION
			var resp = new twilio.TwimlResponse();

			// SEND MESSAGES
			client.messages.create({
				to: "+14352517720",
				from: "+14352161839",
				body: "hello world",
				// statusCallback: "sfd",
			}, function(err, message) {
				if(err){
					console.log('Something went wrong...');
					console.log(err);
				}
				console.log(message.sid);
				console.log(message.status);
			});
		});
	}
}).listen(1337);
