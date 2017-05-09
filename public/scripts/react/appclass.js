import React from "react";
import DropdownComponent from "./dropdownclass";
import SignUpComponent from "./signupclass";
import PopupComponent from "./popupclass";
import SearchAndListComponent from "./searchandlistclass";

class AppComponent extends React.Component{
  constructor(props) {
    super(props);

    this.hideAll = this.hideAll.bind(this);
    this.logout = this.logout.bind(this);
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.showsignup = this.showsignup.bind(this);
    this.showpopup = this.showpopup.bind(this);
    this.closepopup = this.closepopup.bind(this);

    var login = this.props.servertoken? true : false;
    if (login) {
      localStorage._nlc_accesstoken = this.props.servertoken;
    }

    this.state = {
      username: this.props.username,
      profile: null,
      location: null,
      accesstokenserver: this.props.servertoken,
      accesstokenlocal: localStorage._nlc_accesstoken,
      loggedin: true,
      showpopup: false,
      popuptext: '',
      showsignup: false
    }
  }

  componentDidMount() {
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
  }

  hideAll() {
    this.setState({
      showsignup: false
    })
  }

  logout() {
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
  }

  signup(signupname, passwordhash) {
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
          loggedin: true,
          showsignup: false
        })
      }
    }.bind(this))
  }

  login(username, passwordhash) {
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
  }

  showsignup() {
    this.hideAll();
    this.setState({showsignup: !this.state.showsignup});
  }

  showpopup(message) {
    this.setState({showpopup:true, popuptext:message});
  }

  closepopup() {
    this.setState({showpopup: false, popuptext:''});
  }

  render() {
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
}

export default AppComponent;
