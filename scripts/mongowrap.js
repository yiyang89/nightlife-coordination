var mongodb = require('mongodb');

// Collections: bookusers, books, accesstokens

module.exports.finduser = function(mongoConnection, username, callback) {
  var filterclause = {'username': username};
  mongoConnection.collection('nlcusers').findOne(filterclause, function(err, result) {
    if (err) {
      callback(err, null);
    } else {
      if (result === null) {
        callback("User does not exist: "+username, null);
      } else {
        callback(null, result);
      }
    }
  })
}

module.exports.validatelogin = function(mongoConnection, username, passwordhash, callback) {
  var filterclause = {'username': username};
  mongoConnection.collection('nlcusers').findOne(filterclause, function(err, result) {
    if (err) {
      callback(err, null);
    } else {
      if (result === null) {
        callback("User does not exist: "+username, null);
      } else {
        // Check for matching passwordhash.
        if (passwordhash !== result.passwordhash) {
          callback("Password incorrect", null);
        } else {
          callback(null, result);
        }
      }
    }
  })
}

module.exports.adduser = function(mongoConnection, profile, passwordhash, callback) {
  var filterclause = {'username': profile.username};
  mongoConnection.collection('nlcusers').findOne(filterclause, function(err, result) {
    // If username was found, callback with error.
    if (err) {
      callback(err, null);
    } else {
      if (result!==null) {
        callback("Username already exists: " + profile.username, null);
      } else {
        mongoConnection.collection('nlcusers').insertOne(profile, function(err, result) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, result);
          }
        })
      }
    }
  })
}

module.exports.getTokenDetails = function(mongoConnection, token, callback) {
  var filterclause = {'accessToken': token};
  mongoConnection.collection('accessTokens').findOne(filterclause, function (err, result) {
    if (err) {
      callback(err, null);
    } else {
      // If no results found, redirect to a page notifying user
      console.log("MongoDB fetched details for token " + token);
      console.log("MONGODB RESULT:"+JSON.stringify(result)) ;
      // callback(null, result);
      var userfilterclause = {username: result.profile.username};
      mongoConnection.collection('nlcusers').findOne(userfilterclause, function (err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    }
  });
}

module.exports.saveToken = function(mongoConnection, token, username, callback) {
  var newEntry = {"accessToken": token, "profile": username};
  mongoConnection.collection('accessTokens').insertOne(newEntry, function (err, result) {
    if (err) {
      callback(err, null);
    } else {
      // console.log('Inserted documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      callback(null, result);
    }
  });
}

module.exports.removeToken = function(mongoConnection, token, callback) {
  var filterclause = {'accessToken': token};
  mongoConnection.collection('accessTokens').remove(filterclause,function (err, result) {
    if (err) {
      callback(err, null);
    } else {
      console.log("mongodb removeQuery result: " + JSON.stringify(result));
      callback(null, result);
    }
  });
}
