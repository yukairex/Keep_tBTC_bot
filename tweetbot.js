var OAuth = require('oauth');
const dotenv = require('dotenv');

// load dotenv
dotenv.config();

// new twitter key
var twitter_application_consumer_key =
  process.env.twitter_application_consumer_key; // API Key
var twitter_application_secret = process.env.twitter_application_secret; // API Secret
var twitter_user_access_token = process.env.twitter_user_access_token; // Access Token
var twitter_user_secret = process.env.twitter_user_secret; // Access Token Secret

var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  twitter_application_consumer_key,
  twitter_application_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

// console.log('Ready to Tweet article:\n\t', postBody.status);
module.exports.tweet = (status) => {
  var postBody = {
    status: status,
  };

  oauth.post(
    'https://api.twitter.com/1.1/statuses/update.json',
    twitter_user_access_token, // oauth_token (user access token)
    twitter_user_secret, // oauth_secret (user secret)
    postBody, // post body
    '', // post content type ?
    function (err, data, res) {
      if (err) {
        console.log(err);
      } else {
        // console.log(data);
      }
    }
  );
};
