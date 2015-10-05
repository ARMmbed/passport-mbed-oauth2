# Passport-mbed-OAuth2
[Passport](http://passportjs.org/) strategies for authenticating with [mbed](http://mbed.com/)
using OAuth 2.0.

This module lets you authenticate using mbed in your Node.js applications.
By plugging into Passport, mbed authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install
    $ npm install passport-mbed-oauth2

## Usage
#### Configure Strategy
The mbed OAuth 2.0 authentication strategy authenticates users by their
mbed login, and OAuth 2.0 tokens. The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

    var MbedStrategy = require('passport-mbed-oauth2').OAuth2Strategy;

    passport.use(new MbedStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/mbed/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({id: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests
Use `passport.authenticate()`, specifying the `'mbed'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/mbed/callback', 
      passport.authenticate('mbed', { failureRedirect: '/request-mbed-auth' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Credits
  - [Jared Hanson](http://github.com/jaredhanson) for the original passport module, and the Google OAuth module from which this is derived.

## License
[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>  

