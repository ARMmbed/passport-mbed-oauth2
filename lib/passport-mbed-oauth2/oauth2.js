/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

// Domains
var mbedDomain = 'https://os.mbed.com';
var authDomain = 'https://account.mbed.com';
/**
 * `Strategy` constructor.
 *
 * The Mbed authentication strategy authenticates requests by delegating to
 * Mbed using the OAuth 2.0 protocol.
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
 *     passport.use(new MbedStrategy({
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
  options.authDomain = options.authDomain || authDomain;
  options.authorizationURL = options.authorizationURL || options.authDomain + '/o/authorize/';
  options.tokenURL = options.tokenURL || options.authDomain + '/o/token/';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'mbed';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Mbed.
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

  this._oauth2.get(mbedDomain + '/api/v3/userinfo/', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);

      var email_confirmed = false;
      // legacy support: userprofile_set is changing from an array
      // to an object soon, so we'll support both.
      if(json.userprofile_set) {
        if (Array.isArray(json.userprofile_set) && json.userprofile_set[0]) {
          email_confirmed = json.userprofile_set[0].email_confirmed;
        }
      } else if (json.profile && json.profile.email_confirmed) {
        email_confirmed = true;
      }

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
