var AppComponent = React.createClass({
  getInitialState: function() {
    var login = accessTokenFromServer? true : false;
    if (login) {
      localStorage._nlc_accesstoken = accessTokenFromServer;
    }
    return {
      username: username,
      profile: null,
      location: null,
      accesstokenserver: accessTokenFromServer,
      accesstokenlocal: localStorage._nlc_accesstoken,
      loggedin: true,
      showpopup: false,
      popuptext: '',
      showsignup: false
    }
  },
  componentWillMount: function() {
    console.log("Component mounted");
    if (localStorage._nlc_accesstoken) {
      console.log("Localstorage nlc accesstoken is not null");
      // User is currently logged in
      var params = "?&accesstoken="+localStorage._nlc_accesstoken;
      // tokendetails response will be bundled with bookresults.
      $.getJSON('/tokendetails/'+params, function(result) {
        console.log("fetched token details");
        this.setState({
          username: result.profile.username,
          profile: result.profile,
          location: result.profile.location,
          accesstokenserver: result.accessToken,
          accesstokenlocal: localStorage._nlc_accesstoken,
          loggedin: true,
          showsignup: false
        })
      }.bind(this))
    } else {
      this.setState({
        loggedin: false
      })
    }
  },
  hideAll: function() {
    this.setState({
      showsignup: false
    })
  },
  logout: function() {
    // Empty localstorage
    var params = "?&accesstoken="+this.state.accesstokenserver;
    $.getJSON('/logout/'+params, function(result) {
      localStorage.removeItem("_nlc_accesstoken");
      this.hideAll();
      this.setState({
        username: null,
        profile: null,
        accesstokenserver: null,
        accesstokenlocal: null,
        loggedin: false,
        showsignup: false
      });
      console.log("logged out.");
    }.bind(this));
  },
  signup: function(signupname, passwordhash) {
    var params = "?&username="+signupname+"&passwordhash="+passwordhash;
    $.getJSON('/signup/'+params, function(result) {
      if (result.error) {
        // TODO: Implement better error display
        alert("Error: "+result.error);
      } else {
        console.log("Logged in. Please check local storage to verify _nlc_accesstoken");
        localStorage._nlc_accesstoken = result.accessToken;
        this.setState({
          username: result.profile.username,
          profile: result.profile,
          accesstokenserver: result.accessToken,
          accesstokenlocal: localStorage._nlc_accesstoken,
          loggedin: true
        })
      }
    }.bind(this))
  },
  login: function(username, passwordhash) {
    var params = "?&username="+username+"&passwordhash="+passwordhash;
    $.getJSON('/login/'+params, function(result) {
      if (result.error) {
        alert("Error: "+result.error);
      } else {
        console.log("Logged in. Please check local storage to verify _nlc_accesstoken");
        localStorage._nlc_accesstoken = result.accessToken;
        this.setState({
          username: result.profile.username,
          profile: result.profile,
          accesstokenserver: result.accessToken,
          accesstokenlocal: localStorage._nlc_accesstoken,
          loggedin: true,
        });
      }
    }.bind(this))
  },
  showsignup: function() {
    this.hideAll();
    this.setState({showsignup: !this.state.showsignup});
  },
  showpopup: function(message) {
    this.setState({showpopup:true, popuptext:message});
  },
  closepopup: function() {
    this.setState({showpopup: false, popuptext:''});
  },
  render: function() {
    console.log("LOGGEDIN: " + this.state.loggedin);
    return (
      <div>
        <nav className="navbar navbar-toggleable-md navbar-dark cyan">
            <div className="container">
                <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNav1" aria-controls="navbarNav1" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <a className="navbar-brand" href="#" onClick={this.showall}>
                    <strong>Nightlife Coordination</strong>
                </a>
                <div className="collapse navbar-collapse" id="navbarNav1">
                    <ul className="navbar-nav mr-auto">
                    </ul>
                    {this.state.loggedin? null : <a className="nav-link" onClick={this.showsignup}>Sign Up</a>}
                    <DropdownComponent loggedin={this.state.loggedin} username={this.state.username} logoutfunc={this.logout} loginfunc={this.login}/>
                </div>
            </div>
        </nav>
        <div className="Aligner">
        {this.state.showsignup? <SignUpComponent signupfunc={this.signup}/> : null}
        {this.state.showpopup? <PopupComponent content={this.state.popuptext} closefunc={this.closepopup}/> : null}
        <SearchAndListComponent username={this.state.username} />
        </div>
      </div>
    );
  }
});
