const yelp = require('yelp-fusion');
const CLIENTID = process.env.YELP_CLIENT_ID;
const CLIENTSECRET = process.env.YELP_CLIENT_SECRET;
var client;

const token = yelp.accessToken(CLIENTID, CLIENTSECRET).then(response => {
  console.log(response.jsonBody.access_token);
  client = yelp.client(response.jsonBody.access_token);
}).catch(e => {
  console.log(e);
});


// methods go here.

module.exports.search = function(location, callback) {
  client.search({
    categories:'bars',
    location: location,
    radius: 20000
  }).then(response => {
    // TODO: STRIP ONLY NEEDED FIELDS FROM THIS RESPONSE.
    callback(null, response)
  }).catch(err => {
    console.log(err);
    callback(err, null);
  });
}
