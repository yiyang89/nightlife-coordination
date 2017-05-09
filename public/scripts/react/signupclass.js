import React from "react";

class SignUpComponent extends React.Component{
  constructor(props) {
    super(props);

    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeConfirm = this.handleChangeConfirm.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      username: '',
      password: '',
      confirmpassword: '',
      nomatch: false,
      emptyfields: false
    }
  }

  handleChangeUsername(event) {
    this.setState({username: event.target.value});
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value});
  }

  handleChangeConfirm(event) {
    this.setState({confirmpassword: event.target.value});
  }

  submit() {
    // Check that passwords match
    if (this.state.username.trim() === '' || this.state.password.trim() === '' || this.state.confirmpassword.trim() ===  '') {
      this.setState({emptyfields: true, nomatch: false});
    } else if (this.state.password !== this.state.confirmpassword) {
      this.setState({emptyfields: false, nomatch: true});
    } else {
      this.setState({emptyfields: false, nomatch: false});
      // Hash the password, send it to signupfunc with this username.
      // SHA-1 hashing compliments of https://github.com/emn178/js-sha1
      this.props.signupfunc(this.state.username, sha1(this.state.password), this.state.location, this.state.email, this.state.fullname);
    }
  }

  render() {
    return (
      <div className="Aligner card signup">
        <div className="card-contents grid-by-rows">
         <input type="text" placeholder="Create a username" value={this.state.username} onChange={this.handleChangeUsername} />
         <input type="password" placeholder="Create a password" value={this.state.password} onChange={this.handleChangePassword}/>
         <input type="password" placeholder="Confirm your password" value={this.state.confirmpassword} onChange={this.handleChangeConfirm}/>
         <button className="btn btn-info" onClick={this.submit}>Sign Up!</button>
       </div>
       {this.state.emptyfields? <div className="error">Please fill in all fields</div> :null}
       {this.state.nomatch? <div className="error">Passwords do not match</div> :null}
      </div>
    );
  }
}

export default SignUpComponent;
