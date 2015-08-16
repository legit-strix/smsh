SMSH
====
SSH via SMS written in NodeJS!  Made possible through use of Twilio or SendHub.  SMSH can run on any public facing server (listening on port 1337) or by use of [ngrok](https://ngrok.com/).

Installation
---
First clone the repo:

`git clone https://github.com/strix/smsh.git`

`cd smsh`

Then run `npm install` to install the dependencies(Note: NodeJS must be installed)

Twilio
---
If you haven't already, sign up and set up you [Twilio](https://www.twilio.com/) account (it will guide you through the basic setup upon signing up).  After signing up, you should receive an AccountSID and an AuthToken (found under Account --> Dev Tools --> Test Credentials) and also your Twilio number.  These will be used when you run `config.js` (see below).  Also make sure to go to Account --> Numbers --> Twilio Numbers --> and change the URL under SMS & MMS to your public facing one.

Setup the config file by running: <br />
`node config.js twilio`

After that, start the service: <br />
`node twilio.js`

Now when you send messages to your Twilio number with your password at the beginning of the message (Ex: Password echo "hello world"), you will get texted back the output of that command (Ex. hello world).

SendHub
---
**Note: SendHub functionality has not been maintained for a while now.  It should still work but no guarantees.**

This can send and receive messages locally for testing purposes.

Setup the config file by running: <br />
`node config.js sendhub`

After that, start the service: <br />
`node sendhub.js`

Security
---
So far there is sort of a two factor auth system built in.  When you run `config.js`, It will ask you for a password (which will need to be added at the beginning of each message sent to your server) and also a space-separated list of allowed phone numbers.  This way, you'll only be compromised if someone sent the messages from your phone and knew the password.
