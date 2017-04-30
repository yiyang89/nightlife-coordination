var mongodb = require('mongodb');

// Collections: nlcusers, nlcbars, accesstokens

module.exports.crossreference = function(mongoConnection, dataarray, callback) {
  // Look for any existing entries with the same name and city.
  // Combine and return.
  console.log("crossreferencing");
  var returnarray = dataarray.slice();
  var orclause = returnarray.map(function(data) {
    return {name: data.name, display_address: data.display_address}
  });
  // console.log(orclause);
  mongoConnection.collection('nlcbars').find({$or: orclause}).toArray(function(err, resultarr) {
    if (err) {
      callback(err, null);
    } else {
      // Combine and return.
      resultarr.forEach(function(result) {
        for (var i = 0; i < returnarray.length; i++) {
          if (returnarray[i].name === result.name && returnarray[i].display_address === result.display_address) {
            returnarray[i].going = result.going;
          }
        }
      })
      callback(null, returnarray);
    }
  })
}

module.exports.updatetotoday = function(mongoConnection, datestring, dataarray, callback) {
  console.log("Updating to today with date: "+datestring);
  var orclause = dataarray.map(function(data) {
    return {name: data.name, display_address: data.display_address}
  });
  var multifilterclause = {$or: orclause};
  mongoConnection.collection('nlcbars').find(multifilterclause).toArray(function(err, resultarr) {
    tracker = 0;
    if (resultarr.length === 0) {
      callback(null, 'nothing to do');
    } else {
      resultarr.forEach(function(result) {
        // Strip any entries in the going array that do not match today's date.
        for (var i = result.going.length-1; i >= 0 ; i--) {
          if (result.going[i].date !== datestring) {
            result.going.splice(i,1);
          }
        }
        // If going is now empty, delete the entry from mongo.
        if (result.going.length === 0) {
          mongoConnection.collection('nlcbars').remove({name: result.name, display_address: result.display_address}, function(err, removeresult) {
            tracker++;
            if (tracker === resultarr.length) {
              callback(null, 'complete');
            }
          })
        } else {
          // Else update mongo
          mongoConnection.collection('nlcbars').update({name: result.name, display_address: result.display_address}, {$set: {going:result.going}}, function(err, updateresult) {
            tracker++;
            if (tracker === resultarr.length) {
              callback(null, 'complete');
            }
          })
        }
      })
    }
  })
}


module.exports.going = function(mongoConnection, date, username, bardata, callback) {
  // Look for existing entries for this bar using name/city
  // If exists, insert username with timestamp.
  // If does not exist, create it.
  var filterclause = {name: bardata.name, display_address: bardata.display_address};
  mongoConnection.collection('nlcbars').findOne(filterclause, function(err, findresult) {
    if (err) {
      callback(err, null);
    } else {
      if (findresult) {
        var userexists = false;
        findresult.going.forEach(function(goingmember) {
          if (goingmember.name === username) {
            userexists = true;
          }
        })
        if (userexists) {
          callback("User is already going today", null);
        } else {
          var newgoing = findresult.going.slice();
          newgoing.push({name:username, date:date});
          mongoConnection.collection('nlcbars').update(filterclause, {$set: {going:newgoing}}, function(err, updateresult) {
            if (err) {
              callback(err, null);
            } else {
              mongoConnection.collection('nlcbars').findOne(filterclause, function(err, finalresult) {
                if (err) {
                  callback(err, null);
                } else {
                  callback(null, finalresult);
                }
              })
            }
          })
        }
      } else {
        bardata.going.push({name:username, date:date});
        mongoConnection.collection('nlcbars').insertOne(bardata, function(err, insertresult) {
          if (err) {
            callback(err, null);
          } else {
            console.log("Inserted nlcbars");
            mongoConnection.collection('nlcbars').findOne(filterclause, function(err, finalresult) {
              if (err) {
                callback(err, null);
              } else {
                callback(null, bardata);
              }
            })
          }
        })
      }
    }
  })
}

module.exports.notgoing = function(mongoConnection, date, username, bardata, callback) {
  // Look for existing entry for this bar (it should exist).
  // Update the entry.
  var filterclause = {name: bardata.name, display_address: bardata.display_address};
  mongoConnection.collection('nlcbars').findOne(filterclause, function(err, findresult) {
    if (err) {
      callback(err, null);
    } else {
      var newgoing = findresult.going.slice();
      // newgoing.push({name:username, date:date});
      // Find user index and splice him out of the going array.
      var index = null;
      for (var i = newgoing.length-1; i >= 0; i--) {
        if (newgoing[i].name === username) {
          index = i;
          break;
        }
      }
      if (index === null) {
        callback("User was already not going", null);
      } else {
        newgoing.splice(i, 1);
        mongoConnection.collection('nlcbars').update(filterclause, {$set: {going:newgoing}}, function(err, updateresult) {
          if (err) {
            callback(err, null);
          } else {
            mongoConnection.collection('nlcbars').findOne(filterclause, function(err, finalresult) {
              if (err) {
                callback(err, null);
              } else {
                callback(null, finalresult);
              }
            })
          }
        })
      }
    }
  })
}

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
