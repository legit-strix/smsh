var readline = require('readline'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	config_obj = {},
	finalArg = process.argv[process.argv.length - 1],
	configPath = __dirname+'/config/'; // '/config/test/' implement some sort of testing flag

if(!fs.existsSync(configPath)){
	mkdirp.sync(configPath);
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var twilioQuestions = [
	{
		title:'Account SID',
		desc: '(Found in your Twilio account information)',
		json_key:'accountSid',
		'default': null,
		action: null
	},
	{
		title:'Auth Token',
		desc: '(Found in your Twilio account information)',
		json_key:'authToken',
		'default': null,
		action: null
	},
	{
		title:'Twilio Phone Number',
		desc: '(Found in your Twilio account information MAKE SURE TO ADD A +1 for US)',
		json_key:'twilioNumber',
		'default': null,
		action: null
	},
	{
		title:'unique passphrase',
		desc: '(what you\'ll prepend to every text)',
		json_key:'password',
		'default': null,
		action: null
	},
	{
		title:'list of valid phone numbers',
		desc: '(phone numbers you allow to communicate with your server MAKE SURE TO ADD A +1 for US country code and add spaces between each phone number)',
		json_key:'validPhones',
		'default': [],
		action: function(a){
			if(a.length > 0){
				return a.split(' ');
			}
		}
	}
]

var sendhubQuestions = [
	{
		title:'SendHub API key',
		desc: '(found on the account settings page at www.sendhub.com)',
		json_key:'sh_api',
		'default': 'https://api.sendhub.com',
		action: null
	},
	{
		title:'SendHub account phone number',
		desc: '(the number you used to sign up)',
		json_key:'phone_number',
		'default': null,
		action: null
	},
	{
		title:'API Version',
		desc: '(most likely v1)',
		json_key:'api_ver',
		'default': 'v1',
		action: null
	},
	{
		title:'API Key',
		desc: '(Found in the settings page as well)',
		json_key:'api_key',
		'default': null,
		action: null
	},
	{
		title:'unique passphrase',
		desc: '(what you\'ll prepend to every text)',
		json_key:'password',
		'default': null,
		action: null
	},
	{
		title:'list of valid phone numbers',
		desc: '(phone numbers you allow to communicate with your server MAKE SURE TO ADD A +1 for US country code and add spaces between each phone number)',
		json_key:'valid_phones',
		'default': [],
		action: function(a){
			if(a.length > 0){
				return a.split(' ');
			}
		}
	}
];
var i = 0;
var q = [];
var configFile = '';
configure();
function configure(){
	if(finalArg == 'twilio'){
		configFile = configPath+'twilio_config.json';
		q = twilioQuestions;
		ask(i);
	} else if(finalArg == 'sendhub'){
		configFile = configPath+'sendhub_config.json';
		q = sendhubQuestions;
		ask(i);
	} else{
		console.log('No valid option...use \'node config.js twilio\' or \'node config.js sendhub\'');
		process.exit();
	}
}
function ask(i){
	if(i == q.length){
		console.log('CONFIGURATION COMPLETE');
		rl.close();
		writeConfigFile(config_obj);
	} else{
		rl.question(q[i].title+' '+q[i].desc+': ', function(answer) {
			if(answer.length == 0 && q[i].default != null){
				answer = q[i].default;
			}
			if(q[i].action !== null){
				answer = q[i].action(answer);
			}
			config_obj[q[i].json_key] = answer;
			i++;
			ask(i);
		});
	}
}

function writeConfigFile(obj){
	var json = JSON.stringify(obj);
	fs.writeFile(configFile, json, function(err){
		if(err){
			console.log(err);
		} else{
			console.log("Successfully wrote config file");
		}
	});
}
