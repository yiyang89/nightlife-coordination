var express = require('express');
var app = express();
var mongowrap = require('./scripts/mongowrap.js');
var path = require('path');
var http = require('http');
var mongodb = require('mongodb');
// For generating access tokens.
var uuidV4 = require('uuid/v4');
var sha1 = require('sha1');
var MongoClient = mongodb.MongoClient;
// SET THIS TO A DB ON MLAB FOR DEPLOYMENT.
var url = process.env.MONGO_ADDRESS;
var mongo;

// Each type of passport plugin will require its specific oauth strategy.
// Need to create credentials on https://console.developers.google.com/
// MOVE THESE INTO ENV VARIABLES BEFORE DEPLOYING.
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('pages/index', {'user':null, 'token':null});
});

app.get('/tokendetails/', function(request, response) {
  // Query mongodb for profile corresponding to access token.
  // Try bundling data into this to fix weird bug on front end.
  mongowrap.getTokenDetails(mongo, request.query.accesstoken, function(err, result) {
    if (err) {
      console.log(err);
      console.log({"error":err});
    } else {
      response.send({profile: result, accessToken: request.query.accesstoken});
    }
  })
})

app.get('/login/', function(request, response) {
  mongowrap.validatelogin(mongo, request.query.username, request.query.passwordhash, function(err, result) {
    console.log("validatelogin result: " + result);
    if (err) {
      console.log(err);
      response.send({error: err});
    } else {
      // Save user token.
      var accesstoken = sha1(uuidV4());
      mongowrap.saveToken(mongo, accesstoken, {username: result.username, application: "nightlife"}, function(err, tokensaveresult) {
        if (err) {
          console.log(err);
          response.send({error: err});
        } else {
          response.send({profile: result, accessToken: accesstoken});
        }
      }.bind(result))
    }
  })
})

app.get('/logout/', function(request, response) {
  // Delete profile with this access token from mongodb.
  mongowrap.removeToken(mongo, request.query.accesstoken, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      response.send(result);
    }
  });
})

// send auth request to google
app.get('/signup/', function(request, response) {
  // Attempt to add to bookusers
  // If successful, mongo savetoken
  var profile = {
    username: request.query.username,
    passwordhash: request.query.passwordhash
  }
  mongowrap.adduser(mongo, profile, request.query.passwordhash, function(err, result) {
    if (err) {
      console.log(err);
      response.send({error:err});
    } else {
      // Generate a random uuid and hash it to use as access token.
      var accesstoken = sha1(uuidV4());
      mongowrap.saveToken(mongo, accesstoken, {username: request.query.username, application: "nightlife"}, function(err, result) {
        if (err) {
          console.log(err);
          response.send({error:err});
        } else {
          // Send profile and accesstoken to user
          response.send({profile: profile, accessToken: accesstoken});
        }
      })
    }
  }.bind(request))
})

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connected to mongodb');
    mongo = db;
    app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });
  }
});
