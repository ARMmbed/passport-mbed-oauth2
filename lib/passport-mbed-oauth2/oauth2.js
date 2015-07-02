/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Coggle authentication strategy authenticates requests by delegating to
 * Coggle using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Google application's client id
 *   - `clientSecret`  your Google application's client secret
 *   - `callbackURL`   URL to which Google will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new CoggleStrategy({
 *         clientID: 'example.net',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/mbed/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://developer.mbed.org/o/authorize/';
  options.tokenURL = options.tokenURL || 'https://developer.mbed.org/o/token/';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'mbed';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Coggle.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`    always set to `mbed`
 *   - `id`          client-id specific identifier for this user
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.useAuthorizationHeaderforGET(false);

  this._oauth2.get('https://developer.mbed.org/api/v3/userinfo/', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      var email_confirmed = (json.userprofile_set && json.userprofile_set[0]) ? json.userprofile_set[0].email_confirmed : false;

      var profile = { 
        provider: 'mbed',
        id: json.id,
        displayName: json.first_name,
        username: json.username,
        name:{
          familyName: json.last_name,
          givenName: json.first_name
        },
        emails: [{
          value: json.email,
          verified: email_confirmed
        }]
      };
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Return extra mbed-specific parameters to be included in the authorization
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function(options) {
  var params = {};
  return params;
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
